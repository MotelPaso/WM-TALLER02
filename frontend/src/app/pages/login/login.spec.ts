import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  it('muestra y oculta la contraseña con el botón del ojo', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#contrasena');

    expect(input.type).toBe('password');
    fixture.nativeElement.querySelector('button[aria-label="Mostrar contraseña"]').click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    fixture.nativeElement.querySelector('button[aria-label="Ocultar contraseña"]').click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });
});
