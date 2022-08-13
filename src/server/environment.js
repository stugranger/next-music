const { EnvironmentVariables } = require('./environment.schema');

const result = EnvironmentVariables.safeParse(process.env);

if (!result.success) {
	console.error('Invalid environment variables');
	process.exit(1);
}

module.exports = result.data;
