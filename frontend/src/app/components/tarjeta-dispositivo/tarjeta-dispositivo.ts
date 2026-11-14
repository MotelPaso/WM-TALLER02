import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Dispositivo, ETIQUETAS_ESTADO_DISPOSITIVO, iconoTipoDispositivo } from '../../models';

@Component({
  selector: 'app-tarjeta-dispositivo',
  templateUrl: './tarjeta-dispositivo.html',
  styleUrl: './tarjeta-dispositivo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TarjetaDispositivo {
  readonly dispositivo = input<Dispositivo>();
  readonly mostrarSala = input(false);

  protected readonly etiqueta = computed(() => {
    const nombre = this.dispositivo()?.estado.nombre;
    return nombre ? (ETIQUETAS_ESTADO_DISPOSITIVO[nombre] ?? nombre) : '';
  });

  protected readonly icono = computed(() => iconoTipoDispositivo(this.dispositivo()?.tipo?.nombre));

  protected readonly detalle = computed(() => {
    const d = this.dispositivo();
    if (!d) return '';
    return [d.codigo_inventario, this.mostrarSala() ? d.sala?.codigo : null, d.descripcion]
      .filter(Boolean)
      .join(' · ');
  });
}
