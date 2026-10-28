import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  protected readonly form = this.fb.group({
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email, Validators.pattern('.*@ucn.*')]],
    contrasena: ['', Validators.required, Validators.minLength(8)],
  });
  protected async submit(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    const { nombre, correo, contrasena } = this.form.getRawValue();
    (await this.auth.register(nombre, correo, contrasena)).subscribe({
      next: () => this.router.navigateByUrl('/dispositivos'),
      error: (err) => {
        this.error.set(
          err.status === 409
            ? 'Usuario ya existe.'
            : `Error al conectar con la base de datos... (error: ${err.status})`,
        );
        this.cargando.set(false);
      },
    });
  }
}
