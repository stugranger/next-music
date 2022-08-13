import { NextApiRequest, NextApiResponse } from 'next';

import { AsyncValidation } from '@next-music/lib/fp/async-validation';
import { Option } from '@next-music/lib/fp/option';
import { pipe } from '@next-music/lib/fp/pipe';
import { Validation } from '@next-music/lib/fp/validation';
import { base64Encoded, formUrlencoded } from '@next-music/lib/encode';
import { AccessTokenResponse } from '@next-music/server/auth/access-token-response.schema';
import { AuthorizationResponse, AuthorizationCodeResponse } from '@next-music/server/auth/authorization-response.schema';
import { getSession } from '@next-music/server/session/get-session';
import env from '@next-music/server/environment';

export default async function callback(request: NextApiRequest, response: NextApiResponse) {
	const session = await getSession(request, response);
	const { codeVerifier, state } = session;

	delete session.state;
	delete session.codeVerifier;

	await session.commit();

	await pipe(
		validateRequest,
		Validation.flatMap(verifyState(state)),
		Validation.flatMap(checkAuthorizationGranted),
		Validation.traversePromise(async ({ query }) => {
			if (codeVerifier === undefined) return Option.none();
			return accessToken(query.code, codeVerifier);
		}),
		AsyncValidation.match({
			invalid() {
				response.redirect('/?error=invalid_request');
			},
			valid: Option.match({
				async some(tokens) {
					await session.destroy();

					const authorizedSession = await getSession(request, response);

					authorizedSession.accessToken = tokens.access_token;
					authorizedSession.accessTokenExpires = Date.now() + (tokens.expires_in * 1000);
					authorizedSession.refreshToken = tokens.refresh_token;

					await authorizedSession.commit();

					response.redirect('/');
				},
				async none() {
					response.redirect('/?error=invalid_token');
				}
			})
		})
	)(request);
}

async function accessToken(code: string, codeVerifier: string): Promise<Option<AccessTokenResponse>> {
	try {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			body: formUrlencoded({
				client_id: env.SPOTIFY_CLIENT_ID,
				code,
				code_verifier: codeVerifier,
				grant_type: 'authorization_code',
				redirect_uri: env.AUTH_REDIRECT_URI
			}),
			headers: {
				'Authorization': `Basic ${base64Encoded(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
				'Content-Type': 'application/x-www-form-urlencoded'
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

function checkAuthorizationGranted(response: AuthorizationResponse): Validation<Unauthorized, AuthorizationCodeResponse> {
	if (!isAuthorized(response)) return Validation.invalid(new Unauthorized());

	return Validation.valid(response);
}

function isAuthorized(response: AuthorizationResponse): response is AuthorizationCodeResponse {
	return (response as AuthorizationCodeResponse).query.code !== undefined;
}

class StateMismatch extends Error {
	readonly name = 'StateMismatch';

	constructor() {
		super('State does not match');
	}
}

function validateRequest(request: NextApiRequest): Validation<ValidationError, AuthorizationResponse> {
	const result = AuthorizationResponse.safeParse(request);
	return result.success ? Validation.valid(result.data) : Validation.invalid(new ValidationError());
}

class ValidationError extends Error {
	readonly name = 'ValidationError';

	constructor() {
		super('Validation error');
	}
}

function verifyState(localState: string | undefined) {
	return (response: AuthorizationResponse): Validation<StateMismatch, AuthorizationResponse> => {
		if (response.query.state !== localState) return Validation.invalid(new StateMismatch());

		return Validation.valid(response);
	};
}

class Unauthorized extends Error {
	readonly name = 'Unauthorized';

	constructor() {
		super('Unauthorized');
	}
}

