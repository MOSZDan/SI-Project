import supabase from '../utils/supabaseClient';
import { getPublicIp } from '../utils/getPublicIp';

/**
 * Debes llamar a initLogUpdater() UNA VEZ,
 * idealmente en el arranque de tu App (p.ej. en App.jsx o index.jsx).
 */
export function initLogUpdater() {
  supabase
    .channel('bitacora-updater')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bitacora' },
      async ({ record }) => {
        try {
          // Obtén la IP pública real
          const ip = await getPublicIp();

          // Invoca tu Edge Function para actualizar esa IP
          await supabase.functions.invoke('log-bitacora', {
            body: JSON.stringify({
              tipo_accion: 'UPDATE_IP',
              detalle: { id: record.id, ip_origen: ip }
            })
          });
        } catch (e) {
          console.error("Error actualizando IP en bitacora:", e);
        }
      }
    )
    .subscribe();
}