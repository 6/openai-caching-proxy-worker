import { getHeadersAsObject } from './utils';

describe('utils', () => {
  describe('getHeadersAsObject', () => {
    it('returns Headers instance in Object format', () => {
      const sampleHeaders = new Headers({
        'content-type': 'application/json',
        Authorization: 'pedro martinez',
      });
      expect(getHeadersAsObject(sampleHeaders)).toEqual({
        authorization: 'pedro martinez',
        'content-type': 'application/json',
      });
    });
  });
});
