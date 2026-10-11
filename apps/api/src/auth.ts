import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
export type VerifyToken = (token: string) => Promise<string>;
export function createVerifier(): VerifyToken {
  const { AUTH_JWKS_URL, AUTH_ISSUER, AUTH_AUDIENCE } = process.env;
  if (!AUTH_JWKS_URL || !AUTH_ISSUER || !AUTH_AUDIENCE) {
    // Servidor e catálogo podem iniciar; rotas privadas permanecem fechadas.
    return async () => {
      throw new Error('Authentication unavailable');
    };
  }
  const url = new URL(AUTH_JWKS_URL);
  if (url.protocol !== 'https:') throw new Error('JWKS requer HTTPS');
  const jwks = createRemoteJWKSet(url);
  return async (token) => {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
      algorithms: ['ES256', 'RS256'],
    });
    return z.uuid().parse(payload.sub);
  };
}
