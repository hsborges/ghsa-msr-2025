import { retry } from '@octokit/plugin-retry';
import { Octokit } from '@octokit/rest';
import fetch from 'make-fetch-happen';
import env from './utils/env.js';

export default new (Octokit.plugin(retry))({
  baseUrl: env.GITHUB_API_URL,
  auth: env.GITHUB_TOKEN && `token ${env.GITHUB_TOKEN}`,
  request: { fetch: fetch.defaults({ cachePath: env.CACHE_PATH, cache: env.CACHE_STRATEGY }) },
});
