import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { Reporte } from '../../models';
import { ReportesService } from '../../services/reportes.service';
import { GestionarReporte } from './gestionar-reporte';

const resuelto: Reporte = {
  id: 9,
  titulo: 'No enciende',
  descripcion: 'El PC no enciende',
  dispositivo: {
    id: 1,
    codigo_inventario: 'UCN-004508',
    descripcion: 'PC',
    tipo: { id: 1, nombre: 'Computador' },
    sala: { id: 1, codigo: 'Y1-101', numero: '101', edificio: { id: 2, nombre: 'Y1' } },
    estado: { id: 1, nombre: 'operativo' },
    creado_en: '2026-10-25T10:00:00Z',
  },
  creado_por: { id: 1, nombre: 'Ana' },
  estado: { id: 3, nombre: 'resuelto' },
  prioridad: { id: 3, nivel: 3, nombre: 'alta' },
  creado_en: '2026-10-25T10:00:00Z',
  finalizado_en: '2026-10-26T10:00:00Z',
  notas_resolucion: 'Se cambió la fuente',
};

describe('GestionarReporte', () => {
  it('no reenvía el estado de un reporte resuelto', async () => {
    const servicio = { cambiarEstado: vi.fn(), cambiarPrioridad: vi.fn() };
    const dialogRef = { close: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [GestionarReporte],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: resuelto },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ReportesService, useValue: servicio },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(GestionarReporte);
    await fixture.whenStable();
    const componente = fixture.componentInstance as unknown as {
      form: { controls: { notas_resolucion: { disabled: boolean; setValue: (v: string) => void } } };
      guardar: () => void;
    };

    expect(componente.form.controls.notas_resolucion.disabled).toBe(true);

    componente.form.controls.notas_resolucion.setValue('Otra nota');
    componente.guardar();

    expect(servicio.cambiarEstado).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('envía las notas al pasar a resuelto', async () => {
    const servicio = {
      cambiarEstado: vi.fn(() => of(resuelto)),
      cambiarPrioridad: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [GestionarReporte],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...resuelto, estado: { id: 2, nombre: 'en_proceso' }, notas_resolucion: undefined },
        },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: ReportesService, useValue: servicio },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(GestionarReporte);
    await fixture.whenStable();
    const componente = fixture.componentInstance as unknown as {
      form: { controls: Record<string, { setValue: (v: string) => void }> };
      guardar: () => void;
    };

    componente.form.controls['estado'].setValue('resuelto');
    componente.form.controls['notas_resolucion'].setValue('Fuente nueva');
    componente.guardar();

    expect(servicio.cambiarEstado).toHaveBeenCalledWith(9, 'resuelto', 'Fuente nueva');
  });

  it('no envía un estado vacío al deseleccionar el chip', async () => {
    const servicio = { cambiarEstado: vi.fn(), cambiarPrioridad: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [GestionarReporte],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...resuelto, estado: { id: 2, nombre: 'en_proceso' }, notas_resolucion: undefined },
        },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: ReportesService, useValue: servicio },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(GestionarReporte);
    await fixture.whenStable();
    const componente = fixture.componentInstance as unknown as {
      form: { controls: Record<string, { setValue: (v: string | null) => void }> };
      guardar: () => void;
      errorMensaje: () => string;
    };

    componente.form.controls['estado'].setValue(null);
    componente.guardar();

    expect(servicio.cambiarEstado).not.toHaveBeenCalled();
    expect(componente.errorMensaje()).toBe('Selecciona un estado.');
  });
});
