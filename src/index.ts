import consola from 'consola';
import mapValues from 'lodash/mapValues.js';
import uniq from 'lodash/uniq.js';
import uniqBy from 'lodash/uniqBy.js';
import getAdvisores from './advisories.js';
import getFollowers from './followers.js';
import getRepositories, { getOwnedRepositories } from './repos.js';
import getUsers from './users.js';
import octokit from './utils/client.js';
import { writeToNdjsonFile } from './utils/files.js';

(async () => {
  consola.start('Iniciando coleta de advisories de segurança do GitHub...');
  let advisories = await getAdvisores(octokit);
  consola.success(`Coletados ${advisories.length} advisories.`);
  await writeToNdjsonFile('./data/advisories.ndjson', advisories);
  consola.info('Advisories salvos em data/advisories.ndjson');

  consola.start('Extraindo e coletando repositórios relacionados...');
  const reposToGet = uniq(
    advisories
      .flatMap((adv) => adv.repository_advisory_url?.split('/').slice(-4).slice(0, 2).join('/'))
      .filter(Boolean) as string[],
  );

  let repositories = await getRepositories(reposToGet, octokit);
  consola.success(`Coletados ${repositories.filter(Boolean).length} repositórios.`);
  await writeToNdjsonFile('./data/repositories.ndjson', repositories.filter(Boolean));
  consola.info('Repositórios salvos em data/repositories.ndjson');

  consola.start('Extraindo e coletando usuários e organizações...');
  const usersToGet = uniq(
    advisories
      .flatMap((adv) => adv.credits?.map((credit) => credit.user.login))
      .concat(repositories.map((repo) => repo?.owner.login))
      .concat(repositories.map((repo) => repo?.organization?.login))
      .filter(Boolean) as string[],
  );

  advisories = [];
  repositories = [];
  if (global.gc) global.gc();

  consola.start('Extraindo e coletando repositórios dos usuários/organizações...');
  let usersRepositories = (
    await Promise.all(
      usersToGet.map(async (username) => {
        const repos = await getOwnedRepositories(username, octokit);
        return (
          repos && {
            [username]: repos!.filter(Boolean).map((r) => r.full_name),
          }
        );
      }),
    )
  ).reduce((acc: Record<string, string[]>, cur) => (cur ? { ...acc, ...cur } : acc), {});

  await writeToNdjsonFile(
    './data/users_repositories.ndjson',
    await getRepositories(uniq(Object.values(usersRepositories).flat()), octokit),
  );

  await writeToNdjsonFile(
    './data/users_repositories_map.ndjson',
    Object.entries(usersRepositories).map(([user, repositories]) => ({
      user,
      repositories,
    })),
  );
  consola.info('Repositórios dos usuários/organizações salvos em data/users_repositories_map.ndjson');

  usersRepositories = {};
  if (global.gc) global.gc();

  const users = await getUsers(usersToGet, octokit);
  consola.success(`Coletados ${users.length} usuários/organizações.`);

  consola.start('Extraindo e coletando seguidores...');
  const followers = await getFollowers(usersToGet, octokit);
  await writeToNdjsonFile(
    './data/followers.ndjson',
    Object.entries(mapValues(followers, (v) => v.map((u) => u.login))).map(([user, followers]) => ({
      user,
      followers,
    })),
  );
  consola.info('Seguidores salvos em data/followers.ndjson');

  await writeToNdjsonFile(
    './data/users.ndjson',
    uniqBy([...users, ...Object.values(followers).flat()], 'login').filter(Boolean),
  );
  consola.info('Usuários salvos em data/users.ndjson');

  consola.box('Coleta finalizada com sucesso!');
})();
