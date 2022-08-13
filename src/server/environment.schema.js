const z = require('zod');

const EnvironmentVariables = z.object({
	AUTH_REDIRECT_URI: z.string().url(),
	NODE_ENV: z.enum(['development', 'production']),
	REDIS_PASSWORD: z.string(),
	REDIS_USERNAME: z.enum(['default']),
	SPOTIFY_CLIENT_ID: z.string(),
	SPOTIFY_CLIENT_SECRET: z.string()
});

module.exports = { EnvironmentVariables };
