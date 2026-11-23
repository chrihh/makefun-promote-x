// Entry program for the make.fun bounty
// "Promote make.fun's make-your-own-bounty post on X"
// (post-x-promote-make-your-own-bounty-01), Node 22, standard library only.
//
// The entry itself is one post on X: a quote of make.fun's
// make-your-own-bounty post (or a new post linking to it), with a photo of
// its own attached and the play code makefun-thrush-fjord-thunder in its
// text. This repository hands in that post's address, and all this program
// has to do is copy POST.json from the repository root to /output, where
// the house's gate reads it. The house then reads the post itself on X and
// scores its replies + reposts + quotes; nothing written here about the
// post is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Read POST.json back before copying it on: a malformed file or a url that
// is not an X post address would be refused by the gate anyway, so failing
// loudly here (exit 1, the reason on stderr) is cheaper than a refused
// entry. The check is deliberately loose — the house does the real reading
// of the post — it only catches a placeholder or a typo at build time.
function readPostUrl(path: string): string {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null || !('url' in parsed)) {
    throw new Error('POST.json must be a JSON object with a "url" field');
  }
  const url = (parsed as { url: unknown }).url;
  if (typeof url !== 'string' || !/^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\S+$/.test(url)) {
    throw new Error(`POST.json url is not an X post address: ${String(url)}`);
  }
  return url;
}

try {
  readPostUrl(join(botDir, 'POST.json'));
  mkdirSync(outputDir, { recursive: true });
  copyFileSync(join(botDir, 'POST.json'), join(outputDir, 'POST.json'));
} catch (err) {
  console.error(`promote-x entry: ${(err as Error).message}`);
  process.exit(1);
}
