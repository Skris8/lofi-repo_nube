// components/FileList.jsx
'use client';
import { useEffect, useState } from 'react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState({}); // { id: true } para mostrar spinner
  const [deleting, setDeleting] = useState({}); // { id: true }
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/list-files');
    const json = await res.json();
    setFiles(json.files || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleShare = async (file, expiresSec = 60 * 10) => {
    setSharing(prev => ({ ...prev, [file.id]: true }));
    try {
      const r = await fetch('/api/create-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path, expires: expiresSec })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      // copiar al portapapeles
      await navigator.clipboard.writeText(j.downloadUrl);
      setMessage(`Link copiado (expira en ${Math.round(expiresSec/60)} min)`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Error creando link: ' + err.message);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSharing(prev => ({ ...prev, [file.id]: false }));
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Eliminar "${file.filename}"? (esto borra el archivo del storage y la DB)`)) return;
    setDeleting(prev => ({ ...prev, [file.id]: true }));
    try {
      const r = await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      setMessage('Archivo eliminado');
      await load();
    } catch (err) {
      setMessage('Error al eliminar: ' + err.message);
    } finally {
      setDeleting(prev => ({ ...prev, [file.id]: false }));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div>Cargando archivos...</div>;
  if (!files.length) return <div>No hay archivos aún.</div>;

  return (
    <div>
      {message && <div className="p-2 mb-2 bg-green-100 rounded">{message}</div>}
      <div className="grid grid-cols-1 gap-4">
        {files.map(f => (
          <div key={f.id} className="p-3 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">{f.filename}</div>
              <div className="text-xs text-gray-500">{f.size ?? '—'} bytes • {new Date(f.uploaded_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0">
              {/* preview depending on type */}
              {f.content_type?.startsWith('image') && <a className="mr-2" href={f.downloadUrl} target="_blank" rel="noreferrer">Ver</a>}
              {f.content_type?.startsWith('audio') && <audio className="mr-2" controls src={f.downloadUrl}></audio>}
              <a className="px-2 py-1 border rounded" href={f.downloadUrl}>Descargar</a>

              <button
                className="px-2 py-1 border rounded ml-2"
                onClick={() => handleShare(f)}
                disabled={sharing[f.id]}
              >
                {sharing[f.id] ? 'Generando...' : 'Compartir'}
              </button>

              <button
                className="px-2 py-1 bg-red-600 text-white rounded ml-2"
                onClick={() => handleDelete(f)}
                disabled={deleting[f.id]}
              >
                {deleting[f.id] ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
