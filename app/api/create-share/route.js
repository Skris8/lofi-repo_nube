// app/api/create-share/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function POST(req) {
  try {
    const { path, expires = 60 * 5 } = await req.json(); // expires en segundos, default 5m
    if (!path) return new Response(JSON.stringify({ error: 'missing path' }), { status: 400 });

    const { data, error } = await supabase.storage.from('lofi-files').createSignedUrl(path, expires);
    if (error) throw error;

    return new Response(JSON.stringify({ downloadUrl: data.signedUrl, expires }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
