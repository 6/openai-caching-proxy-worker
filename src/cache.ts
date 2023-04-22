import { Redis } from '@upstash/redis/cloudflare';
import { Env } from './env';
import { getHeadersAsObject, objectHash } from './utils';

interface AnyObject {
  [key: string]: any;
}

function sortObjectKeys(obj: AnyObject): AnyObject {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: AnyObject = {};

  sortedKeys.forEach((key) => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      sortedObj[key] = sortObjectKeys(obj[key]);
    } else if (Array.isArray(obj[key])) {
      sortedObj[key] = obj[key].map((item: any) => {
        if (typeof item === 'object' && !Array.isArray(item)) {
          return sortObjectKeys(item);
        }
        return item;
      });
    } else {
      sortedObj[key] = obj[key];
    }
  });

  return sortedObj;
}

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
    let propValue = (props as any)[key];
    if (key === 'body' && propValue !== '') {
      try {
        const body = JSON.parse(propValue);
        const sortedBody: AnyObject = {};
        const sortedKeys = Object.keys(body).sort();
        sortedKeys.forEach((key) => {
          if (typeof body[key] === 'object' && !Array.isArray(body[key])) {
            sortedBody[key] = sortObjectKeys(body[key]);
          } else if (Array.isArray(body[key])) {
            sortedBody[key] = body[key].map((item: any) => {
              if (typeof item === 'object' && !Array.isArray(item)) {
                return sortObjectKeys(item);
              }
              return item;
            });
          } else {
            sortedBody[key] = body[key];
          }
        });
        propValue = JSON.stringify(sortedBody);
      } catch (_error) {
        propValue = '';
      }
    }
    if (propValue !== null && propValue !== '') {
      _acc[key] = propValue;
    }
    return _acc;
  }, {});
  const hash = objectHash(propsWithoutUndefined);
  return hash;
};

interface CachedResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export class ResponseCache {
  redis: Redis | undefined;
  kv: KVNamespace | undefined;

  constructor({ env }: { env: Env }) {
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });
    } else {
      this.kv = env.OPENAI_CACHE;
    }
  }

  read = async ({ cacheKey }: { cacheKey: string }): Promise<Response | null> => {
    let result;
    if (this.redis) {
      result = await this.redis.get(cacheKey);
    } else if (this.kv) {
      result = await this.kv.get(cacheKey);
    } else {
      return null;
    }
    if (result) {
      // Note: Upstash seems to automatically parse it to JSON:
      const cachedResponse =
        typeof result === 'string' ? JSON.parse(result as string) : (result as CachedResponse);
      return new Response(cachedResponse.body, {
        headers: cachedResponse.headers,
        status: cachedResponse.status,
      });
    }
    return null;
  };

  write = async ({
    cacheKey,
    response,
    ttl,
  }: {
    cacheKey: string;
    response: Response;
    ttl: number | null;
  }): Promise<void> => {
    const body = await response.clone().text();
    const responseObject = {
      status: response.status,
      headers: getHeadersAsObject(response.headers),
      body: body ? body : null,
    };
    if (this.redis) {
      const options = ttl != null ? { ex: ttl } : {};
      await this.redis.set(cacheKey, JSON.stringify(responseObject), options);
    } else if (this.kv) {
      const options = ttl != null ? { expirationTtl: ttl } : {};
      await this.kv.put(cacheKey, JSON.stringify(responseObject), options);
    }
  };
}
