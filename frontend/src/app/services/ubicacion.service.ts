import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Ubicacion {
  latitud: number;
  longitud: number;
  /** Radio de error en metros. */
  precision: number;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  /** Pide la ubicación actual (en Android muestra el permiso la primera vez). */
  async obtener(): Promise<Ubicacion> {
    try {
      const { coords } = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      });
      return {
        latitud: coords.latitude,
        longitud: coords.longitude,
        precision: Math.round(coords.accuracy),
      };
    } catch (err) {
      const e = err as { code?: number | string; message?: string };
      const mensaje = (e?.message ?? '').toLowerCase();
      if (e?.code === 1 || mensaje.includes('denied') || mensaje.includes('permission')) {
        throw new Error('Permiso de ubicación denegado.');
      }
      if (mensaje.includes('disabled') || mensaje.includes('services')) {
        throw new Error('El GPS está desactivado.');
      }
      throw new Error('No se pudo obtener la ubicación.');
    }
  }

  static enlaceMapa(latitud: number, longitud: number): string {
    return `https://www.google.com/maps?q=${latitud},${longitud}`;
  }
}
