import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDir, '../assets/config.js');
const apiBase = process.env.API_BASE_URL || 'http://localhost:3000/api';

const config = `window.APP_CONFIG = ${JSON.stringify({ apiBase }, null, 2)};\n`;

writeFileSync(outputPath, config);

console.log(`Config gerada com API_BASE_URL=${apiBase}`);
