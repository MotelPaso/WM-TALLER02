import { Injectable, signal } from '@angular/core';
import { AccelListenerEvent, Motion } from '@capacitor/motion';

type Eje = { x: number | null; y: number | null; z: number | null } | null | undefined;

const GRAVEDAD = 9.81;
/** Aceleración (m/s², sin gravedad) desde la que un movimiento cuenta como golpe de sacudida. */
export const UMBRAL_SACUDIDA = 15;
/** Golpes que tiene que haber dentro de VENTANA_MS para que sea una sacudida y no un tropiezo. */
const GOLPES_NECESARIOS = 2;
const VENTANA_MS = 1000;
/** Tiempo sin volver a disparar después de una sacudida. */
const PAUSA_MS = 2000;
/** Si en este tiempo no llega ninguna lectura, el equipo no tiene acelerómetro. */
const ESPERA_SENSOR_MS = 1500;

function magnitud(a: Eje): number | null {
  if (!a || a.x == null || a.y == null || a.z == null) return null;
  return Math.hypot(a.x, a.y, a.z);
}

/** Cuánto se acelera el teléfono sin contar la gravedad. */
export function aceleracionNeta(
  evento: Pick<AccelListenerEvent, 'acceleration' | 'accelerationIncludingGravity'>,
): number | null {
  const sinGravedad = magnitud(evento.acceleration);
  if (sinGravedad != null) return sinGravedad;
  // Algunos equipos solo entregan la lectura con gravedad: se le resta 1 g.
  const conGravedad = magnitud(evento.accelerationIncludingGravity);
  return conGravedad == null ? null : Math.abs(conGravedad - GRAVEDAD);
}

@Injectable({ providedIn: 'root' })
export class SacudidaService {
  /** null mientras no se sabe; true si llegan lecturas del acelerómetro; false si no hay sensor. */
  readonly disponible = signal<boolean | null>(null);

  /** Empieza a escuchar el acelerómetro. Devuelve la función para dejar de escuchar. */
  async escuchar(alSacudir: () => void): Promise<() => void> {
    let golpes: number[] = [];
    let pausaHasta = 0;

    const sinSensor = setTimeout(() => {
      if (this.disponible() !== true) this.disponible.set(false);
    }, ESPERA_SENSOR_MS);

    const handle = await Motion.addListener('accel', (evento) => {
      const neta = aceleracionNeta(evento);
      if (neta == null) return;
      this.disponible.set(true);

      const ahora = Date.now();
      if (ahora < pausaHasta || neta < UMBRAL_SACUDIDA) return;

      golpes = [...golpes.filter((t) => ahora - t < VENTANA_MS), ahora];
      if (golpes.length >= GOLPES_NECESARIOS) {
        golpes = [];
        pausaHasta = ahora + PAUSA_MS;
        alSacudir();
      }
    });

    return () => {
      clearTimeout(sinSensor);
      handle.remove();
    };
  }
}
