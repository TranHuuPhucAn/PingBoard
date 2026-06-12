import jwt from 'jsonwebtoken';

export function signTestToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET ?? 'local_dev_secret_change_in_production',
    { expiresIn: '1h' }
  );
}