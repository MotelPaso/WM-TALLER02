import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

import { EstadoReporte } from '../../models';

@Component({
  selector: 'app-gestionar-reporte',
  imports: [ReactiveFormsModule, MatDialogModule, MatChipsModule, MatButtonModule],
  templateUrl: './gestionar-reporte.html',
  styleUrl: './gestionar-reporte.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionarReporte {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    prioridad_id: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoReporte>({ id: 1, nombre: 'abierto' }),
  });

  protected guardar(): void {}
}
