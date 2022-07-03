import { serialize, CookieSerializeOptions } from 'cookie';
import { NextApiResponse } from 'next';

const COOKIE_HEADER = 'Set-Cookie';

export function clearCookie(name: string, response: NextApiResponse) {
  setCookie(name, '', { expires: new Date(1), path: '/' }, response);
}

export function setCookie(name: string, value: string, options: CookieSerializeOptions = {}, response: NextApiResponse) {
  append(response, serialize(name, value, options));
}

function append(response: NextApiResponse, cookie: string) {
  let cookieHeader = response.getHeader(COOKIE_HEADER) ?? [];

  if (!Array.isArray(cookieHeader)) {
    cookieHeader = [String(cookieHeader)];
  }

  cookieHeader.push(cookie);

  response.setHeader(COOKIE_HEADER, cookieHeader);
}
