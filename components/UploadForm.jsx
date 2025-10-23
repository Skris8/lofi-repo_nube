'use client';
import { useState, useRef } from 'react';

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecciona un archivo');

    setStatus('Solicitando signed URL...');
    const r1 = await fetch('/api/signed-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const json1 = await r1.json();
    if (!r1.ok) return setStatus('Error: ' + (json1.error || r1.status));

    setStatus('Subiendo al storage...');
    const upload = await fetch(json1.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!upload.ok) return setStatus('Error subiendo');

    setStatus('Confirmando en la DB...');
    const confirm = await fetch('/api/confirm-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: json1.path,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-violet-400/40 rounded-2xl bg-[rgba(255,255,255,0.02)] hover:border-pink-400/50 transition-all duration-300"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Zona de arrastre */}
      <div
        className={`w-full flex flex-col items-center justify-center py-10 rounded-xl transition ${
          isDragging
            ? 'bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-500/70 scale-[1.02]'
            : ''
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {/* 🔼 Nueva flecha de subida (simple y elegante) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-3 text-violet-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m0-15l-6 6m6-6l6 6M3 19.5h18"
          />
        </svg>

        <p className="text-gray-300 text-sm mb-2 text-center">
          {file ? (
            <>
              Archivo seleccionado:{' '}
              <span className="text-pink-300 font-medium">{file.name}</span>
            </>
          ) : (
            <>
              Arrastra un archivo aquí o{' '}
              <span className="text-violet-300 font-semibold cursor-pointer hover:underline">
                haz clic para seleccionar
              </span>
            </>
          )}
        </p>

        <input
          ref={inputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>

      {/* Botón de subida */}
      <button
        type="submit"
        disabled={!file}
        className={`px-6 py-2 rounded-xl font-semibold shadow-md transition-transform ${
          file
            ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-slate-900 hover:scale-105'
            : 'bg-slate-800/40 text-gray-500 cursor-not-allowed'
        }`}
      >
        {file ? 'Subir archivo' : 'Selecciona un archivo primero'}
      </button>

      {/* Estado / mensaje */}
      {status && (
        <div className="mt-2 text-sm text-gray-300 bg-[rgba(255,255,255,0.05)] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)]">
          {status}
        </div>
      )}
    </form>
  );
}
