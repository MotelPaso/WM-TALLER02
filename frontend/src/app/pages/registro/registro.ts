import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

function coincideConContrasena(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.parent?.get('contrasena')?.value;
  return control.value === contrasena ? null : { noCoincide: true };
}

@Component({
  selector: '',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly verContrasena = signal(false);
  protected readonly verConfirmacion = signal(false);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+\-]+@(alumnos\.)?ucn\.cl$/)]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    confirmarContrasena: ['', [Validators.required, coincideConContrasena]],
  });

  constructor() {
    this.form.controls.contrasena.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmarContrasena.updateValueAndValidity());
  }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    const { nombre, correo, contrasena } = this.form.getRawValue();
    this.auth.register(nombre, correo, contrasena).subscribe({
      next: () => this.router.navigateByUrl('/dispositivos'),
      error: (err) => {
        this.error.set(
          err.status === 409
            ? 'Usuario ya existe.'
            : err.status === 422
              ? 'Datos inválidos. Revisa el correo y que la contraseña tenga al menos 8 caracteres.'
              : `Error al conectar con el servidor... (error: ${err.status})`,
        );
        this.cargando.set(false);
      },
    });
  }
}
