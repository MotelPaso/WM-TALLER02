import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  Dispositivo,
  ETIQUETAS_ESTADO_DISPOSITIVO,
  GRAVEDAD_ESTADO_DISPOSITIVO,
  Sala,
} from '../../models';
import { TarjetaDispositivo } from '../tarjeta-dispositivo/tarjeta-dispositivo';

const VISIBLES = 8;
const LIMITE_SALA_ANCHA = 4;

const PLURALES: Record<string, string> = {
  fuera_de_servicio: 'fuera de servicio',
  en_reparacion: 'en reparación',
  con_falla: 'con falla',
  operativo: 'operativos',
};

function gravedad(dispositivo: Dispositivo): number {
  const indice = GRAVEDAD_ESTADO_DISPOSITIVO.indexOf(dispositivo.estado.nombre);
  return indice === -1 ? GRAVEDAD_ESTADO_DISPOSITIVO.length : indice;
}

@Component({
  imports: [TarjetaDispositivo, RouterLink],
  selector: 'app-tarjeta-sala',
  styleUrl: './tarjeta-sala.css',
  templateUrl: './tarjeta-sala.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.sala-ancha]': 'ancha()' },
})
export class TarjetaSala {
  readonly sala = input.required<Sala>();
  readonly dispositivos = input.required<Dispositivo[]>();

  protected readonly expandida = signal(false);

  protected readonly enSala = computed(() =>
    this.dispositivos()
      .filter((d) => d.sala.id === this.sala().id)
      .sort(
        (a, b) => gravedad(a) - gravedad(b) || a.codigo_inventario.localeCompare(b.codigo_inventario),
      ),
  );

  protected readonly ancha = computed(() => this.enSala().length > LIMITE_SALA_ANCHA);
  protected readonly hayMas = computed(() => this.enSala().length > VISIBLES);
  protected readonly visibles = computed(() =>
    this.expandida() ? this.enSala() : this.enSala().slice(0, VISIBLES),
  );

  protected readonly resumen = computed(() =>
    GRAVEDAD_ESTADO_DISPOSITIVO.map((estado) => {
      const cantidad = this.enSala().filter((d) => d.estado.nombre === estado).length;
      const texto =
        cantidad === 1 && estado === 'operativo'
          ? 'operativo'
          : (PLURALES[estado] ?? ETIQUETAS_ESTADO_DISPOSITIVO[estado]);
      return { estado, cantidad, texto };
    }).filter((item) => item.cantidad > 0),
  );
}
