import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { AuthService } from './services/auth.service';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('muestra la inicial del usuario en mayúscula', async () => {
    TestBed.overrideProvider(AuthService, {
      useValue: {
        usuario: signal({ id: 1, nombre: 'diego', correo: 'd@ucn.cl', activo: true, rol: { id: 1, nombre: 'usuario' } }),
        logout: () => undefined,
      },
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('header [title]').textContent.trim()).toBe('D');
  });
});
