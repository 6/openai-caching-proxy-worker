type HeadersObject = Record<string, string>;

export const getHeadersAsObject = (headers: Headers): HeadersObject => {
  const headersObject: HeadersObject = {};
  for (const [key, value] of headers.entries()) {
    headersObject[key] = value;
  }
  return headersObject;
};
