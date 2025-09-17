import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import omitBy from 'lodash/omitBy.js';

export type Repository = RestEndpointMethodTypes['repos']['get']['response']['data'];

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
        if (error.status === 404) return { data: null };
        throw error;
      });

      return (
        data &&
        (omitBy(
          data,
          (v) => v === null || v === undefined || (typeof v === 'string' && v.startsWith('https://api.github.com')),
        ) as Repository | null)
      );
    }),
  );
}
