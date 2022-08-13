import nextSession from 'next-session';

import env from '@next-music/server/environment';

import sessionStore from './store';
import { AppSession } from './session.schema';

const SECONDS_PER_DAY = 86_400;

export const getSession = nextSession<AppSession>({
	autoCommit: false,
	cookie: {
		httpOnly: true,
		maxAge: SECONDS_PER_DAY * 5,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production'
	},
	store: sessionStore
});
