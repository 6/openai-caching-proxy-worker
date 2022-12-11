import { getCacheKey } from './cache';
import * as utils from './utils';

describe('cache', () => {
  describe('getCacheKey', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'objectHash');
    });

    it('returns a hash uniquely representing the params', async () => {
      const params = {
        method: 'POST',
        path: '/v1/completions',
        authHeader: 'api-key-!',
        body: '{ "ok": true }',
      };
      const result = await getCacheKey(params);
      expect(utils.objectHash).toHaveBeenCalledWith(params);
      expect(result).toEqual('1a97143b720b3d82cf93a34a5a02c61de1492b18d813f4f1859251eef1a738be');
    });

    it('removes null or empty values', async () => {
      const params = {
        method: 'POST',
        path: '/v1/completions',
        authHeader: null,
        body: '',
      };
      const result = await getCacheKey(params);
      expect(utils.objectHash).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/completions',
      });
      expect(result).toEqual('771798e93f4fbad36b4c89cd88d3752383224caf8e585661dc174feb25939f75');
    });
  });
});
