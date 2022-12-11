import { getHeadersAsObject } from './utils';

export const objectHash = async (obj: Record<string, any>): Promise<string> => {
  const stringifiedObj = JSON.stringify(obj);
  const arrayBuffer = await crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    new TextEncoder().encode(stringifiedObj),
  );
  // https://github.com/cmackenzie1/holster/tree/main/workers/hash
  return [...new Uint8Array(arrayBuffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

interface GetCacheKeyProps {
  method: string;
  path: string;
  authHeader: string | null;
  body: string | null;
}
export const getCacheKey = async (props: GetCacheKeyProps): Promise<string> => {
  // https://stackoverflow.com/a/40924449
  const propsWithoutUndefined = Object.keys(props).reduce((acc, key) => {
    const _acc: Record<string, any> = acc;
    const propValue = (props as any)[key];
    if (propValue != null && propValue !== '') {
      _acc[key] = propValue;
    }
    return _acc;
  }, {});
  const hash = objectHash(propsWithoutUndefined);
  return hash;
};

interface GetCachedResponseProps {
  cacheKey: string;
}
export const getCachedResponse = async ({
  cacheKey,
}: GetCachedResponseProps): Promise<Response | null> => {
  // for (const [key, value] of Object.entries(cachedResponse.headers)) {
  // 	res.setHeader(key, value);
  // }
  // return res.status(cachedResponse.status).send(cachedResponse.body);
  return null;
};

interface WriteCachedResponseProps {
  cacheKey: string;
  ttl: number | null;
  response: Response;
}
export const writeCachedResponse = async ({
  cacheKey,
  ttl,
  response,
}: WriteCachedResponseProps): Promise<void> => {
  const responseObject = {
    status: response.status,
    headers: getHeadersAsObject(response.headers),
    // TODO: might be able to do ctx.waitUntil:
    // https://developers.cloudflare.com/workers/examples/cache-api
    body: await response.clone().text(),
  };
  console.log('TODO: cache this!', responseObject);
  // const client = await getClient();
  // const options = ttl != null ? { EX: ttl } : {};
  // await client.set(cacheKey, JSON.stringify(response), options);
  return;
};
