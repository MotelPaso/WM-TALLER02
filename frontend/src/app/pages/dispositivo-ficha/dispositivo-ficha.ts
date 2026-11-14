import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, map } from 'rxjs';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { NotaSolucion } from '../../components/nota-solucion/nota-solucion';
import { ReporteChips } from '../../components/reporte-chips/reporte-chips';
import { Confirmar } from '../../dialogs/confirmar/confirmar';
import { GestionarReporte } from '../../dialogs/gestionar-reporte/gestionar-reporte';
import { ReportarFalla } from '../../dialogs/reportar-falla/reportar-falla';
import { DispositivosService } from '../../services/dispositivos.service';
import { AuthService } from '../../services/auth.service';
import { ETIQUETAS_ESTADO_DISPOSITIVO, Reporte } from '../../models';

@Component({
  selector: 'app-dispositivo-ficha',
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    EstadoVacio,
    ReporteChips,
    NotaSolucion,
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
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 },
  );

  protected readonly dispositivoRecurso = rxResource({
    params: () => this.id() || undefined,
    stream: ({ params }) => this.dispositivosService.getDispositivo(params),
  });

  protected readonly reportesRecurso = rxResource({
    params: () => this.id() || undefined,
    stream: ({ params }) => this.dispositivosService.getReportesDispositivo(params),
  });

  private readonly eliminando = signal(false);

  protected readonly dispositivo = computed(() =>
    this.dispositivoRecurso.hasValue() ? this.dispositivoRecurso.value() : null,
  );
  protected readonly reportes = computed(() =>
    this.reportesRecurso.hasValue() ? this.reportesRecurso.value() : [],
  );
  protected readonly cargando = computed(
    () =>
      this.eliminando() ||
      (this.dispositivoRecurso.isLoading() && !this.dispositivoRecurso.hasValue()),
  );
  protected readonly cargando_reportes = computed(() => this.reportesRecurso.isLoading());
  protected readonly etiquetaEstado = computed(() => {
    const nombre = this.dispositivo()?.estado.nombre ?? '';
    return ETIQUETAS_ESTADO_DISPOSITIVO[nombre] ?? nombre;
  });
  protected readonly titulo = computed(() => {
    const d = this.dispositivo();
    return d ? `${d.tipo.nombre} · ${d.sala.codigo}` : '';
  });
  private readonly historialListo = computed(
    () => this.reportesRecurso.hasValue() && !this.reportesRecurso.isLoading(),
  );
  protected readonly errorHistorial = computed(() => !!this.reportesRecurso.error());
  protected readonly puedeEliminar = computed(
    () => this.historialListo() && this.reportes().length === 0,
  );
  protected readonly puedeRetirar = computed(
    () =>
      this.historialListo() &&
      this.reportes().length > 0 &&
      this.dispositivo()?.estado.nombre !== 'fuera_de_servicio',
  );

  protected readonly error = computed(() => {
    const err = this.dispositivoRecurso.error();
    if (this.id() && !err) return '';
    const status = !err ? 404 : err instanceof HttpErrorResponse ? err.status : undefined;
    return status === 404
      ? 'Puede que se haya eliminado o que el enlace esté mal.'
      : `No pudimos cargar el dispositivo (status ${status ?? 'sin conexión'}). Revisa que el backend esté corriendo en localhost:8000.`;
  });

  protected abrirReportarFalla(): void {
    const disp = this.dispositivo();
    if (!disp) return;
    const ref = this.dialog.open(ReportarFalla, { data: disp, width: '560px' });
    ref.afterClosed().subscribe((creado) => {
      if (creado) {
        this.reportesRecurso.reload();
        this.dispositivoRecurso.reload();
      }
    });
  }

  /** Solo técnico: abre el diálogo para gestionar prioridad/estado del reporte. */
  protected abrirGestionar(reporte: Reporte): void {
    const ref = this.dialog.open(GestionarReporte, {
      data: reporte,
      width: '560px',
      autoFocus: 'first-heading',
    });
    ref.afterClosed().subscribe((actualizado?: Reporte) => {
      if (actualizado) {
        // Actualiza el reporte en la lista local sin recargar toda la ficha
        this.reportesRecurso.update((lista) =>
          lista?.map((r) => (r.id === actualizado.id ? actualizado : r)),
        );
        this.dispositivoRecurso.reload();
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

      this.eliminando.set(true);
      this.dispositivosService
        .eliminarDispositivo(disp.id)
        .pipe(finalize(() => this.eliminando.set(false)))
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

  protected abrirConfirmarFueraDeServicio(): void {
    const disp = this.dispositivo();
    if (!disp) return;

    this.dialog
      .open(Confirmar, {
        width: '440px',
        data: {
          titulo: '¿Marcar fuera de servicio?',
          mensaje: `${disp.tipo.nombre} ${disp.codigo_inventario} tiene reportes en su historial, por eso no se elimina: queda fuera de servicio y deja de recalcular su estado.`,
          accion: 'Marcar fuera de servicio',
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.dispositivosService
          .actualizarDispositivo(disp.id, { fuera_de_servicio: true })
          .subscribe({
            next: () => {
              this.snackBar.open('Dispositivo marcado fuera de servicio.', 'OK', { duration: 3000 });
              this.dispositivoRecurso.reload();
            },
            error: (err) =>
              this.snackBar.open(err.error?.detail || 'No se pudo actualizar el dispositivo.', 'Cerrar', {
                duration: 4000,
              }),
          });
      });
  }
}
