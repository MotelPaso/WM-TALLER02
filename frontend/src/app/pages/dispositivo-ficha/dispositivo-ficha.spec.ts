import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Dispositivo } from '../../models';
import { AuthService } from '../../services/auth.service';
import { DispositivosService } from '../../services/dispositivos.service';
import { DispositivoFicha } from './dispositivo-ficha';

const dispositivo: Dispositivo = {
  id: 5,
  codigo_inventario: 'UCN-004501',
  descripcion: 'Proyector de techo',
  tipo: { id: 1, nombre: 'Proyector' },
  sala: { id: 1, codigo: 'X1-29', numero: '29', edificio: { id: 1, nombre: 'X1' } },
  estado: { id: 3, nombre: 'en_reparacion' },
  creado_en: '2026-10-25T10:00:00Z',
};

describe('DispositivoFicha', () => {
  let servicio: {
    getDispositivo: ReturnType<typeof vi.fn>;
    getReportesDispositivo: ReturnType<typeof vi.fn>;
  };

  async function crear(id = '5', tecnico = false) {
    await TestBed.configureTestingModule({
      imports: [DispositivoFicha],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
        { provide: DispositivosService, useValue: servicio },
        {
          provide: AuthService,
          useValue: {
            usuario: signal(tecnico ? { id: 1, nombre: 'T', rol: { id: 2, nombre: 'tecnico' } } : null),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DispositivoFicha);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    servicio = {
      getDispositivo: vi.fn(() => of(dispositivo)),
      getReportesDispositivo: vi.fn(() => of([])),
    };
  });

  it('muestra el dispositivo cargado por id', async () => {
    const fixture = await crear();

    expect(servicio.getDispositivo).toHaveBeenCalledWith(5);
    expect(servicio.getReportesDispositivo).toHaveBeenCalledWith(5);
    expect(fixture.nativeElement.textContent).toContain('UCN-004501');
    expect(fixture.nativeElement.textContent).toContain('Este dispositivo no tiene reportes.');
  });

  it('muestra error cuando el dispositivo no existe', async () => {
    servicio.getDispositivo = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    const fixture = await crear();

    expect(fixture.nativeElement.textContent).toContain('Puede que se haya eliminado');
  });

  it('muestra error cuando el id no es un número', async () => {
    const fixture = await crear('abc');

    expect(servicio.getDispositivo).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Puede que se haya eliminado');
  });

  it('expone el dispositivo como recurso reactivo', async () => {
    const fixture = await crear();
    const componente = fixture.componentInstance as unknown as Record<string, unknown>;

    expect(componente['dispositivoRecurso']).toBeDefined();
    expect(componente['reportesRecurso']).toBeDefined();
  });

  it('muestra el estado legible, el tipo con la sala y la ubicación unida', async () => {
    const fixture = await crear();
    const texto: string = fixture.nativeElement.textContent;

    expect(texto).toContain('En reparación');
    expect(texto).not.toContain('en_reparacion');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Proyector · X1-29');
    expect(texto).toContain('Ubicación');
    expect(texto).not.toContain('Edificio');
  });

  it('el técnico ve Eliminar solo si el dispositivo no tiene reportes', async () => {
    const fixture = await crear('5', true);
    const botones = () =>
      Array.from(fixture.nativeElement.querySelectorAll('button')).map((b) =>
        (b as HTMLElement).textContent?.trim(),
      );

    expect(botones().some((t) => t?.includes('Eliminar'))).toBe(true);
    expect(botones().some((t) => t?.includes('Marcar fuera de servicio'))).toBe(false);
  });

  it('con reportes el técnico ve "Marcar fuera de servicio" en vez de Eliminar', async () => {
    servicio.getReportesDispositivo = vi.fn(() =>
      of([
        {
          id: 1,
          titulo: 'No enciende',
          descripcion: 'Falla',
          dispositivo,
          creado_por: { id: 2, nombre: 'Ana' },
          estado: { id: 1, nombre: 'abierto' },
          creado_en: '2026-10-25T10:00:00Z',
        },
      ]),
    );
    const fixture = await crear('5', true);
    const textos = Array.from(fixture.nativeElement.querySelectorAll('button')).map((b) =>
      (b as HTMLElement).textContent?.trim(),
    );

    expect(textos.some((t) => t?.includes('Marcar fuera de servicio'))).toBe(true);
    expect(textos.some((t) => t?.includes('Eliminar'))).toBe(false);
  });

  it('avisa si no se pudo cargar el historial y no ofrece eliminar', async () => {
    servicio.getReportesDispositivo = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    const fixture = await crear('5', true);
    const texto: string = fixture.nativeElement.textContent;

    expect(texto).toContain('No pudimos cargar el historial');
    expect(texto).not.toContain('Este dispositivo no tiene reportes.');
    expect(texto).not.toContain('Eliminar');
  });
});
