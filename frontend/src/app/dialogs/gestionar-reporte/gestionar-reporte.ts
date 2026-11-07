import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, of, switchMap } from 'rxjs';

import { Reporte } from '../../models';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-gestionar-reporte',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatChipsModule,
    MatButtonModule,
    DatePipe,
  ],
  templateUrl: './gestionar-reporte.html',
  styleUrl: './gestionar-reporte.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionarReporte {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<GestionarReporte>);
  private readonly reportesService = inject(ReportesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly data = inject<Reporte>(MAT_DIALOG_DATA);

  protected readonly guardando = signal(false);
  protected readonly errorMensaje = signal('');

  protected readonly form = this.fb.group({
    prioridad_id: this.fb.control<number | null>(this.data.prioridad?.id ?? null),
    estado: this.fb.control<string>(this.data.estado.nombre),
    notas_resolucion: this.fb.control<string>(this.data.notas_resolucion ?? ''),
  });

  protected readonly codigoReporte = String(this.data.id).padStart(4, '0');

  protected bloquearEnProceso(): boolean {
    if (this.data.estado.nombre === 'resuelto') return true;
    return !this.form.controls.prioridad_id.value;
  }

  protected bloquearResuelto(): boolean {
    return !this.form.controls.prioridad_id.value;
  }

  protected formularioModificado(): boolean {
    const p = this.form.controls.prioridad_id.value;
    const e = this.form.controls.estado.value;
    const n = this.form.controls.notas_resolucion.value.trim();
    const initialP = this.data.prioridad?.id ?? null;
    const initialE = this.data.estado.nombre;
    const initialN = (this.data.notas_resolucion ?? '').trim();
    return p !== initialP || e !== initialE || n !== initialN;
  }

  protected guardar(): void {
    const nuevaPrioridad = this.form.controls.prioridad_id.value;
    const nuevoEstado = this.form.controls.estado.value;
    const nuevasNotas = this.form.controls.notas_resolucion.value.trim();
    const anteriorPrioridad = this.data.prioridad?.id ?? null;
    const anteriorEstado = this.data.estado.nombre;
    const anterioresNotas = (this.data.notas_resolucion ?? '').trim();

    const cambioPrioridad = nuevaPrioridad !== null && nuevaPrioridad !== anteriorPrioridad;
    const cambioEstado = nuevoEstado !== anteriorEstado;
    const cambioNotas = nuevasNotas !== anterioresNotas;

    if (!cambioPrioridad && !cambioEstado && !cambioNotas) {
      this.dialogRef.close();
      return;
    }

    if ((nuevoEstado === 'en_proceso' || nuevoEstado === 'resuelto') && !nuevaPrioridad) {
      this.errorMensaje.set('Debes asignar una prioridad antes de avanzar el estado del reporte.');
      return;
    }

    this.guardando.set(true);
    this.errorMensaje.set('');

    const peticion$ = cambioPrioridad
      ? this.reportesService.cambiarPrioridad(this.data.id, nuevaPrioridad!).pipe(
          switchMap((repActualizado) =>
            cambioEstado || cambioNotas
              ? this.reportesService.cambiarEstado(this.data.id, nuevoEstado, nuevasNotas || null)
              : of(repActualizado),
          ),
        )
      : this.reportesService.cambiarEstado(this.data.id, nuevoEstado, nuevasNotas || null);

    peticion$.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (resultado) => {
        this.snackBar.open('Reporte actualizado correctamente.', 'OK', { duration: 3000 });
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        const detalle =
          err.error?.detail ?? `Error al actualizar (${err.status ?? 'sin conexión'}).`;
        this.errorMensaje.set(detalle);
      },
    });
  }
}
