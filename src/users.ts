import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { clearObject } from './utils/cleaner.js';

export type User = RestEndpointMethodTypes['users']['getByUsername']['response']['data'];

/**
 * Fetches user details for an array of GitHub usernames using Octokit.
 *
 * @param {Array<string>} users - An array of GitHub usernames to fetch.
 * @param {Octokit} client - An authenticated Octokit REST client instance.
 * @returns {Promise<Array<User | null>>} A promise that resolves to an array of user objects.
 */
export default async function getUsers(users: Array<string>, client: Octokit): Promise<Array<User | null>> {
  return Promise.all(
    users.map(async (username) => {
      const { data } = await client.rest.users.getByUsername({ username }).catch((error) => {
        if (error.status === 404) return { data: null };
        throw error;
      });
      return clearObject(data);
    }),
  );
}
