import z from 'zod';

export const AccessTokenResponse = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	refresh_token: z.string(),
	scope: z.string(),
	token_type: z.string(),
});
export type AccessTokenResponse = z.infer<typeof AccessTokenResponse>;
