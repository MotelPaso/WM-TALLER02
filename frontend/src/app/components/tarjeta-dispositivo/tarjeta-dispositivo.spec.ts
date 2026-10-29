import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dispositivo } from '../../models';
import { TarjetaDispositivo } from './tarjeta-dispositivo';

const dispositivo: Dispositivo = {
  id: 1,
  codigo_inventario: 'UCN-004501',
  descripcion: 'Proyector',
  tipo: { id: 1, nombre: 'Proyector' },
  sala: {
    id: 1,
    codigo: 'X1-29',
    numero: '29',
    edificio: { id: 1, numero: 'X1' },
  },
  estado: { id: 2, nombre: 'con_falla' },
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
});
