import z from 'zod';

const AnonymousSessionProps = z.object({
	accessToken: z.string().optional(),
	accessTokenExpires: z.number().optional(),
	codeVerifier: z.string().optional(),
	refreshToken: z.string().optional(),
	state: z.string().optional()
});

const AuthorizedSessionProps = AnonymousSessionProps.extend({
	accessToken: z.string(),
	accessTokenExpires: z.number(),
	refreshToken: z.string()
});

const SessionProps = z.union([AnonymousSessionProps, AuthorizedSessionProps]);
export type SessionProps = z.infer<typeof SessionProps>;

const CookieOptions= z.object({
	domain: z.string().optional(),
	httpOnly: z.boolean(),
	path: z.string(),
	sameSite: z.union([z.boolean(), z.enum(['lax', 'none', 'strict'])]).optional(),
	secure: z.boolean()
});
export type CookieOptions = z.infer<typeof CookieOptions>;

const PersistentCookieOptions = CookieOptions.extend({
	maxAge: z.number(),
	expires: z.date()
});
export type PersistentCookieOptions = z.infer<typeof PersistentCookieOptions>;

const NextSession = z.object({
	cookie: z.union([PersistentCookieOptions, CookieOptions])
});

const AnonymousSession = NextSession.merge(AnonymousSessionProps);

const AuthorizedSession = NextSession.merge(AuthorizedSessionProps);
export type AuthorizedSession = z.infer<typeof AuthorizedSession>;

export const Session = z.union([AnonymousSession, AuthorizedSession]);
export type Session = z.infer<typeof Session>;
