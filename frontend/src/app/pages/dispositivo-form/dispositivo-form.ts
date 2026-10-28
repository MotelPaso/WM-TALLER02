import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-dispositivo-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './dispositivo-form.html',
  styleUrl: './dispositivo-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivoForm {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    codigo_inventario: ['', [Validators.required, Validators.maxLength(30)]],
    tipo_dispositivo_id: this.fb.control<number | null>(null, Validators.required),
    edificio_id: this.fb.control<number | null>(null),
    sala_id: this.fb.control<number | null>(null, Validators.required),
    descripcion: ['', Validators.maxLength(500)],
    fuera_de_servicio: [false],
  });

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
