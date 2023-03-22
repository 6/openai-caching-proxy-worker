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
        body: '{"ok":true}',
      };
      const result = await getCacheKey(params);
      expect(utils.objectHash).toHaveBeenCalledWith(params);
      expect(result).toEqual('de8cb85a7a697a5ee1458b31857c4db1c94760b2a14681052170bed55bf6db1b');
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

    it('returns a same hash uniquely representing the params when body has different order', async () => {
      let params = {
        method: 'POST',
        path: '/v1/completions',
        authHeader: null,
        body: '{"key1":"1","key2":"2"}',
      };
      let result = await getCacheKey(params);
      expect(result).toEqual('91b1af0c3f20778905ab588460bcb1d14b4621445f32fd871d7fe23056142923');

      params = {
        method: 'POST',
        path: '/v1/completions',
        authHeader: null,
        body: '{"key2":"2","key1":"1"}',
      };
      result = await getCacheKey(params);
      expect(result).toEqual('91b1af0c3f20778905ab588460bcb1d14b4621445f32fd871d7fe23056142923');
    });

    it('returns a different hash uniquely representing the params when body has different values', async () => {
      let params = {
        method: 'POST',
        path: '/v1/chat/completions',
        authHeader: null,
        body: '{"model": "gpt-4", "messages": [{"role": "user","content": "Example 1"}]}',
        moderation: true,
      };
      let result = await getCacheKey(params);
      expect(result).toEqual('ca1346d5b14a10b852c82502d525ef5d081c5068dc40c1d451e13cfc22417af1');

      params = {
        method: 'POST',
        path: '/v1/chat/completions',
        authHeader: null,
        body: '{"model": "gpt-4", "messages": [{"role": "user","content": "Example 2"}]}',
        moderation: true,
      };
      result = await getCacheKey(params);
      expect(result).toEqual('433436d4185941ab1f0d2158e94c93167d7d154a052f96dda81b0e7fa5560eaa');
    });

  });
});
