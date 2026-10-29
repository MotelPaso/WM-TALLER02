import { Component, input } from '@angular/core';
import { Dispositivo, Sala } from '../../models';
import { TarjetaDispositivo } from '../tarjeta-dispositivo/tarjeta-dispositivo';
import { RouterLink } from '@angular/router';

@Component({
  imports: [TarjetaDispositivo, RouterLink],
  selector: 'app-tarjeta-sala',
  styleUrl: './tarjeta-sala.css',
  templateUrl: './tarjeta-sala.html',
})
export class TarjetaSala {
  readonly sala = input.required<Sala>();
  readonly dispositivos = input.required<Dispositivo[]>();

  readonly dispositivos_en_sala = () =>
    this.dispositivos().filter((d) => d.sala.id === this.sala().id);
}
