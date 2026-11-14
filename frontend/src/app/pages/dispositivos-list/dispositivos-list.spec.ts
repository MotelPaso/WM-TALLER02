import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';

import { Dispositivo } from '../../models';

import { AuthService } from '../../services/auth.service';
import { DispositivosService } from '../../services/dispositivos.service';
import { DispositivosList } from './dispositivos-list';

describe('DispositivosList', () => {
  let getDispositivos: ReturnType<typeof vi.fn>;

  async function crear() {
    await TestBed.configureTestingModule({
      imports: [DispositivosList],
      providers: [
        provideRouter([]),
        {
          provide: DispositivosService,
          useValue: {
            getDispositivos,
            getSalas: () => of([]),
            getTiposDispositivo: () => of([]),
            getEstados: () => of([{ id: 3, nombre: 'en_reparacion' }]),
            getEdificios: () => of([]),
          },
        },
        { provide: AuthService, useValue: { usuario: signal(null) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DispositivosList);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    getDispositivos = vi.fn(() => of([]));
  });

  it('recarga al cambiar un filtro', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as {
      filtros: { controls: { tipoId: { setValue: (v: number) => void } } };
    };

    expect(getDispositivos).toHaveBeenCalledTimes(1);

    componente.filtros.controls.tipoId.setValue(3);
    await fixture.whenStable();

    expect(getDispositivos).toHaveBeenCalledTimes(2);
    expect(getDispositivos).toHaveBeenLastCalledWith(expect.objectContaining({ tipo_id: 3 }));
  });

  it('al cambiar el edificio deja de filtrar por la sala anterior', async () => {
    const fixture = await crear();
    const { controls } = (
      fixture.componentInstance as unknown as {
        filtros: { controls: Record<string, { setValue: (v: number) => void }> };
      }
    ).filtros;

    controls['salaId'].setValue(7);
    await fixture.whenStable();
    controls['edificioId'].setValue(2);
    await fixture.whenStable();

    const ultimo = getDispositivos.mock.lastCall?.[0];
    expect(ultimo.edificio_id).toBe(2);
    expect(ultimo.sala_id).toBeUndefined();
  });

  it('mantiene la lista visible mientras carga un nuevo filtro', async () => {
    const dispositivo: Dispositivo = {
      id: 1,
      codigo_inventario: 'UCN-004501',
      descripcion: 'Proyector de techo',
      tipo: { id: 1, nombre: 'Proyector' },
      sala: { id: 1, codigo: 'X1-29', numero: '29', edificio: { id: 1, nombre: 'X1' } },
      estado: { id: 1, nombre: 'operativo' },
      creado_en: '2026-10-25T10:00:00Z',
    };
    getDispositivos = vi.fn(() => of([dispositivo]));
    const fixture = await crear();
    fixture.detectChanges();
    const pendiente = new Subject<Dispositivo[]>();
    getDispositivos.mockImplementation(() => pendiente);

    (
      fixture.componentInstance as unknown as {
        filtros: { controls: { tipoId: { setValue: (v: number) => void } } };
      }
    ).filtros.controls.tipoId.setValue(3);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 dispositivo ·');
    expect(fixture.nativeElement.querySelector('[aria-label="Cargando dispositivos"]')).toBeNull();
  });

  it('carga el listado con un recurso reactivo', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as Record<string, unknown>;

    expect(componente['dispositivosRecurso']).toBeDefined();
    expect(fixture.nativeElement.textContent).toContain('Sin resultados');
  });

  it('muestra las opciones del filtro de estado con etiquetas legibles', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as Record<
      string,
      () => { label: string }[]
    >;

    expect(componente['opcionesEstados']().map((o) => o.label)).toEqual(['En reparación']);
  });
});
