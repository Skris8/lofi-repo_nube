// app/api/signed-upload/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function POST(req) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename) return new Response(JSON.stringify({ error: 'missing filename' }), { status: 400 });

    const path = `uploads/${Date.now()}_${filename}`;

    const { data, error } = await supabase
      .storage
      .from('lofi-files')
      .createSignedUploadUrl(path, 60 * 60 * 2); // 2 horas

    if (error) throw error;

    return new Response(JSON.stringify({ signedUrl: data.signedUrl, path }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
