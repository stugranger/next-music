export function base64Encoded(value: string): string {
	return Buffer.from(value).toString('base64');
}

export function formUrlencoded(data: Record<string, string>) {
	return Object.entries(data)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&');
}