// app/upload/page.jsx
import UploadArea from "../../components/UploadArea";


export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Encabezado con imagen lateral */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-14 mb-16">
          {/* Texto */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent font-serif">
              Repositorio Lofi
            </h1>
            <p className="text-gray-300 max-w-md mb-6">
              Sube y comparte imágenes, pistas y videos con enlaces seguros.
              Tus archivos se almacenan en la nube y puedes descargarlos o
              compartirlos fácilmente.
            </p>
          </div>

          {/* Imagen decorativa — volvemos a la original */}
          <div className="flex-1 flex justify-center">
            <img
              src="https://4kwallpapers.com/images/wallpapers/lofi-boy-landscape-1080x2160-15195.jpg"
              alt="Ilustración estilo lofi"
              className="rounded-2xl shadow-2xl max-w-sm hover:scale-105 transition-transform"
            />
          </div>
        </section>

        {/* Área de subida */}
        <section
          id="upload-area"
          className="bg-[rgba(255,255,255,0.03)] p-8 rounded-2xl shadow-xl backdrop-blur-sm mb-16 border border-[rgba(255,255,255,0.1)]"
        >
          <UploadArea />
        </section>

      </div>
    </main>
  );
}
