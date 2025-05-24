// Setup type definitions for Supabase Edge Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Inicializa el client con las vars que Supabase inyecta automáticamente
const supabaseUrl       = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // 1) IP pública real desde x-forwarded-for
    const xff = req.headers.get("x-forwarded-for") || "";
    const ip = xff.split(",")[0].trim() || "desconocido";

    // 2) Lee tipo_accion y detalle del body
    const { tipo_accion, detalle } = await req.json();

    // 3) Valida y extrae el usuario
    const authHeader = req.headers.get("authorization") || "";
    const token      = authHeader.replace("Bearer ", "");
    const resUser    = await supabaseAdmin.auth.getUser(token);
    const user       = resUser?.data?.user;
    if (resUser.error || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    // 4) Mapea email → id_usuario
    const { data: usuario, error: usrErr } = await supabaseAdmin
      .from("usuario")
      .select("id")
      .eq("correo", user.email)
      .single();

    if (usrErr || !usuario) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
    }

    // 5) Inserta en bitácora
    const { error: logErr } = await supabaseAdmin
      .from("bitacora")
      .insert({
        id_usuario: usuario.id,
        tipo_accion,
        fecha_hora: new Date().toISOString(),
        ip_origen: ip,
        detalle
      });

    if (logErr) {
      return new Response(JSON.stringify({ error: logErr.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Error en log-bitacora:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    );
  }
});
