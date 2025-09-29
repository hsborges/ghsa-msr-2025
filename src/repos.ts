import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { clearObject } from './utils/cleaner.js';

export type Repository = RestEndpointMethodTypes['repos']['get']['response']['data'];
export type PartialRepository = RestEndpointMethodTypes['repos']['listForUser']['response']['data'][number];

/**
 * Fetches repository details for an array of GitHub repository names using Octokit.
 *
 * @param {Array<string>} names - An array of GitHub repository names in the format "owner/repo".
 * @param {Octokit} client - An authenticated Octokit REST client instance.
 * @returns {Promise<Array<Repository | null>>} A promise that resolves to an array of repository objects.
 */
export default async function getRepositories(
  names: Array<string>,
  client: Octokit,
): Promise<Array<Repository | null>> {
  return Promise.all(
    names.map(async (name) => {
      const [owner, repo] = name.split('/');
      const { data } = await client.rest.repos.get({ owner, repo }).catch((error) => {
        if ([404, 451].includes(error.status)) return { data: null };
        throw error;
      });

      return clearObject(data);
    }),
  );
}

export async function getOwnedRepositories(
  username: string,
  client: Octokit,
): Promise<Array<PartialRepository> | null> {
  try {
    const repos: Array<PartialRepository> = [];
    for await (const response of client.paginate.iterator(client.rest.repos.listForUser, {
      username,
      per_page: 100,
      type: 'all',
    })) {
      repos.push(...clearObject(response.data));
    }
    return repos;
  } catch (error) {
    if (typeof error === 'object' && (error as { status?: number }).status !== 404) throw error;
    return null;
  }
}
