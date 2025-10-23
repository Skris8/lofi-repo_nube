// cli/download.js
// node cli/download.js <file-path-on-db> <output-file> [apiBase]
// Si no conoces path, puedes obtener filename/path desde la UI list
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (!args[0] || !args[1]) { console.log('Usage: node download.js <remotePath> <outputFilename> [apiBase]'); process.exit(1); }

const remotePath = args[0];
const outName = args[1];
const apiBase = args[2] || 'http://localhost:3000';

async function main() {
  // pedir link compartido (5 minutos por defecto)
  const r = await fetch(`${apiBase}/api/create-share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: remotePath, expires: 60 * 5 })
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Error creando share: ' + (j.error || r.status));

  const resFile = await fetch(j.downloadUrl);
  if (!resFile.ok) throw new Error('Error descargando el archivo: ' + resFile.status);

  const buffer = Buffer.from(await resFile.arrayBuffer());
  fs.writeFileSync(outName, buffer);
  console.log('Descargado a', outName);
}

main().catch(e => { console.error(e); process.exit(1); });
