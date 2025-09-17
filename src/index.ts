import consola from 'consola';
import mapValues from 'lodash/mapValues.js';
import uniq from 'lodash/uniq.js';
import uniqBy from 'lodash/uniqBy.js';
import getAdvisores from './advisories.js';
import octokit from './client.js';
import getFollowers from './followers.js';
import getRepositories from './repos.js';
import getUsers from './users.js';
import { writeToNdjsonFile } from './utils/files.js';

(async () => {
  consola.start('Iniciando coleta de advisories de segurança do GitHub...');
  const advisories = await getAdvisores(octokit);
  consola.success(`Coletados ${advisories.length} advisories.`);
  await writeToNdjsonFile('./data/advisories.ndjson', advisories);
  consola.info('Advisories salvos em data/advisories.ndjson');

  consola.start('Extraindo e coletando repositórios relacionados...');
  const reposToGet = advisories
    .flatMap((adv) => adv.repository_advisory_url?.split('/').slice(-4).slice(0, 2).join('/'))
    .filter(Boolean) as string[];

  const repositories = await getRepositories(uniq(reposToGet), octokit);
  consola.success(`Coletados ${repositories.filter(Boolean).length} repositórios.`);
  await writeToNdjsonFile('./data/repositories.ndjson', repositories.filter(Boolean));
  consola.info('Repositórios salvos em data/repositories.ndjson');

  consola.start('Extraindo e coletando usuários e organizações...');
  const usersToGet = advisories
    .flatMap((adv) => adv.credits?.map((credit) => credit.user.login))
    .concat(repositories.map((repo) => repo?.owner.login))
    .concat(repositories.map((repo) => repo?.organization?.login))
    .filter(Boolean) as string[];

  const users = await getUsers(uniq(usersToGet), octokit);
  consola.success(`Coletados ${users.filter(Boolean).length} usuários/organizações.`);

  consola.start('Extraindo e coletando seguidores...');
  const followers = await getFollowers(uniq(usersToGet), octokit);
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
    uniqBy([...users, ...Object.values(followers).flat()].filter(Boolean), 'login'),
  );
  consola.info('Usuários salvos em data/users.ndjson');

  consola.box('Coleta finalizada com sucesso!');
})();
