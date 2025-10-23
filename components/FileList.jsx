'use client';
import { useEffect, useState } from 'react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState({});
  const [deleting, setDeleting] = useState({});
  const [downloading, setDownloading] = useState({});
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/list-files');
    const json = await res.json();
    setFiles(json.files || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleShare = async (file, expiresSec = 60 * 10) => {
    setSharing((prev) => ({ ...prev, [file.id]: true }));
    try {
      const r = await fetch('/api/create-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path, expires: expiresSec }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      await navigator.clipboard.writeText(j.downloadUrl);
      setMessage(`🔗 Link copiado (expira en ${Math.round(expiresSec / 60)} min)`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Error creando link: ' + err.message);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSharing((prev) => ({ ...prev, [file.id]: false }));
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Eliminar "${file.filename}"? (esto borra el archivo del storage y la DB)`)) return;
    setDeleting((prev) => ({ ...prev, [file.id]: true }));
    try {
      const r = await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      setMessage('🗑️ Archivo eliminado');
      await load();
    } catch (err) {
      setMessage('Error al eliminar: ' + err.message);
    } finally {
      setDeleting((prev) => ({ ...prev, [file.id]: false }));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDownload = async (file) => {
    try {
      setDownloading((prev) => ({ ...prev, [file.id]: true }));
      const response = await fetch(file.downloadUrl);
      if (!response.ok) throw new Error('Error al descargar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename || 'archivo';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage('Error al descargar: ' + err.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setDownloading((prev) => ({ ...prev, [file.id]: false }));
    }
  };

  if (loading) return <div className="text-gray-400">Cargando archivos...</div>;
  if (!files.length) return <div className="text-gray-400">No hay archivos aún.</div>;

  return (
    <div>
      {message && (
        <div className="p-3 mb-4 bg-gradient-to-r from-green-400/20 to-emerald-400/10 border border-green-400/30 rounded-lg text-green-300 text-sm shadow-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((f) => (
          <div
            key={f.id}
            className="p-4 border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all duration-200 flex flex-col justify-between"
          >
            {/* info */}
            <div className="mb-3">
              <div className="font-semibold text-violet-300 break-all">{f.filename}</div>
              <div className="text-xs text-gray-400">
                {f.size ?? '—'} bytes • {new Date(f.uploaded_at).toLocaleString()}
              </div>
            </div>

            {/* preview */}
            <div className="mb-3">
              {f.content_type?.startsWith('image') && (
                <a
                  href={f.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:opacity-90"
                >
                  <img
                    src={f.downloadUrl}
                    alt={f.filename}
                    className="w-full rounded-md max-h-48 object-cover border border-[rgba(255,255,255,0.05)]"
                  />
                </a>
              )}
              {f.content_type?.startsWith('audio') && (
                <audio className="w-full mt-2" controls src={f.downloadUrl}></audio>
              )}
            </div>

            {/* botones */}
            <div className="flex flex-wrap gap-2 mt-auto">
              <button
                onClick={() => handleDownload(f)}
                disabled={downloading[f.id]}
                className="flex-1 px-3 py-2 rounded-md bg-gradient-to-r from-violet-500 to-pink-500 text-slate-900 font-semibold text-sm text-center shadow-md hover:scale-105 transition-transform"
              >
                {downloading[f.id] ? 'Descargando...' : 'Descargar'}
              </button>

              <button
                onClick={() => handleShare(f)}
                disabled={sharing[f.id]}
                className="flex-1 px-3 py-2 rounded-md bg-[rgba(255,255,255,0.1)] text-gray-200 text-sm hover:bg-[rgba(255,255,255,0.2)] transition"
              >
                {sharing[f.id] ? 'Generando...' : 'Compartir'}
              </button>

              <button
                onClick={() => handleDelete(f)}
                disabled={deleting[f.id]}
                className="flex-1 px-3 py-2 rounded-md bg-red-600/80 hover:bg-red-600 text-white text-sm transition"
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

