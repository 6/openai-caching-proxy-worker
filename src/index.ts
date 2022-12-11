export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);
    const ttl = request.headers.get('X-Proxy-TTL');

    const isProxyRequest =
      request.method === 'POST' &&
      request.headers.get('content-type') === 'application/json' &&
      ttl !== '0';

    if (isProxyRequest) {
      return await handleProxy({ request, env, ctx, ttl, pathname });
    }

    // Fallback response when not proxying (healthcheck)
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },
};

interface HandleProxyOpts {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
  ttl: string | null;
  pathname: string;
}
const handleProxy = async ({
  request,
  env,
  ctx,
  ttl,
  pathname,
}: HandleProxyOpts): Promise<Response> => {
  const cacheKey = 'todo';
  const cachedResponse = await getCachedResponse({ cacheKey });
  if (cachedResponse) {
    console.log('Returning cached response.');
    return cachedResponse;
  }

  console.log('No cached response found. Proxying and caching response instead.');

  const fetchUrl = `https://api.openai.com/v1${pathname.replace(/^\/proxy/, '')}`;

  const fetchHeaders: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    fetchHeaders[key] = value;
  }

  const response = await fetch(fetchUrl, {
    method: request.method,
    headers: fetchHeaders,
    body: request.body,
  });

  return response;
};

const getCachedResponse = async ({ cacheKey }: { cacheKey: string }): Promise<Response | null> => {
  // for (const [key, value] of Object.entries(cachedResponse.headers)) {
  // 	res.setHeader(key, value);
  // }
  // return res.status(cachedResponse.status).send(cachedResponse.body);
  return null;
};
