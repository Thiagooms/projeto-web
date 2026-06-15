import { spawn } from 'node:child_process';
import { mkdirSync, openSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const pidFile = resolve(rootDir, '.dev-server-pids.json');
const logDir = resolve(rootDir, '.dev-logs');

mkdirSync(logDir, { recursive: true });

const servers = [
  {
    name: 'api',
    script: resolve(rootDir, 'apps/api/src/server.js'),
    env: { PORT: '3000' },
  },
  {
    name: 'web',
    script: resolve(rootDir, 'apps/web/server.js'),
    env: { PORT: '5173' },
  },
];

const started = servers.map((server) => {
  const out = openSync(resolve(logDir, `${server.name}.log`), 'a');
  const err = openSync(resolve(logDir, `${server.name}.err.log`), 'a');

  const child = spawn(process.execPath, [server.script], {
    cwd: rootDir,
    detached: true,
    env: { ...process.env, ...server.env },
    stdio: ['ignore', out, err],
  });

  child.unref();

  return {
    name: server.name,
    pid: child.pid,
    port: server.env.PORT,
    log: `.dev-logs/${server.name}.log`,
    errorLog: `.dev-logs/${server.name}.err.log`,
  };
});

writeFileSync(pidFile, JSON.stringify(started, null, 2));

for (const server of started) {
  console.log(`${server.name} iniciado na porta ${server.port} (pid ${server.pid})`);
}
