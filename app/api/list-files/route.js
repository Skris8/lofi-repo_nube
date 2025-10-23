// app/api/list-files/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function GET() {
  try {
    const { data: rows = [], error: e } = await supabase
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (e) throw e;

    const filesWithUrls = await Promise.all(rows.map(async (r) => {
      // intentamos generar signedUrl; si falla, devolvemos null en downloadUrl
      let downloadUrl = null;
      try {
        const { data, error } = await supabase
          .storage
          .from('lofi-files')
          .createSignedUrl(r.path, 60 * 5); // 5 minutos
        if (!error && data?.signedUrl) downloadUrl = data.signedUrl;
      } catch (innerErr) {
        // no hacer crash; dejar downloadUrl null
        console.error('signedUrl error for', r.path, innerErr);
      }

      return {
        id: r.id,
        filename: r.filename,
        path: r.path,                 // <- importante: path incluido
        content_type: r.content_type,
        size: r.size,
        uploaded_at: r.uploaded_at,
        downloadUrl
      };
    }));

    return new Response(JSON.stringify({ files: filesWithUrls }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
