import {makeRedisConnection} from "../redis/makeRedisConnection.mjs";

export async function registerTraefikService() {
    try {
        const redis = makeRedisConnection();
        await redis.connect();

        await redis.set('traefik/http/services/turret/loadbalancer/servers/0/url', 'http://turret:8000/')
    } catch (e) {
        console.error({
            message: 'Traefik service registration failed.',
            error: e
        });
    }
}