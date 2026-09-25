import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { redis } from './redis';

let cachedSecrets: { current: Uint8Array; previous: Uint8Array | null; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

async function getSecrets() {
  const now = Date.now();
  if (cachedSecrets && now - cachedSecrets.fetchedAt < CACHE_TTL_MS) {
    return cachedSecrets;
  }

  try {
    let current = await redis.get('jwt:secret:current');
    let previous = await redis.get('jwt:secret:previous');

    if (!current) {
      current = process.env.JWT_SECRET!;
      previous = process.env.JWT_PREVIOUS_SECRET || null;
      if (current) {
        await redis.set('jwt:secret:current', current);
        if (previous) {
          await redis.set('jwt:secret:previous', previous);
        }
      } else {
        throw new Error("JWT_SECRET is not defined in environment variables or Redis");
      }
    }

    cachedSecrets = {
      current: new TextEncoder().encode(current),
      previous: previous ? new TextEncoder().encode(previous) : null,
      fetchedAt: now,
    };
    return cachedSecrets;
  } catch (_error) {
    console.error('Failed to fetch JWT secrets from Redis, falling back to env', _error);
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
    
    return {
      current: new TextEncoder().encode(process.env.JWT_SECRET),
      previous: process.env.JWT_PREVIOUS_SECRET ? new TextEncoder().encode(process.env.JWT_PREVIOUS_SECRET) : null,
      fetchedAt: 0,
    };
  }
}

export async function encrypt(payload: JWTPayload) {
  const secrets = await getSecrets();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secrets.current);
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null;
  const secrets = await getSecrets();
  try {
    const { payload } = await jwtVerify(session, secrets.current, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (_error) {
    if (secrets.previous) {
      try {
        const { payload } = await jwtVerify(session, secrets.previous, {
          algorithms: ['HS256'],
        });
        return payload;
      } catch (_innerError) {
        return null;
      }
    }
    return null;
  }
}

export async function createSession(userId: string, role: string, name: string, image?: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, name, image, expiresAt } as JWTPayload);
  
  const cookieStore = await cookies();

  cookieStore.set('extim_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession(payload: JWTPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt });
  
  const cookieStore = await cookies();

  cookieStore.set('extim_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('extim_session');
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('extim_session')?.value;
  return await decrypt(session);
}
