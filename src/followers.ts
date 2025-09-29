import { Octokit } from '@octokit/rest';
import getUsers, { User } from './users.js';
import { collectAsyncIterator } from './utils/iterators.js';

export type FollowersList = Record<string, Array<User>>;

/**
 * Fetches followers details for an array of GitHub usernames using Octokit.
 *
 * @param {Array<string>} users - An array of GitHub usernames to fetch their followers.
 * @param {Octokit} client - An authenticated Octokit REST client instance.
 * @returns {Promise<FollowersList>} A promise that resolves to a record mapping usernames to their followers' user objects.
 */
export default async function getFollowers(users: Array<string>, client: Octokit): Promise<FollowersList> {
  const followers = await Promise.all(
    users.map(async (username) => {
      return collectAsyncIterator(
        client.paginate.iterator(client.rest.users.listFollowersForUser, { username, per_page: 100 }),
      )
        .then(async (followers) => {
          const users = await getUsers(
            followers.flatMap((page) => page.data.map((user) => user.login)),
            client,
          );

          return [username, users.filter(Boolean) as Array<User>];
        })
        .catch((error) => {
          if ([403, 404].includes(error.status)) return [username, []];
          throw error;
        });
    }),
  );

  return Object.fromEntries(followers);
}
