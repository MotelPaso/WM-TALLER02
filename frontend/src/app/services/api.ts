import { Capacitor } from '@capacitor/core';

/**
 * URL pública del backend que usa el APK. En el teléfono no existe el proxy de
 * `ng serve` ni el de nginx, así que hay que llamar al backend directo y por HTTPS.
 * GitHub Actions la reemplaza con la variable del repo API_URL_MOVIL si está definida.
 */
export const API_MOVIL = 'https://reportesucn-backend.up.railway.app';

/** En la web se usa el proxy `/api`; en Android, la URL pública. */
export const API: string = Capacitor.isNativePlatform() ? API_MOVIL : '/api';
