import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Dispositivo } from '../../models';

const ETIQUETAS_ESTADO: Record<string, string> = {
  operativo: 'Operativo',
  con_falla: 'Con falla',
  en_reparacion: 'En reparación',
  fuera_de_servicio: 'Fuera de servicio',
};

@Component({
  selector: 'app-tarjeta-dispositivo',
  templateUrl: './tarjeta-dispositivo.html',
  styleUrl: './tarjeta-dispositivo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TarjetaDispositivo {
  readonly dispositivo = input<Dispositivo>();

  protected readonly etiqueta = computed(() => {
    const nombre = this.dispositivo()?.estado.nombre;
    return nombre ? (ETIQUETAS_ESTADO[nombre] ?? nombre) : '';
  });
}
