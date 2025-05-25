// Setup type definitions for Supabase Edge Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 1) Inicializa el client con las vars que Supabase inyecta automáticamente
const supabaseUrl        = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const { tipo_accion, detalle } = await req.json() as {
      tipo_accion: string;
      detalle: any;
    };

    // 3) Rama de UPDATE de IP (viene de Realtime listener)
    const idBitacora = detalle?.id as number | undefined;
    const ipFromBody = detalle?.ip_origen as string | undefined;
    if (idBitacora && ipFromBody) {
      const { error: updErr } = await supabaseAdmin
        .from("bitacora")
        .update({ ip_origen: ipFromBody })
        .eq("id", idBitacora);

      if (updErr) {
        console.error("Error actualizando IP en bitacora:", updErr);
        return new Response(JSON.stringify({ error: updErr.message }), { status: 500 });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 4) Rama de INSERT de nuevo log
    //    Si quisieras usar la IP del proxy como fallback:
    const xff       = req.headers.get("x-forwarded-for") || "";
    const ipFromHdr = xff.split(",")[0].trim() || "desconocido";

    // 5) Autorización: extrae token y valida usuario
    const authHeader = req.headers.get("authorization") || "";
    const token      = authHeader.replace("Bearer ", "");
    const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }
    const email = authData.user.email;

    // 6) Mapea email → id_usuario
    const { data: usuario, error: usrErr } = await supabaseAdmin
      .from("usuario")
      .select("id")
      .eq("correo", email)
      .single();
    if (usrErr || !usuario) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
    }

    // 7) Inserta el registro completo en bitacora
    const { error: logErr } = await supabaseAdmin
      .from("bitacora")
      .insert({
        id_usuario: usuario.id,
        tipo_accion,
        fecha_hora: new Date().toISOString(),
        ip_origen: ipFromHdr,
        detalle
      });
    if (logErr) {
      console.error("Error insertando log en bitacora:", logErr);
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