import {Redis} from 'ioredis';

export function makeRedisConnection(): Redis {
    console.log(process.env.REDIS_URL)
    return new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        lazyConnect: true,
    });
}