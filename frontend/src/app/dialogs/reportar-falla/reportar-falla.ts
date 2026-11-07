import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { Dispositivo } from '../../models';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportar-falla',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './reportar-falla.html',
  styleUrl: './reportar-falla.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportarFalla {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReportarFalla>);
  private readonly reportesService = inject(ReportesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly data = inject<Dispositivo>(MAT_DIALOG_DATA);

  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { titulo, descripcion } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set('');

    this.reportesService
      .crear({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        dispositivo_id: this.data.id,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (reporteCreado) => {
          this.snackBar.open('Reporte enviado con éxito.', 'OK', { duration: 3000 });
          this.dialogRef.close(reporteCreado);
        },
        error: (err) => {
          const detalle =
            err.error?.detail ?? `No se pudo enviar el reporte (${err.status ?? 'sin conexión'}).`;
          this.error.set(detalle);
        },
      });
  }
}
