import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Dispositivo, Sala } from '../../models';
import { TarjetaSala } from './tarjeta-sala';

const sala: Sala = { id: 1, codigo: 'X-204', numero: '204', edificio: { id: 1, nombre: 'X' } };

function dispositivo(id: number, estado = 'operativo', tipo = 'Computador'): Dispositivo {
  return {
    id,
    codigo_inventario: `UCN-${String(id).padStart(6, '0')}`,
    descripcion: `Puesto ${id}`,
    tipo: { id: 1, nombre: tipo },
    sala,
    estado: { id: 1, nombre: estado },
    creado_en: '2026-10-25T10:00:00Z',
  };
}

describe('TarjetaSala', () => {
  let fixture: ComponentFixture<TarjetaSala>;

  async function crear(dispositivos: Dispositivo[]) {
    await TestBed.configureTestingModule({
      imports: [TarjetaSala],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(TarjetaSala);
    fixture.componentRef.setInput('sala', sala);
    fixture.componentRef.setInput('dispositivos', dispositivos);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function codigos(el: HTMLElement): string[] {
    return Array.from(el.querySelectorAll('li')).map(
      (li) => li.textContent?.match(/UCN-\d+/)?.[0] ?? '',
    );
  }

  it('usa singular con un solo dispositivo', async () => {
    const el = await crear([dispositivo(1)]);

    expect(el.textContent).toContain('1 dispositivo');
    expect(el.textContent).not.toContain('1 dispositivos');
  });

  it('muestra primero los dispositivos con problemas', async () => {
    const el = await crear([
      dispositivo(1),
      dispositivo(2, 'con_falla'),
      dispositivo(3),
      dispositivo(4, 'fuera_de_servicio'),
      dispositivo(5, 'en_reparacion'),
    ]);

    expect(codigos(el).slice(0, 3)).toEqual(['UCN-000004', 'UCN-000005', 'UCN-000002']);
  });

  it('resume los estados en el encabezado', async () => {
    const el = await crear([dispositivo(1), dispositivo(2), dispositivo(3, 'con_falla')]);

    expect(el.querySelector('h2')?.textContent).toContain('2 operativos');
    expect(el.querySelector('h2')?.textContent).toContain('1 con falla');
  });

  it('en salas grandes muestra 8 y permite ver todos', async () => {
    const lista = Array.from({ length: 30 }, (_, i) => dispositivo(i + 1));
    const el = await crear(lista);

    expect(el.querySelectorAll('li').length).toBe(8);
    const boton = el.querySelector('button') as HTMLButtonElement;
    expect(boton.textContent).toContain('Ver los 30');

    boton.click();
    fixture.detectChanges();

    expect(el.querySelectorAll('li').length).toBe(30);
    expect(boton.textContent).toContain('Ver menos');
  });

  it('las salas con más de 4 dispositivos ocupan el ancho completo', async () => {
    await crear(Array.from({ length: 5 }, (_, i) => dispositivo(i + 1)));

    expect(fixture.nativeElement.classList).toContain('sala-ancha');
  });

  it('no ofrece ver más en salas chicas', async () => {
    const el = await crear([dispositivo(1), dispositivo(2)]);

    expect(el.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.classList).not.toContain('sala-ancha');
  });
});
