import { getCacheKey } from './cache';
import { objectHash } from './utils';

jest.mock('./utils.ts');

describe('cache', () => {
  describe('getCacheKey', () => {
    beforeEach(() => {
      (objectHash as jest.Mock).mockReturnValue('unique-sha-hash');
    });

    it('returns a hash uniquely representing the params', async () => {
      const params = {
        method: 'POST',
        path: '/v1/completions',
        authHeader: 'api-key',
        body: '{ "ok": true }',
      };
      const result = await getCacheKey(params);
      expect(objectHash).toHaveBeenCalledWith(params);
      expect(result).toEqual('unique-sha-hash');
    });

    it('removes null or empty values', async () => {
      const params = {
        method: 'POST',
        path: '/v1/completions',
        authHeader: null,
        body: '',
      };
      const result = await getCacheKey(params);
      expect(objectHash).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/completions',
      });
      expect(result).toEqual('unique-sha-hash');
    });
  });
});
