import { createHash, randomBytes } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { URLSearchParams } from 'url';

import { getSession } from '@next-music/server/session/get-session';
import env from '@next-music/server/environment';

export default async function login(request: NextApiRequest, response: NextApiResponse) {
	const session = await getSession(request, response);

	session.state = generateState();
	session.codeVerifier = generateCodeVerifier();

	await session.commit();

	response.redirect(authorizationUrl(session.state, session.codeVerifier));
}

function authorizationUrl(state: string, codeVerifier: string): string {
	const params = new URLSearchParams({
		client_id: env.SPOTIFY_CLIENT_ID,
		code_challenge: codeChallengeFor(codeVerifier),
		code_challenge_method: 'S256',
		redirect_uri: env.AUTH_REDIRECT_URI,
		response_type: 'code',
		scope: 'user-read-private',
		state
	});

	return `https://accounts.spotify.com/authorize?${params}`
}

function codeChallengeFor(codeVerifier: string): string {
	return createHash('sha256').update(codeVerifier).digest().toString('base64url');
}

function generateCodeVerifier(): string {
	return randomBytes(32).toString('base64url');
}

function generateState(): string {
	return randomBytes(32).toString('base64url');
}
