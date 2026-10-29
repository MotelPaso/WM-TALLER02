import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { OpcionFiltro } from '../../models';

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  selector: 'app-filtro-select',
  styleUrl: './filtro-select.css',
  templateUrl: './filtro-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltroSelect<T = number> {
  readonly control = input.required<FormControl<T | null>>();
  readonly opciones = input.required<OpcionFiltro[]>();
  readonly etiqueta = input.required<string>();
  readonly textoTodos = input('Todos');
}
