// components/UploadForm.jsx
'use client';
import { useState } from 'react';

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('selecciona un archivo');

    setStatus('Solicitando signed URL...');
    const r1 = await fetch('/api/signed-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    });
    const json1 = await r1.json();
    if (!r1.ok) return setStatus('Error: ' + (json1.error || r1.status));

    setStatus('Subiendo al storage...');
    const upload = await fetch(json1.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });
    if (!upload.ok) return setStatus('Error subiendo');

    setStatus('Confirmando en la DB...');
    const confirm = await fetch('/api/confirm-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: json1.path, filename: file.name, contentType: file.type, size: file.size })
    });
    if (!confirm.ok) {
      const err = await confirm.json();
      return setStatus('Error confirmando: ' + (err?.error || confirm.status));
    }

    setStatus('Listo ✅');
    setFile(null);
    onUploaded?.();
    setTimeout(() => setStatus(''), 1500);
  };

  return (
    <form onSubmit={handleUpload} className="p-4">
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button type="submit" className="ml-2 px-3 py-1 bg-slate-800 text-white rounded">Subir</button>
      <div className="mt-2 text-sm">{status}</div>
    </form>
  );
}
