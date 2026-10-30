import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { ReporteChips } from '../../components/reporte-chips/reporte-chips';
import { Confirmar } from '../../dialogs/confirmar/confirmar';
import { ReportarFalla } from '../../dialogs/reportar-falla/reportar-falla';
import { DispositivosService } from '../../services/dispositivos.service';
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
  private readonly dispositivosService = inject(DispositivosService);

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
    this.dialog.open(ReportarFalla, { width: '560px' });
  }

  protected abrirConfirmarEliminar(): void {
    this.dialog.open(Confirmar, { width: '440px' });
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
