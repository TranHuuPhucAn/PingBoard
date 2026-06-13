import { config } from 'dotenv';
import { execSync } from 'child_process';

config({ path: '.env.test' });

// Run migrations against the test DB once before all tests
execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: { ...process.env },
});