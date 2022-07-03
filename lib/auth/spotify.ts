import { URLSearchParams } from 'url';
import { z } from 'zod';

export const CODE_VERIFIER_COOKIE_NAME = 'spotify-auth-code-verifier';
export const STATE_COOKIE_NAME = 'spotify-auth-state';

export interface SpotifyTokens {
  accessToken?: string;
  refreshToken?: string;
}

export async function getAccessToken(code: string, codeVerifier: string): Promise<SpotifyTokens> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      body: getAccessTokenBody(code, codeVerifier),
      headers: getAccessTokenHeaders(),
      method: 'POST'
    });
    const body = await response.json();

    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token
    };
  } catch (e) {
    throw e;
  }
}
function getAccessTokenBody(code: string, codeVerifier: string): string {
  const data = {
    client_id: process.env.SPOTIFY_CLIENT_ID as string,
    code: code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:3000/api/auth/callback'
  };

  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function getAccessTokenHeaders(): HeadersInit {
  return {
    'Authorization': `Basic ${new Buffer(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

export function getAuthorizationParams(state: string, codeChallenge: string): URLSearchParams {
  return new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID as string,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: 'http://localhost:3000/api/auth/callback',
    response_type: 'code',
    scope: 'user-read-private',
    state
  });
}

export function getAuthorizationUrl(params: URLSearchParams) {
  return `https://accounts.spotify.com/authorize?${params}`;
}

const authorizationErrorQueryParams = z.object({
  error: z.string(),
  state: z.string()
});

const authorizationSuccessQueryParams = z.object({
  code: z.string(),
  state: z.string()
});

const authorizationResponseQueryParams = z.union([authorizationSuccessQueryParams, authorizationErrorQueryParams]);

export const authorizationResponseSchema = z.object({
  cookies: z.object({
    [CODE_VERIFIER_COOKIE_NAME]: z.string(),
    [STATE_COOKIE_NAME]: z.string()
  }),
  query: authorizationResponseQueryParams
});

export type AuthorizationErrorQueryParams = z.infer<typeof authorizationErrorQueryParams>;

export type AuthorizationResponseQueryParams = z.infer<typeof authorizationResponseQueryParams>;

export const isAuthorizationError = (query: AuthorizationResponseQueryParams): query is AuthorizationErrorQueryParams => {
  return (query as AuthorizationErrorQueryParams).error !== undefined;
}
