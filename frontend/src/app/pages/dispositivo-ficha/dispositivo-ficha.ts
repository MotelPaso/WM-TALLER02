import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { ReporteChips } from '../../components/reporte-chips/reporte-chips';
import { Confirmar } from '../../dialogs/confirmar/confirmar';
import { ReportarFalla } from '../../dialogs/reportar-falla/reportar-falla';

@Component({
  selector: 'app-dispositivo-ficha',
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, EstadoVacio, ReporteChips],
  templateUrl: './dispositivo-ficha.html',
  styleUrl: './dispositivo-ficha.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivoFicha {
  private readonly dialog = inject(MatDialog);

  protected abrirReportarFalla(): void {
    this.dialog.open(ReportarFalla, { width: '560px' });
  }

  protected abrirConfirmarEliminar(): void {
    this.dialog.open(Confirmar, { width: '440px' });
  }
}
