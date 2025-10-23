// app/api/confirm-upload/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function POST(req) {
  try {
    const { path, filename, contentType, size } = await req.json();
    if (!path || !filename) return new Response(JSON.stringify({ error: 'missing' }), { status: 400 });

    const insert = await supabase
      .from('files')
      .insert([{ path, filename, content_type: contentType || null, size: size || null }])
      .select()
      .single();

    if (insert.error) throw insert.error;

    return new Response(JSON.stringify({ ok: true, row: insert.data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
