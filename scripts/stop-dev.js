import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const pidFile = resolve(process.cwd(), '.dev-server-pids.json');

if (!existsSync(pidFile)) {
  console.log('Nenhum arquivo de PIDs encontrado.');
  process.exit(0);
}

const servers = JSON.parse(readFileSync(pidFile, 'utf8'));

for (const server of servers) {
  try {
    process.kill(server.pid);
    console.log(`${server.name} encerrado (pid ${server.pid})`);
  } catch {
    console.log(`${server.name} ja estava encerrado (pid ${server.pid})`);
  }
}

unlinkSync(pidFile);
