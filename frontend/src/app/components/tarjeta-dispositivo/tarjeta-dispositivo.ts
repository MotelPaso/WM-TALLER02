import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { EstadoDispositivo } from '../../models';

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

  protected readonly etiqueta = 'Operativo';

  readonly ESTADOS_DISPOSITIVO: EstadoDispositivoEtiqueta[] = [
    { valor: 'operativo', etiqueta: 'Operativo' },
    { valor: 'con_falla', etiqueta: 'Con falla' },
    { valor: 'en_reparacion', etiqueta: 'En reparación' },
    { valor: 'fuera_de_servicio', etiqueta: 'Fuera de servicio' },
  ];

  readonly etiquetaEstadoDispositivo = (estado: EstadoDispositivo): string => {
    return (
      this.ESTADOS_DISPOSITIVO.find((e) => e.valor === estado.nombre)?.etiqueta ?? estado.nombre
    );
  };
}
interface EstadoDispositivoEtiqueta {
  valor: string;
  etiqueta: string;
}
