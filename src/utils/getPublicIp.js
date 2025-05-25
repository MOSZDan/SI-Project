// src/utils/getPublicIp.js
export async function getPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    return (await res.json()).ip;
  } catch {
    return 'desconocido';
  }
}