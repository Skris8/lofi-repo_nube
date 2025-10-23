// components/UploadArea.jsx
'use client';
import { useState } from 'react';
import UploadForm from './UploadForm';
import FileList from './FileList';

export default function UploadArea() {
  // usamos una key para forzar recarga de FileList cuando suba algo
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploaded() {
    // incrementa la key para que FileList se vuelva a montar y recargue
    setRefreshKey(k => k + 1);
  }

  return (
    <div>
      <UploadForm onUploaded={handleUploaded} />
      <div className="mt-6">
        <FileList key={refreshKey} />
      </div>
    </div>
  );
}
