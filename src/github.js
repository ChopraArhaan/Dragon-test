import { Octokit } from '@octokit/rest';
import { computeStreaks, buildContributionMap } from './streak.js';
import {
  dateKeyInZone,
  trailingStartKey,
  startOfWeekKey,
  parseGitHubDate,
  elapsedDays
} from './time.js';

const LANGUAGE_COLORS = {
  '1C Enterprise': '#814CCC',
  'ASP.NET': '#9400FF',
  'C': '#555555',
  'C#': '#178600',
  'C++': '#F34B7D',
  Clojure: '#DB5855',
  CoffeeScript: '#244776',
  CSS: '#663399',
  Dart: '#00B4AB',
  Dockerfile: '#384D54',
  Elixir: '#6E4A7E',
  Go: '#00ADD8',
  Haskell: '#5E5086',
  HTML: '#E34C26',
  Java: '#B07219',
  JavaScript: '#F1E05A',
  Julia: '#A270BA',
  Jupyter: '#DA5B0B',
  Kotlin: '#A97BFF',
  Lua: '#000080',
  MDX: '#FCB32C',
  'Objective-C': '#438EFF',
  OCaml: '#EF7A08',
  Perl: '#0298C3',
  PHP: '#4F5D95',
  PowerShell: '#012456',
  Python: '#3572A5',
  R: '#198CE7',
  Ruby: '#701516',
  Rust: '#DEA584',
  Scala: '#C22D40',
  SCSS: '#C6538C',
  Shell: '#89E051',
  Svelte: '#FF3E00',
  Swift: '#F05138',
  TypeScript: '#3178C6',
  Vue: '#41B883',
  Zig: '#EC915C'
};

const CONTRIBUTION_META_QUERY = `
  query($login: String!) {
    user(login: $login) {
      createdAt
      contributionsCollection {
        contributionYears
      }
    }
  }
`;

const CONTRIBUTION_YEAR_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

const REVIEWS_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalPullRequestReviewContributions
      }
    }
  }
`;

function warning(err) {
  const message = err?.response?.data?.message || err?.message || String(err);
  return message.length > 240 ? `${message.slice(0, 237)}...` : message;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function safe(label, fn, warnings) {
  try {
    return await fn();
  } catch (error) {
    warnings.push(`${label}: ${warning(error)}`);
    return null;
  }
}

function pushCount(event) {
  if (event?.type !== 'PushEvent') return 0;
  const size = Number(event.payload?.size);
  if (Number.isFinite(size) && size > 0) return size;
  return Array.isArray(event.payload?.commits) ? event.payload.commits.length : 0;
}

async function collectEventsFallback(octokit, login, now, timeZone, warnings) {
  const events = await safe(
    'public events fallback',
    () =>
      octokit.paginate(octokit.rest.activity.listEventsForUser, {
        username: login,
        per_page: 100
      }),
    warnings
  );
  if (!events) {
    return {
      commitsToday: 0,
      commits7d: 0,
      calendarDays: [],
      latestCommit: null
    };
  }

  const cutoff = now.getTime() - 90 * 24 * 60 * 60 * 1000;
  const todayKey = dateKeyInZone(now, timeZone);
  const sevenDayStart = trailingStartKey(now, timeZone, 7);
  const counts = new Map();
  let latest = null;

  for (const event of events) {
    const eventTime = Date.parse(event.created_at);
    if (Number.isNaN(eventTime) || eventTime < cutoff) continue;
    const key = dateKeyInZone(new Date(eventTime), timeZone);
    const count = pushCount(event);
    if (count > 0) counts.set(key, (counts.get(key) || 0) + count);

    for (const commit of event.payload?.commits || []) {
      const parsed = parseGitHubDate(commit.author?.date || commit.committer?.date);
      if (parsed && (!latest || parsed.timestamp > latest.timestamp)) {
        latest = {
          ...parsed,
          sha: commit.sha,
          message: (commit.message || '').split('\n')[0],
          repo: event.repo?.name || '',
          url: `https://github.com/${event.repo?.name || ''}/commit/${commit.sha || ''}`
        };
      }
    }
  }

  let commitsToday = 0;
  let commits7d = 0;
  for (const [key, count] of counts) {
    if (key === todayKey) commitsToday += count;
    if (key >= sevenDayStart) commits7d += count;
  }

  return {
    commitsToday,
    commits7d,
    calendarDays: [...counts.entries()].map(([date, contributionCount]) => ({ date, contributionCount })),
    latestCommit: latest
  };
}

