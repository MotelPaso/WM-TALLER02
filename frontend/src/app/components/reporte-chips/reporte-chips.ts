import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { etiquetaEstadoReporte, etiquetaPrioridad, PrioridadReporte } from '../../models';

@Component({
  selector: 'app-reporte-chips',
  templateUrl: './reporte-chips.html',
  styleUrl: './reporte-chips.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap gap-2' },
})
export class ReporteChips {
  readonly prioridad = input<PrioridadReporte | undefined>(undefined);
  readonly estado = input.required<string>();

  protected etiquetaEstado = etiquetaEstadoReporte;
  protected etiquetaPrioridad = etiquetaPrioridad;
}
