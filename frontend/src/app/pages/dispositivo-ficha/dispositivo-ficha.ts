import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { ReporteChips } from '../../components/reporte-chips/reporte-chips';
import { Confirmar } from '../../dialogs/confirmar/confirmar';
import { ReportarFalla } from '../../dialogs/reportar-falla/reportar-falla';
import { DispositivosService } from '../../services/dispositivos.service';
import { AuthService } from '../../services/auth.service';
import { Dispositivo, Reporte } from '../../models';

@Component({
  selector: 'app-dispositivo-ficha',
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    EstadoVacio,
    ReporteChips,
    DatePipe,
  ],
  templateUrl: './dispositivo-ficha.html',
  styleUrl: './dispositivo-ficha.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivoFicha {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dispositivosService = inject(DispositivosService);
  private readonly auth = inject(AuthService);

  protected readonly esTecnico = computed(() => this.auth.usuario()?.rol?.nombre === 'tecnico');
  protected readonly cargando = signal(false);
  protected readonly cargando_reportes = signal(false);
  protected readonly error = signal('');

  protected readonly dispositivo = signal<Dispositivo | null>(null);
  protected readonly reportes = signal<Reporte[]>([]);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.getDispositivo(id);
    this.getReportes(id);
  }

  protected abrirReportarFalla(): void {
    const disp = this.dispositivo();
    if (!disp) return;
    const ref = this.dialog.open(ReportarFalla, { data: disp, width: '560px' });
    ref.afterClosed().subscribe((creado) => {
      if (creado) {
        this.getReportes(disp.id);
        this.getDispositivo(disp.id);
      }
    });
  }

  protected abrirConfirmarEliminar(): void {
    const disp = this.dispositivo();
    if (!disp) return;

    const ref = this.dialog.open(Confirmar, {
      width: '440px',
      data: {
        titulo: '¿Eliminar dispositivo?',
        mensaje: `Se eliminará permanentemente el dispositivo ${disp.codigo_inventario} (${disp.tipo.nombre}). Esta acción no se puede deshacer.`,
        accion: 'Eliminar',
      },
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      this.cargando.set(true);
      this.dispositivosService
        .eliminarDispositivo(disp.id)
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: () => {
            this.snackBar.open('Dispositivo eliminado correctamente.', 'OK', { duration: 3000 });
            this.router.navigate(['/dispositivos']);
          },
          error: (err) => {
            if (err.status === 409) {
              const refConflict = this.dialog.open(Confirmar, {
                width: '440px',
                data: {
                  titulo: 'No se puede eliminar',
                  mensaje:
                    err.error?.detail ||
                    'El dispositivo tiene reportes asociados; márcalo como fuera de servicio.',
                  accion: 'Ir a editar',
                },
              });
              refConflict.afterClosed().subscribe((irEditar) => {
                if (irEditar) {
                  this.router.navigate(['/dispositivos', disp.id, 'editar']);
                }
              });
            } else {
              this.snackBar.open(
                err.error?.detail || 'Ocurrió un error al eliminar el dispositivo.',
                'Cerrar',
                { duration: 4000 },
              );
            }
          },
        });
    });
  }

  protected getDispositivo(id: number): void {
    this.cargando.set(true);
    this.error.set('');

    this.dispositivosService
      .getDispositivo(id)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (dispositivo) => {
          this.dispositivo.set(dispositivo);
        },
        error: (err) => {
          this.error.set(
            err.status === 404
              ? 'Puede que se haya eliminado o que el enlace esté mal.'
              : `No pudimos cargar el dispositivo (status ${err.status ?? 'sin conexión'}). Revisa que el backend esté corriendo en localhost:8000.`,
          );
        },
      });
  }

  protected getReportes(id: number): void {
    this.cargando_reportes.set(true);

    this.dispositivosService
      .getReportesDispositivo(id)
      .pipe(finalize(() => this.cargando_reportes.set(false)))
      .subscribe({
        next: (reportes) => {
          this.reportes.set(reportes);
        },
      });
  }
}
