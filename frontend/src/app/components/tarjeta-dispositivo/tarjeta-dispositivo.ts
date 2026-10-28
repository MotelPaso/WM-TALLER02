import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { EstadoDispositivo, etiquetaEstadoDispositivo } from '../../models';

@Component({
  selector: 'app-tarjeta-dispositivo',
  templateUrl: './tarjeta-dispositivo.html',
  styleUrl: './tarjeta-dispositivo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TarjetaDispositivo {
  readonly codigo = input.required<string>();
  readonly detalle = input.required<string>();
  readonly estado = input.required<EstadoDispositivo>();

  protected readonly etiqueta = computed(() => etiquetaEstadoDispositivo(this.estado()));
}