async function fetchCommitSearch(octokit, login, todayKey, warnings) {
  const sevenDayStart = trailingStartKeyFromKey(todayKey, 6);
  const broadStart = trailingStartKeyFromKey(todayKey, 7);
  const common = { per_page: 100, sort: 'committer-date', order: 'desc' };
  const [weekResult, latestResult] = await Promise.all([
    safe(
      'commit search (7 days)',
      () =>
        octokit.rest.search.commits({
          q: `author:${login} author-date:>=${broadStart}`,
          ...common
        }),
      warnings
    ),
    safe(
      'commit search (latest)',
      () =>
        octokit.rest.search.commits({
          q: `author:${login}`,
          per_page: 1,
          sort: 'committer-date',
          order: 'desc'
        }),
      warnings
    )
  ]);

  const items = weekResult?.data?.items || [];
  const parsedItems = items
    .map((item) => {
      const parsed = parseGitHubDate(item.commit?.author?.date || item.commit?.committer?.date);
      return parsed ? { item, parsed } : null;
    })
    .filter(Boolean);

  const todayItems = parsedItems.filter(({ parsed }) => parsed.localDate === todayKey);
  const sevenDayItems = parsedItems.filter(({ parsed }) => parsed.localDate >= sevenDayStart);
  const commitsToday = todayItems.length;
  const commits7d = weekResult
    ? Number(weekResult.data.total_count) <= items.length
      ? sevenDayItems.length
      : Number(weekResult.data.total_count) || sevenDayItems.length
    : 0;

  let item = latestResult?.data?.items?.[0];
  if (!item) item = items[0];
  let latestCommit = null;
  if (item) {
    const parsed = parseGitHubDate(item.commit?.author?.date || item.commit?.committer?.date);
    if (parsed) {
      latestCommit = {
        ...parsed,
        sha: item.sha,
        message: (item.commit?.message || '').split('\n')[0],
        repo: item.repository?.full_name || '',
        url: item.html_url
      };
    }
  }

  if (weekResult == null) return null;
  return {
    commitsToday,
    commits7d,
    latestCommit
  };
}

function trailingStartKeyFromKey(key, daysBack) {
  const [year, month, day] = key.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day - daysBack));
  return d.toISOString().slice(0, 10);
}

async function collectContributions(octokit, login, now, warnings) {
  const meta = await safe(
    'contributions metadata',
    () => octokit.graphql(CONTRIBUTION_META_QUERY, { login }),
    warnings
  );
  if (!meta?.user) return null;

  const createdYear = new Date(meta.user.createdAt).getUTCFullYear();
  const thisYear = now.getUTCFullYear();
  const years = meta.user.contributionsCollection?.contributionYears?.length
    ? meta.user.contributionsCollection.contributionYears
    : Array.from({ length: thisYear - createdYear + 1 }, (_, index) => createdYear + index);

  const yearResults = await mapLimit(years, 4, async (year) => {
    const from = `${year}-01-01T00:00:00Z`;
    const to = year === thisYear ? now.toISOString() : `${year + 1}-01-01T00:00:00Z`;
    const result = await safe(
      `contributions ${year}`,
      () => octokit.graphql(CONTRIBUTION_YEAR_QUERY, { login, from, to }),
      warnings
    );
    return { year, result };
  });

  const days = [];
  let totalCommits = 0;
  let yearsLoaded = 0;
  for (const { result } of yearResults) {
    const collection = result?.user?.contributionsCollection;
    if (!collection) continue;
    yearsLoaded += 1;
    totalCommits += Number(collection.totalCommitContributions) || 0;
    for (const week of collection.contributionCalendar?.weeks || []) {
      for (const day of week.contributionDays || []) days.push(day);
    }
  }

  if (yearsLoaded === 0) return null;
  return { totalCommits, days };
}

async function collectLanguages(octokit, repos, warnings) {
  const candidates = repos
    .filter((repo) => !repo.fork && repo.size > 0)
    .slice(0, 30);
  const results = await mapLimit(candidates, 5, async (repo) => {
    const [owner, name] = repo.full_name.split('/');
    const languages = await safe(
      `languages ${repo.full_name}`,
      () => octokit.rest.repos.listLanguages({ owner, repo: name }),
      warnings
    );
    return { repo, languages: languages?.data || {} };
  });

  const totals = new Map();
  for (const { languages } of results) {
    for (const [name, bytes] of Object.entries(languages)) {
      totals.set(name, (totals.get(name) || 0) + (Number(bytes) || 0));
    }
  }

  let totalBytes = 0;
  for (const bytes of totals.values()) totalBytes += bytes;

  if (totals.size === 0 || totalBytes === 0) {
    const counts = new Map();
    for (const repo of repos) {
      if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    return {
      name: sorted[0][0],
      percent: Math.round((sorted[0][1] / repos.length) * 100),
      bytes: null,
      color: LANGUAGE_COLORS[sorted[0][0]] || '#8B9CB8'
    };
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  return {
    name: sorted[0][0],
    percent: Math.round((sorted[0][1] / totalBytes) * 100),
    bytes: sorted[0][1],
    color: LANGUAGE_COLORS[sorted[0][0]] || '#8B9CB8',
    top: sorted.slice(0, 4).map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / totalBytes) * 100),
      color: LANGUAGE_COLORS[name] || '#8B9CB8'
    }))
  };
}

