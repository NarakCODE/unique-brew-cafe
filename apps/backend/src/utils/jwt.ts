import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './AppError.js';
import { config } from '../config/env.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  iat?: number;
  exp?: number;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

const getJwtConfig = () => {
  if (!config.jwtSecret || !config.jwtRefreshSecret) {
    throw new Error(
      'JWT configuration is missing. Set JWT_SECRET and JWT_REFRESH_SECRET.'
    );
  }

  return {
    jwtSecret: config.jwtSecret,
    jwtExpiresIn: config.jwtExpiresIn,
    jwtRefreshSecret: config.jwtRefreshSecret,
    jwtRefreshExpiresIn: config.jwtRefreshExpiresIn,
  };
};

/**
 * Generate JWT access token for a user
 * @param userId - User ID to encode in token
 * @param email - User email to encode in token
 * @param role - User role to encode in token
 * @returns JWT access token string
 */
export const generateAccessToken = (
  userId: string,
  email: string,
  role: 'user' | 'admin' | 'moderator'
): string => {
  const { jwtSecret, jwtExpiresIn } = getJwtConfig();
  const payload: TokenPayload = { userId, email, role };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token for a user
 * @param userId - User ID to encode in token
 * @returns Object containing JWT refresh token string and tokenId
 */
export const generateRefreshToken = (
  userId: string
): { token: string; tokenId: string } => {
  const { jwtRefreshSecret, jwtRefreshExpiresIn } = getJwtConfig();
  const tokenId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const payload: RefreshTokenPayload = { userId, tokenId };

  const token = jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: jwtRefreshExpiresIn,
  } as jwt.SignOptions);

  return { token, tokenId };
};

/**
 * Verify and decode JWT access token
 * @param token - JWT token to verify
 * @returns Decoded token payload with userId
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const { jwtSecret } = getJwtConfig();
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
};

/**
 * Verify and decode JWT refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload with userId and tokenId
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const { jwtRefreshSecret } = getJwtConfig();
    const decoded = jwt.verify(
      token,
      jwtRefreshSecret
    ) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw new UnauthorizedError('Refresh token verification failed');
  }
};
