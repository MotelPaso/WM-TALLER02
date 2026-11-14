import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Reporte } from '../../models';
import { AuthService } from '../../services/auth.service';
import { ReportesService } from '../../services/reportes.service';
import { Reportes } from './reportes';

function reporte(
  id: number,
  estado = 'abierto',
  prioridad?: { id: number; nivel: number; nombre: string },
  creado_en = '2026-10-25T10:00:00Z',
): Reporte {
  return {
    id,
    titulo: `Falla ${id}`,
    descripcion: 'No enciende',
    dispositivo: {
      id: 1,
      codigo_inventario: 'UCN-004501',
      descripcion: 'Proyector',
      tipo: { id: 1, nombre: 'Proyector' },
      sala: { id: 1, codigo: 'X1-29', numero: '29', edificio: { id: 1, nombre: 'X1' } },
      estado: { id: 2, nombre: 'con_falla' },
      creado_en: '2026-10-25T10:00:00Z',
    },
    creado_por: { id: 1, nombre: 'Ana' },
    estado: { id: 1, nombre: estado },
    prioridad,
    creado_en,
  };
}

describe('Reportes', () => {
  let servicio: { listar: ReturnType<typeof vi.fn>; eliminar: ReturnType<typeof vi.fn> };

  let abrir: ReturnType<typeof vi.fn>;

  async function crear(rol = 'usuario') {
    await TestBed.configureTestingModule({
      imports: [Reportes],
      providers: [
        provideRouter([]),
        { provide: ReportesService, useValue: servicio },
        {
          provide: AuthService,
          useValue: {
            usuario: signal({
              id: 1,
              nombre: 'Ana',
              correo: 'ana@ucn.cl',
              activo: true,
              rol: { id: 1, nombre: rol },
            }),
          },
        },
        { provide: MatDialog, useValue: { open: abrir } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Reportes);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    abrir = vi.fn(() => ({ afterClosed: () => of(true) }));
    servicio = {
      listar: vi.fn(() => of([reporte(1), reporte(2)])),
      eliminar: vi.fn(() => of(undefined)),
    };
  });

  it('lista los reportes del servicio', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as Record<string, () => unknown>;

    expect(componente['conteoTotal']()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Falla 1');
  });

  it('quita el reporte eliminado sin recargar', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;

    componente['eliminar'](reporte(1));
    await fixture.whenStable();

    expect(servicio.eliminar).toHaveBeenCalledWith(1);
    expect(servicio.listar).toHaveBeenCalledTimes(1);
    expect((componente['reportes']() as Reporte[]).map((r) => r.id)).toEqual([2]);
  });

  it('carga los reportes con un recurso reactivo', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as Record<string, unknown>;

    expect(componente['reportesRecurso']).toBeDefined();
  });

  it('ordena la cola del técnico por urgencia', async () => {
    const alta = { id: 3, nivel: 3, nombre: 'alta' };
    const baja = { id: 1, nivel: 1, nombre: 'baja' };
    servicio.listar = vi.fn(() =>
      of([
        reporte(1, 'resuelto', alta),
        reporte(2, 'en_proceso', alta),
        reporte(3, 'abierto', baja),
        reporte(4, 'abierto', alta),
        reporte(5, 'abierto', undefined, '2026-10-26T10:00:00Z'),
        reporte(6, 'abierto', undefined, '2026-10-24T10:00:00Z'),
      ]),
    );
    const fixture = await crear('tecnico');
    const componente = fixture.componentInstance as unknown as Record<string, () => Reporte[]>;

    expect(componente['reportesFiltrados']().map((r) => r.id)).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('abre Gestionar con el foco en el título y no en un chip', async () => {
    const fixture = await crear('tecnico');
    const componente = fixture.componentInstance as unknown as Record<string, (r: Reporte) => void>;

    componente['abrirGestionar'](reporte(1));

    expect(abrir).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ autoFocus: 'first-heading' }),
    );
  });

  it('en la vista de usuario conserva el orden del backend', async () => {
    const alta = { id: 3, nivel: 3, nombre: 'alta' };
    servicio.listar = vi.fn(() => of([reporte(1, 'resuelto', alta), reporte(2), reporte(3, 'abierto', alta)]));
    const fixture = await crear('usuario');
    const componente = fixture.componentInstance as unknown as Record<string, () => Reporte[]>;

    expect(componente['reportesFiltrados']().map((r) => r.id)).toEqual([1, 2, 3]);
  });
});
