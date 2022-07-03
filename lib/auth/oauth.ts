import { createHash, randomBytes } from 'crypto';

export function createCodeChallenge(codeVerifier: string): string {
  return createHash('sha256')
    .update(codeVerifier)
    .digest()
    .toString('base64url');
}

export function createCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

export function createState(): string {
  return generateRandomString(16);
}

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return Array.from({ length }, () => possible.charAt(Math.floor(Math.random() * possible.length)))
    .join('');
}
