import z from 'zod';

const AppSession = z.object({
	accessToken: z.string().optional(),
	accessTokenExpires: z.number().optional(),
	codeVerifier: z.string().optional(),
	refreshToken: z.string().optional(),
	state: z.string().optional()
});
export type AppSession = z.infer<typeof AppSession>;

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

export const Session = NextSession.merge(AppSession);
