import z from 'zod';

const AuthorizationCodeResponse = z.object({
	query: z.object({
		code: z.string(),
		state: z.string()
	})
});
export type AuthorizationCodeResponse = z.infer<typeof AuthorizationCodeResponse>;

const ErrorResponse = z.object({
	query: z.object({
		error: z.string(),
		state: z.string()
	})
});

export const AuthorizationResponse = z.union([AuthorizationCodeResponse, ErrorResponse]);
export type AuthorizationResponse = z.infer<typeof AuthorizationResponse>;
