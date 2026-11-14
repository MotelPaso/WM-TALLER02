import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-nota-solucion',
  templateUrl: './nota-solucion.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class NotaSolucion {
  readonly texto = input.required<string>();
  readonly recortar = input(false);
}
