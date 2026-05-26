import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../lib/prisma';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3001/auth/github/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await prisma.user.upsert({
          where: { githubId: profile.id },
          update: {
            name: profile.displayName ?? null,
            avatarUrl: profile.photos?.[0]?.value ?? null,
            email: profile.emails?.[0]?.value ?? null,
          },
          create: {
            githubId: profile.id,
            name: profile.displayName ?? null,
            avatarUrl: profile.photos?.[0]?.value ?? null,
            email: profile.emails?.[0]?.value ?? null,
          },
        });
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;