import { spawn } from 'node:child_process';

const processes = [
  {
    name: 'api',
    command: process.execPath,
    args: ['apps/api/src/server.js'],
    env: { PORT: '3000' },
  },
  {
    name: 'web',
    command: process.execPath,
    args: ['apps/web/server.js'],
    env: { PORT: '5173' },
  },
];

const children = processes.map(({ name, command, args, env }) => {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => writeLines(name, chunk));
  child.stderr.on('data', (chunk) => writeLines(name, chunk));
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function writeLines(name, chunk) {
  for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) {
    console.log(`[${name}] ${line}`);
  }
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
