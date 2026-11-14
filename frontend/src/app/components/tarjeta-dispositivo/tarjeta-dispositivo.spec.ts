import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dispositivo } from '../../models';
import { TarjetaDispositivo } from './tarjeta-dispositivo';

const dispositivo: Dispositivo = {
  id: 1,
  codigo_inventario: 'UCN-004501',
  descripcion: 'Proyector de techo',
  tipo: { id: 1, nombre: 'Proyector' },
  sala: {
    id: 1,
    codigo: 'X1-29',
    numero: '29',
    edificio: { id: 1, nombre: 'X1' },
  },
  estado: { id: 2, nombre: 'con_falla' },
  creado_en: '2026-10-25T10:00:00Z',
};

describe('TarjetaDispositivo', () => {
  let component: TarjetaDispositivo;
  let fixture: ComponentFixture<TarjetaDispositivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaDispositivo],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaDispositivo);
    component = fixture.componentInstance;
  });

  it('muestra la etiqueta legible del estado del dispositivo', async () => {
    fixture.componentRef.setInput('dispositivo', dispositivo);
    await fixture.whenStable();

    expect(component['etiqueta']()).toBe('Con falla');
    expect(fixture.nativeElement.textContent).toContain('Con falla');
  });

  it('usa el tipo como título con su ícono y el código como dato secundario', async () => {
    fixture.componentRef.setInput('dispositivo', dispositivo);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.tarjeta-titulo')?.textContent?.trim()).toBe('Proyector');
    expect(el.querySelector('.tarjeta-icono')?.textContent?.trim()).toBe('present_to_all');
    expect(el.textContent).toContain('UCN-004501');
    expect(el.textContent).toContain('Proyector de techo');
  });

  it('muestra la sala solo cuando se pide', async () => {
    fixture.componentRef.setInput('dispositivo', dispositivo);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('X1-29');

    fixture.componentRef.setInput('mostrarSala', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('X1-29');
  });

  it('centra el ícono con un contenedor propio y no sobre la clase de la fuente', async () => {
    fixture.componentRef.setInput('dispositivo', dispositivo);
    await fixture.whenStable();
    const recuadro: HTMLElement = fixture.nativeElement.querySelector('.tarjeta-icono');

    expect(recuadro.classList).not.toContain('material-symbols-outlined');
    expect(recuadro.classList).toContain('grid');
    expect(recuadro.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe(
      'present_to_all',
    );
  });
});
