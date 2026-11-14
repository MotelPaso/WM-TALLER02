import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { Registro } from './registro';

type ComponenteRegistro = {
  form: { setValue: (v: object) => void; invalid: boolean };
  submit: () => void;
};

describe('Registro', () => {
  let auth: { register: ReturnType<typeof vi.fn> };

  async function crear() {
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideRouter([{ path: 'dispositivos', children: [] }]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Registro);
    return { fixture, componente: fixture.componentInstance as unknown as ComponenteRegistro };
  }

  beforeEach(() => {
    auth = { register: vi.fn(() => of({})) };
  });

  it('rechaza un nombre con solo espacios y muestra el mensaje', async () => {
    const { fixture, componente } = await crear();

    componente.form.setValue({
      nombre: '   ',
      correo: 'ana@ucn.cl',
      contrasena: 'clave1234',
      confirmarContrasena: 'clave1234',
    });
    componente.submit();
    fixture.detectChanges();

    expect(componente.form.invalid).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresa tu nombre.');
  });

  it('rechaza contraseñas que no coinciden', async () => {
    const { fixture, componente } = await crear();

    componente.form.setValue({
      nombre: 'Ana',
      correo: 'ana@ucn.cl',
      contrasena: 'clave1234',
      confirmarContrasena: 'clave9999',
    });
    componente.submit();
    fixture.detectChanges();

    expect(auth.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Las contraseñas no coinciden.');
  });

  it('envía el registro cuando las contraseñas coinciden', async () => {
    const { componente } = await crear();

    componente.form.setValue({
      nombre: 'Ana',
      correo: 'ana@ucn.cl',
      contrasena: 'clave1234',
      confirmarContrasena: 'clave1234',
    });
    componente.submit();

    expect(auth.register).toHaveBeenCalledWith('Ana', 'ana@ucn.cl', 'clave1234');
  });

  it('muestra y oculta la contraseña con el botón del ojo', async () => {
    const { fixture } = await crear();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#contrasena');
    const boton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Mostrar contraseña"]',
    );

    expect(input.type).toBe('password');
    boton.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
  });
});
