import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || '300'), // 5 minutos default
  checkperiod: 60,
});

export const getCache = (key: string): any => {
  return cache.get(key);
};

export const setCache = (key: string, value: any, ttl?: number): void => {
  cache.set(key, value, ttl || parseInt(process.env.CACHE_TTL || '300'));
};

export const clearCache = (pattern?: string): void => {
  if (pattern) {
    const keys = cache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => cache.del(key));
  } else {
    cache.flushAll();
  }
};

export default cache;

