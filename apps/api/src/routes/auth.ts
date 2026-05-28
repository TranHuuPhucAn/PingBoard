import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router : Router = Router();

// Step 1 of OAuth: redirect user to GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Step 2 of OAuth: GitHub redirects back here with a code
// Passport exchanges it, calls the strategy, and attaches the user to req
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/' }),
  (req: Request, res: Response) => {
    const user = req.user as unknown as { id: string };
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Return the current user from their JWT
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, email: user.email });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;