async function countSearch(octokit, q, label, warnings) {
  const result = await safe(
    label,
    () => octokit.rest.search.issuesAndPullRequests({ q, per_page: 1 }),
    warnings
  );
  return result == null ? 0 : Number(result.data.total_count) || 0;
}

async function collectWeekly(octokit, login, now, timeZone, token, warnings) {
  const weekStart = startOfWeekKey(now, timeZone);
  const [prsOpened, prsMerged, issuesClosed, reviewResult] = await Promise.all([
    countSearch(
      octokit,
      `is:pr author:${login} created:>=${weekStart}`,
      'search PRs opened',
      warnings
    ),
    countSearch(
      octokit,
      `is:pr author:${login} merged:>=${weekStart}`,
      'search PRs merged',
      warnings
    ),
    countSearch(
      octokit,
      `is:issue author:${login} closed:>=${weekStart}`,
      'search issues closed',
      warnings
    ),
    safe(
      'reviews this week',
      () =>
        octokit.graphql(REVIEWS_QUERY, {
          login,
          from: `${weekStart}T00:00:00Z`,
          to: now.toISOString()
        }),
      warnings
    )
  ]);

  let reviews = Number(
    reviewResult?.user?.contributionsCollection?.totalPullRequestReviewContributions
  );
  if (!Number.isFinite(reviews)) {
    reviews = await countSearch(
      octokit,
      `is:pr reviewed-by:${login} updated:>=${weekStart}`,
      'search reviews (fallback)',
      warnings
    );
  }

  return {
    weekStart,
    prsOpened,
    prsMerged,
    issuesClosed,
    reviews
  };
}

export async function collectGitHubData({ token, login, now, timeZone }) {
  if (!token) throw new Error('No GitHub token. Set GITHUB_TOKEN or PET_TOKEN.');
  if (!login) throw new Error('No GitHub username. Set PET_USERNAME or GITHUB_REPOSITORY_OWNER.');

  const octokit = new Octokit({
    auth: token,
    userAgent: 'github-profile-dragon/1.0'
  });

  const warnings = [];
  const warningsCapture = warnings;
  const userResult = await octokit.rest.users.getByUsername({ username: login });
  const user = userResult.data;

  const repos = await octokit.paginate(
    octokit.rest.repos.listForUser,
    {
      username: login,
      type: 'owner',
      per_page: 100,
      sort: 'pushed'
    },
    (response) => response.data
  );

  const ownedRepos = repos.filter((repo) => !repo.fork);
  const totalStars = ownedRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

  const todayKey = dateKeyInZone(now, timeZone);
  const [commitSearch, contributions, language, weekly] = await Promise.all([
    fetchCommitSearch(octokit, login, todayKey, warningsCapture),
    collectContributions(octokit, login, now, warningsCapture),
    collectLanguages(octokit, ownedRepos, warningsCapture),
    collectWeekly(octokit, login, now, timeZone, token, warningsCapture)
  ]);

  let commitData = commitSearch;
  if (!commitData) {
    commitData = await collectEventsFallback(octokit, login, now, timeZone, warningsCapture);
    warningsCapture.push('Commit search unavailable; today/7-day counts came from public events.');
  }

  let calendarDays = contributions?.days || [];
  let totalCommits = contributions?.totalCommits;
  let streakSource = 'contributions graph';

  if (!calendarDays.length) {
    const eventsFallback = await collectEventsFallback(octokit, login, now, timeZone, warningsCapture);
    calendarDays = eventsFallback.calendarDays;
    streakSource = 'recent public events';
    if (totalCommits == null) totalCommits = commitData.commits7d;
  }

  const contributionMap = buildContributionMap(calendarDays);
  const streaks = computeStreaks(contributionMap, todayKey);
  const latest = commitData.latestCommit;
  const daysSinceLastCommit = latest ? elapsedDays(latest.timestamp, now) : null;

  if (totalCommits == null) {
    totalCommits = Math.max(commitData.commits7d, streaks.activeDays);
    warningsCapture.push('Lifetime commit count unavailable; using a best-effort fallback.');
  }

  return {
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    followers: user.followers || 0,
    publicRepos: user.public_repos || 0,
    totalStars,
    totalCommits,
    commitsToday: commitData.commitsToday,
    commits7d: commitData.commits7d,
    currentStreak: streaks.current,
    longestStreak: Math.max(streaks.longest, streaks.current),
    activeDays: streaks.activeDays,
    daysSinceLastCommit,
    latestCommit: latest
      ? {
          ...latest,
          daysAgo: daysSinceLastCommit
        }
      : null,
    weekly,
    language,
    streakSource,
    contributionDays: contributionMap.size,
    warnings
  };
}
