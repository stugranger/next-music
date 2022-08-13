import { createClient } from 'redis';

import env from '@next-music/server/environment';

declare global {
	var _redisClient: RedisClient | undefined;
}

export type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient;

if (env.NODE_ENV === 'development') {
	/**
	 * Global is used in development to cache connection across hot module reloads.
	 * This prevents connections growing exponentially.
	 */
	if (!global._redisClient) {
		global._redisClient = createClient({
			password: env.REDIS_PASSWORD,
			username: env.REDIS_USERNAME
		});
	}

	client = global._redisClient;
} else {
	client = createClient({
		password: env.REDIS_PASSWORD,
		username: env.REDIS_USERNAME
	});
}

export default client;

export const withRedis = (client: RedisClient) => async <T>(fn: (client: RedisClient) => Promise<T>): Promise<T> => {
	if (!client.isOpen) {
		await client.connect();
	}

	return fn(client);
};
