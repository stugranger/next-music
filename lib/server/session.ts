import { IronSessionOptions } from 'iron-session';

import { isProd } from '../environment';

export const sessionOptions: IronSessionOptions = {
  cookieName: 'next-music-session',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd()
  },
  password: process.env.SESSION_COOKIE_PASSWORD as string
};

declare module "iron-session" {
  interface IronSessionData {
    accessToken?: string;
    refreshToken?: string;
  }
}
