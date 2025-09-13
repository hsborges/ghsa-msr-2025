import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { collectAsyncIterator } from './utils/iterators.js';

export type Advisory = RestEndpointMethodTypes['securityAdvisories']['listGlobalAdvisories']['response']['data'][0];

/**
 * Fetches all global GitHub security advisories using Octokit pagination.
 *
 * @param {Octokit} client - An authenticated Octokit REST client instance.
 * @returns {Promise<Array<Advisory>>} A promise that resolves to an array of advisory objects.
 */
export default async function getAdvisores(client: Octokit): Promise<Array<Advisory>> {
  const it = client.paginate.iterator(client.rest.securityAdvisories.listGlobalAdvisories, {
    per_page: 100,
  });

  return collectAsyncIterator(it).then((pages) => pages.flatMap((page) => page.data));
}
