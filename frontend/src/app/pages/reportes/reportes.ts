import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';


import {
  ESTADOS_REPORTE,
  EstadoReporte,
  etiquetaEstadoReporte,
  etiquetaPrioridad,
  Reporte,
} from '../../models';
import { AuthService } from '../../services/auth.service';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reportes implements OnInit {
  private readonly reportesService = inject(ReportesService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly estados = ESTADOS_REPORTE;
  protected readonly esTecnico = this.auth.esTecnico;

  protected readonly columnas = computed(() =>
    this.esTecnico
      ? ['titulo', 'equipo', 'usuario', 'prioridad', 'estado']
      : ['titulo', 'equipo', 'prioridad', 'estado', 'acciones'],
  );

  protected readonly reportes = signal<Reporte[]>([]);
  protected readonly cargando = signal(false);
  protected readonly cargado = signal(false);
  protected readonly mensajeError = signal('');
  /** ids de reportes cuyo cambio de estado/eliminación está en vuelo */
  protected readonly enProceso = signal<Set<number>>(new Set());

  protected etiquetaEstado = etiquetaEstadoReporte;
  protected etiquetaPrioridad = etiquetaPrioridad;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.reportesService.listar().subscribe({
      next: (reportes) => {
        this.reportes.set(reportes);
        this.cargando.set(false);
        this.cargado.set(true);
      },
      error: (err) => {
        this.mensajeError.set(
          `No se pudieron cargar los reportes (status ${err.status ?? 'sin conexión'}). Revisa que el backend esté corriendo en localhost:8000.`,
        );
        this.cargando.set(false);
        this.cargado.set(true);
      },
    });
  }

  /** Un reporte se puede eliminar si es propio y sigue "abierto". */
  protected sePuedeEliminar(reporte: Reporte): boolean {
    const usuario = this.auth.usuario();
    return (
      !!usuario
      && reporte.usuario_id === usuario.id
      && reporte.estado === 'abierto'
    );
  }

  protected async eliminar(reporte: Reporte): Promise<void> {
    const confirmado = await this.confirmar(
      `¿Eliminar el reporte "${reporte.titulo}"?`,
    );
    if (!confirmado) return;

    this.marcarEnProceso(reporte.id, true);
    this.reportesService.eliminar(reporte.id).subscribe({
      next: () => {
        this.reportes.update((lista) => lista.filter((r) => r.id !== reporte.id));
        this.marcarEnProceso(reporte.id, false);
        this.snackBar.open('Reporte eliminado.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.marcarEnProceso(reporte.id, false);
        this.snackBar.open(
          `No se pudo eliminar (status ${err.status ?? 'sin conexión'}).`,
          'OK',
          { duration: 4000 },
        );
      },
    });
  }

  protected cambiarEstado(reporte: Reporte, estado: EstadoReporte): void {
    if (estado === reporte.estado) return;
    this.marcarEnProceso(reporte.id, true);
    this.reportesService.cambiarEstado(reporte.id, estado).subscribe({
      next: (actualizado) => {
        this.reportes.update((lista) =>
          lista.map((r) => (r.id === reporte.id ? actualizado : r)),
        );
        this.marcarEnProceso(reporte.id, false);
        this.snackBar.open('Estado actualizado.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.marcarEnProceso(reporte.id, false);
        this.snackBar.open(
          `No se pudo actualizar (status ${err.status ?? 'sin conexión'}).`,
          'OK',
          { duration: 4000 },
        );
      },
    });
  }

  private marcarEnProceso(id: number, activo: boolean): void {
    this.enProceso.update((set) => {
      const copia = new Set(set);
      if (activo) copia.add(id);
      else copia.delete(id);
      return copia;
    });
  }

  private confirmar(mensaje: string): Promise<boolean> {
    // Confirm nativo para la zona de pruebas; luego se puede reemplazar por un MatDialog.
    return Promise.resolve(window.confirm(mensaje));
  }
}
