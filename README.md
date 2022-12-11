# openai-caching-proxy-worker

Basic caching proxy for OpenAI API, deployable as a [Cloudflare Worker](https://workers.cloudflare.com/).

This can help you reduce your OpenAI costs (and get faster results) by returning cached responses for repeated requests.

It only caches `POST` requests that have a JSON request body, as these tend to be the slowest and are the only ones that cost money (for now).

### Setup

Clone the repo and install dependencies.

You will need to sign up for two services (which both have free tiers):

- [Cloudflare](https://www.cloudflare.com): Where our worker will be hosted.
- [Upstash](https://upstash.com): We use Upstash's redis-over-HTTP service for storing cached OpenAI responses. Depending on your usage, you may try replacing Redis with [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) instead which is eventually consistent but will likely provide better read latency.

Finally, set up your redis secrets based on instructions in `wrangler.toml`.

### Usage

Start the proxy server at http://localhost:8787 with:

```
yarn start
```

Then, in your separate project where you have your [openai/openai-node](https://github.com/openai/openai-node) configuration, pass in the new `basePath` so that it sends requests through your proxy rather than directly to OpenAI:

```diff
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
+ basePath: 'http://localhost:8787/proxy',
});
const openai = new OpenAIApi(configuration);
```

You can then try a few sample requests. The first will be proxied to OpenAI since a cached response isn't yet saved for it, but the second repeated/duplicate request will return the cached result instead.

```ts
const options = { model: 'text-ada-001', prompt: 'write a poem about computers' };

// This first request will be proxied as-is to OpenAI API, since a cached
// response does not yet exist for it:
const completion = await openai.createCompletion(options);
console.log('completion:', completion);

// This second request uses the same options, so it returns nearly instantly from
// local cache and does not make a request to OpenAI:
const completionCached = await openai.createCompletion(options);
console.log('completionCached:', completionCached);
```

### Specifying a cache TTL

If you don't want to indefinitely cache results, or you don't have an eviction policy set up on your redis instance, you can specify a TTL in seconds using the `X-Proxy-TTL` header.

```diff
const configuration = new Configuration({
  ...
+ baseOptions: {
+   // In this example, specify a cache TTL of 24 hours before it expires:
+   headers: { 'X-Proxy-TTL': 60 * 60 * 24 }
+ }
});
```

### Refreshing the cache

If you need to force refresh the cache, you can use the header `X-Proxy-Refresh`. This will fetch a new response from OpenAI and cache this new response.

```diff
const configuration = new Configuration({
  ...
+ baseOptions: {
+   headers: { 'X-Proxy-Refresh': 'true' }
+ }
});
```

### Samples

See `/samples/sample-usage.ts` for a full example of how to call this proxy with your openai client.
