// Return `Headers` as an Object:
type HeadersObject = Record<string, string>;
export const getHeadersAsObject = (headers: Headers): HeadersObject => {
  const headersObject: HeadersObject = {};
  for (const [key, value] of headers.entries()) {
    headersObject[key] = value;
  }
  return headersObject;
};

// Return a sha256 hash for a given Object:
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
