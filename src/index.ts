import { retry } from '@octokit/plugin-retry';
import { Octokit } from '@octokit/rest';
import uniq from 'lodash/uniq.js';
import fetch from 'make-fetch-happen';
import getAdvisores from './advisories.js';
import getRepositories from './repos.js';
import getUsers from './users.js';
import { writeToFile } from './utils/files.js';

const octokit = new (Octokit.plugin(retry))({
  baseUrl: 'http://localhost:3000',
  request: { fetch: fetch.defaults({ cachePath: './.cache' }) },
});

(async () => {
  const advisories = await getAdvisores(octokit);
  await writeToFile('./data/advisories.json', advisories);

  const reposToGet = advisories
    .flatMap((adv) => adv.repository_advisory_url?.split('/').slice(-4).slice(0, 2).join('/'))
    .filter(Boolean) as string[];

  const repositories = await getRepositories(uniq(reposToGet), octokit);
  await writeToFile('./data/repositories.json', repositories.filter(Boolean));

  const usersToGet = advisories
    .flatMap((adv) => adv.credits?.map((credit) => credit.user.login))
    .concat(repositories.map((repo) => repo?.owner.login))
    .concat(repositories.map((repo) => repo?.organization?.login))
    .filter(Boolean) as string[];

  const users = await getUsers(uniq(usersToGet), octokit);
  await writeToFile('./data/users.json', users.filter(Boolean));
})();
