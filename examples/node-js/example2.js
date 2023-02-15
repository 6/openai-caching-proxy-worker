// yet another basic demo usage for openai's node.js client with command line args and non-local worker.
// Run with:
// node example2.js
// With example.js, you can test how openai-caching-proxy-worker works by running `wrangler dev` in one terminal and
// `cd examples/node-js && node example.js` in another, then you can see in your local environment how requests
// to open-ai are executed using redis caching.
// If you want to publish your local instance of openai-caching-proxy-worker to Cloudflare after running `wrangler publish`
// you will get a working url, add it in your local variable .env PROXY_PATH and then you can try `example2.js`, it has command line options, note that order is important:
// 1. option model < text-ada-001 | text-davinci-003 | ...any suported by openAI >
// 2. the 'cacheYES' option <boolean> : string|any
// 3. option prompt - your question to chatGPT <string>

import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const proxyPath = process.env.PROXY_PATH;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY must be set');
  process.exit(1);
}

// cli args are following: 1. option model < text-ada-001 | text-davinci-003 > 2. option 'cacheYES' <boolean> : string|any 3. option prompt - question to chatGPT <string>
const args = process.argv.slice(2);
let model = '';
const prompt = '' || String(args.at(-1));
const cache = String(args.at(1)) === 'cacheYES' ? true : false;

const configuration = new Configuration({
  apiKey,
  // Set this to your local instance or Cloudflare deployment after doing `wrangler publish` and got cloudflare worker url to local .env PROXY_PATH variable
  basePath: proxyPath || `http://localhost:8787/proxy`,
  baseOptions: {
    headers: {
      // Cache responses for 3600 seconds (1 hour)
      'X-Proxy-TTL': 3600,
      // If you need to force refresh cache, you can uncomment below:
      'X-Proxy-Refresh': !cache,
    },
  },
});
const openai = new OpenAIApi(configuration);

switch (args[0]) {
  case 'text-ada-001':
    // cheap
    model = 'text-ada-001';
    break;
  case 'text-davinci-003':
    // overprice
    model = 'text-davinci-003';
    break;
  default:
    break;
}

const makeSampleRequests = async () => {
  const completionOpts = {
    model: model || 'text-ada-001',
    prompt: prompt || 'HOW MUCH IS 2 + 2 * 2 ?',
  };
  const completion = await openai.createCompletion(completionOpts);
  console.log(
    `${cache ? 'R from chache' : 'R fresh'}:\nQ:\n ${
      completionOpts.prompt
    }\nR:\n${completion.data.choices[0].text.trim()}`,
  );
};

const main = async () => {
  // The first time these requests are made, they should
  // be proxied as-is to OpenAI API:
  await makeSampleRequests();
};

main();
