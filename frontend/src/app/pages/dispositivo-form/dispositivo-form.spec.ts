import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DispositivosService } from '../../services/dispositivos.service';
import { DispositivoForm } from './dispositivo-form';

describe('DispositivoForm', () => {
  it('rechaza un código de inventario con solo espacios', async () => {
    const servicio = {
      getTiposDispositivo: () => of([]),
      getEdificios: () => of([]),
      getSalas: () => of([]),
      crearDispositivo: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [DispositivoForm],
      providers: [provideRouter([]), { provide: DispositivosService, useValue: servicio }],
    }).compileComponents();
    const fixture = TestBed.createComponent(DispositivoForm);
    await fixture.whenStable();
    const componente = fixture.componentInstance as unknown as {
      form: { controls: Record<string, { setValue: (v: unknown) => void; hasError: (e: string) => boolean }> };
    };

    componente.form.controls['codigo_inventario'].setValue('   ');

    expect(componente.form.controls['codigo_inventario'].hasError('pattern')).toBe(true);
  });
});
