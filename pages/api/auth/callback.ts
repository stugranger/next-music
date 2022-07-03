import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

import { clearCookie } from 'lib/server/cookie';
import { sessionOptions } from 'lib/server/session';
import {
  authorizationResponseSchema,
  getAccessToken,
  isAuthorizationError,
  CODE_VERIFIER_COOKIE_NAME,
  STATE_COOKIE_NAME
} from 'lib/auth/spotify';

const AUTH_ERROR_URL = '/auth/error';
const HOME_URL = '/';

export default withIronSessionApiRoute(callback, sessionOptions);

async function callback(request: NextApiRequest, response: NextApiResponse) {
  clearCookie(CODE_VERIFIER_COOKIE_NAME, response);
  clearCookie(STATE_COOKIE_NAME, response);

  try {
    const { cookies, query } = authorizationResponseSchema.parse(request);

    if (query.state !== cookies[STATE_COOKIE_NAME]) {
      return response.redirect(`${AUTH_ERROR_URL}?error=state_mismatch`);
    }

    if (isAuthorizationError(query)) {
      return response.redirect(`${AUTH_ERROR_URL}?error=${query.error}`);
    }

    const { accessToken, refreshToken } = await getAccessToken(query.code, cookies[CODE_VERIFIER_COOKIE_NAME]);

    if (accessToken === undefined || refreshToken === undefined) {
      return response.redirect(`${AUTH_ERROR_URL}?error=invalid_token`);
    }

    request.session.accessToken = accessToken;
    request.session.refreshToken = refreshToken;

    await request.session.save();

    response.redirect(HOME_URL);
  } catch (e) {
    if (e instanceof ZodError) {
      response.redirect(`${AUTH_ERROR_URL}?error=invalid_request`);
    } else {
      response.redirect(AUTH_ERROR_URL);
    }
  }
}
