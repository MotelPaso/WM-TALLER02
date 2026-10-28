import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class EstadoVacio {
  readonly icono = input.required<string>();
  readonly titulo = input.required<string>();
  readonly mensaje = input('');
  readonly tono = input<'neutro' | 'error'>('neutro');

  protected readonly claseIcono = computed(() =>
    this.tono() === 'error' ? 'bg-peligro text-ladrillo' : 'bg-neutro text-texto-suave',
  );
}
