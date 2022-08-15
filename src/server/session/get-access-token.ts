import { NextApiRequest, NextApiResponse } from 'next';

import { andThen } from '@next-music/lib/fp/and-then';
import { Option } from '@next-music/lib/fp/option';
import { pipe } from '@next-music/lib/fp/pipe';
import { base64Encoded, formUrlencoded } from '@next-music/lib/encode';
import { AccessTokenResponse } from '@next-music/server/auth/access-token-response.schema';
import env from '@next-music/server/environment';

import { getSession } from './get-session';
import { AuthorizedSession, Session } from './session.schema';

const MILLISECONDS_PER_MINUTE = 60_000;

export async function getAccessToken(request: NextApiRequest, response: NextApiResponse): Promise<Option<string>> {
	const session = await getSession(request, response);

	if (!isAuthorized(session)) return Option.none();

	if (hasExpiredToken(session)) {
		return await pipe(
			refreshAccessToken,
			andThen(Option.traversePromise(async (tokens) => {
				session.accessToken = tokens.access_token;
				session.accessTokenExpires = Date.now() + tokens.expires_in * 1000;
				session.refreshToken = tokens.refresh_token;

				await session.commit();

				return session.accessToken;
			}))
		)(session.refreshToken);
	}

	return Option.some(session.accessToken);
}

function hasExpiredToken(session: AuthorizedSession): boolean {
	return (session.accessTokenExpires - (MILLISECONDS_PER_MINUTE * 0.5)) < Date.now()
}

function isAuthorized(session: Session): session is AuthorizedSession {
	return (session as AuthorizedSession).accessToken !== undefined;
}

async function refreshAccessToken(refreshToken: string): Promise<Option<AccessTokenResponse>> {
	try {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			body: formUrlencoded({
				client_id: env.SPOTIFY_CLIENT_ID,
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			}),
			headers: {
				Authorization: `Basic ${base64Encoded(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`
			},
			method: 'POST'
		});

		if (!response.ok) return Option.none();

		const result = AccessTokenResponse.safeParse(await response.json());

		return result.success ? Option.some(result.data) : Option.none();
	} catch {
		return Option.none();
	}
}
