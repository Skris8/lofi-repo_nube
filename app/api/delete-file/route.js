// app/api/delete-file/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function POST(req) {
  try {
    const { path } = await req.json();
    if (!path) return new Response(JSON.stringify({ error: 'missing path' }), { status: 400 });

    // 1) eliminar del bucket
    const { error: errRemove } = await supabase.storage.from('lofi-files').remove([path]);
    if (errRemove && errRemove.message && !errRemove.message.includes('The specified key does not exist')) {
      // si falla por otra causa, devolver error
      throw errRemove;
    }

    // 2) eliminar metadata en tabla files
    const { error: errDel } = await supabase.from('files').delete().eq('path', path);
    if (errDel) throw errDel;

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
