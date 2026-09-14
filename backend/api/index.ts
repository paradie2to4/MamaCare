import express from 'express';
import type { Request, Response } from 'express';

// Imported from the compiled dist output (built via `npm run build` before Vercel
// bundles this function), not the raw TS source — Vercel's esbuild-based function
// bundler doesn't reliably reproduce tsc's emitDecoratorMetadata output that
// NestJS's dependency injection depends on, so this file deliberately avoids
// importing anything decorated directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createNestApp } = require('../dist/create-app');

const server = express();
let readyPromise: Promise<void> | null = null;

async function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const app = await createNestApp(server);
      await app.init();
    })();
  }
  return readyPromise;
}

export default async function handler(req: Request, res: Response) {
  await ensureReady();
  server(req, res);
}
