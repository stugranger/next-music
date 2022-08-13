import { SessionStore } from 'next-session';

import redisClient, { withRedis } from '../redis';
import { CookieOptions, PersistentCookieOptions, Session } from './session.schema';

const withClient = withRedis(redisClient);

const store: SessionStore = {
	destroy(sid) {
		return withClient(async (client) => {
			await client.del(sessionKey(sid));
		});
	},
	get(sid) {
		return withClient(async (client) => {
			const data = await client.get(sessionKey(sid));

			if (data == null) return null;

			let uncheckedSession: unknown;

			try {
				uncheckedSession = JSON.parse(data,(key, value) => {
					if (key === 'expires') return new Date(value);
					return value;
				});
			} catch {
				return null;
			}

			const result = Session.safeParse(uncheckedSession);

			return result.success ? result.data : null;
		});
	},
	set(sid, session) {
		return withClient(async (client) => {
			const expiresAt = isPersistent(session.cookie) ? session.cookie.expires.getTime() : undefined;

			await client.set(sessionKey(sid), JSON.stringify(session), { PXAT: expiresAt });
		});
	},
	touch(sid, session) {
		return withClient(async (client) => {
			const timeTilExpiry = isPersistent(session.cookie) ? timeToLive(session.cookie) : undefined;

			if (timeTilExpiry && timeTilExpiry > 0) {
				await client.expire(sessionKey(sid), timeTilExpiry);
			}
		});
	}
};

export default store;

function isPersistent(options: CookieOptions): options is PersistentCookieOptions {
	return (options as PersistentCookieOptions).maxAge !== undefined;
}

function sessionKey(sid: string): string {
	return 'sess:' + sid;
}

function timeToLive(options: PersistentCookieOptions): number {
	const ms = Number(options.expires) - Date.now();

	return Math.ceil(ms / 1000);
}
