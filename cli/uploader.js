// cli/uploader.js
// node cli/uploader.js ./path/to/file.mp3
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2);
if (!args[0]) { console.log('Usage: node uploader.js <file> [apiBase]'); process.exit(1); }

const localPath = args[0];
const apiBase = args[1] || 'http://localhost:3000'; // cambiar al deploy Vercel cuando toque
const filename = path.basename(localPath);

async function main() {
  const stat = fs.statSync(localPath);
  const r1 = await fetch(`${apiBase}/api/signed-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType: 'application/octet-stream' })
  });
  const j1 = await r1.json();
  if (!r1.ok) throw new Error('Error getting signed url: ' + (j1.error || r1.status));

  const fileBuffer = fs.readFileSync(localPath);
  const r2 = await fetch(j1.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: fileBuffer
  });
  if (!r2.ok) throw new Error('Upload failed: ' + r2.status);

  const r3 = await fetch(`${apiBase}/api/confirm-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: j1.path, filename, size: stat.size })
  });
  const j3 = await r3.json();
  if (!r3.ok) throw new Error('Confirm failed: ' + (j3.error || r3.status));

  console.log('Subido correctamente:', filename);
}

main().catch(e => { console.error(e); process.exit(1); });
