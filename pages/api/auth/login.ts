import { NextApiRequest, NextApiResponse } from 'next';

import { createCodeChallenge, createCodeVerifier, createState } from 'lib/auth/oauth';
import { setCookie } from 'lib/server/cookie';
import {
  getAuthorizationParams,
  getAuthorizationUrl,
  CODE_VERIFIER_COOKIE_NAME,
  STATE_COOKIE_NAME
} from 'lib/auth/spotify';

export default async function login(request: NextApiRequest, response: NextApiResponse) {
  const state = createState();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);

  setCookie(STATE_COOKIE_NAME, state, { httpOnly: true }, response);
  setCookie(CODE_VERIFIER_COOKIE_NAME, codeVerifier, { httpOnly: true }, response);

  response.redirect(getAuthorizationUrl(getAuthorizationParams(state, codeChallenge)));
}
