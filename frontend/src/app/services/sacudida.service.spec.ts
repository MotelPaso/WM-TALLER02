import { TestBed } from '@angular/core/testing';

import { SacudidaService, aceleracionNeta } from './sacudida.service';

const quieto = { x: 0, y: 0, z: 0 };
const golpe = { x: 18, y: 4, z: 3 };

/** Simula una lectura del acelerómetro como la entrega el navegador o la WebView de Android. */
function lectura(acceleration: object | null, accelerationIncludingGravity: object | null = null) {
  const evento = Object.assign(new Event('devicemotion'), {
    acceleration,
    accelerationIncludingGravity,
    interval: 16,
  });
  window.dispatchEvent(evento);
}

describe('aceleracionNeta', () => {
  it('usa la aceleración sin gravedad cuando existe', () => {
    expect(
      aceleracionNeta({ acceleration: { x: 3, y: 4, z: 0 }, accelerationIncludingGravity: quieto }),
    ).toBe(5);
  });

  it('si solo hay lectura con gravedad, le resta 1 g', () => {
    const neta = aceleracionNeta({
      acceleration: null as never,
      accelerationIncludingGravity: { x: 0, y: 0, z: 9.81 },
    });
    expect(neta).toBeCloseTo(0);
  });

  it('devuelve null si el equipo no entrega datos', () => {
    expect(
      aceleracionNeta({ acceleration: null as never, accelerationIncludingGravity: null as never }),
    ).toBeNull();
  });
});

describe('SacudidaService', () => {
  let servicio: SacudidaService;
  let dejarDeEscuchar: () => void;
  const alSacudir = vi.fn();

  beforeEach(async () => {
    alSacudir.mockReset();
    servicio = TestBed.inject(SacudidaService);
    dejarDeEscuchar = await servicio.escuchar(alSacudir);
  });

  afterEach(() => dejarDeEscuchar());

  it('marca el sensor como disponible al recibir una lectura', () => {
    lectura(quieto);
    expect(servicio.disponible()).toBe(true);
  });

  it('un solo golpe no cuenta como sacudida', () => {
    lectura(golpe);
    expect(alSacudir).not.toHaveBeenCalled();
  });

  it('dos golpes seguidos disparan una sola vez', () => {
    lectura(golpe);
    lectura(golpe);
    lectura(golpe);
    lectura(golpe);
    expect(alSacudir).toHaveBeenCalledTimes(1);
  });
});
