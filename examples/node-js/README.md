### Example client usage

With `example.js`, you can test how openai-caching-proxy-worker works by running `wrangler dev` in one terminal
and `cd examples/node-js && node example.js`in another, then you can see in your local environment
how open-ai requests are executed using redis caching.
If you want to publish your local instance of openai-caching-proxy-worker to Cloudflare after running `wrangler publish`
you will get a working url, then add it in your local variable`.env` as PROXY_PATH and then you can try `example2.js`,
it has command line options, note that order is important

1. option model < text-ada-001 | text-davinci-003 >
2. the 'cacheYES' option <boolean> : string|any
3. option prompt - your question to chatGPT <string>

so execute like this
`node example2.js text-davinci-003 cacheNO 'is any difference between white dogs and black mice?'`

```markdown
R fresh:
Q:
is any difference between white dogs and black mice?
R:
Yes, there is a difference between white dogs and black mice. White...
```
