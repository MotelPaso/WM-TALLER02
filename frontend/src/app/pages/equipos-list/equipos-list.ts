import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { etiquetaEstadoEquipo, Equipo, ESTADOS_EQUIPO, EstadoEquipo } from '../../models';
import { EquiposService } from '../../services/equipos.service';

@Component({
  selector: 'app-equipos-list',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './equipos-list.html',
  styleUrl: './equipos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquiposList implements OnInit {
  private readonly equiposService = inject(EquiposService);

  protected readonly columnas = ['nombre', 'tipo', 'ubicacion', 'estado'];
  protected readonly estados = ESTADOS_EQUIPO;

  protected readonly q = new FormControl('', { nonNullable: true });
  protected readonly estado = new FormControl<'todos' | EstadoEquipo>('todos', { nonNullable: true });

  protected readonly equipos = signal<Equipo[]>([]);
  protected readonly cargando = signal(false);
  protected readonly cargado = signal(false);
  protected readonly mensajeError = signal('');

  protected etiquetaEstado = etiquetaEstadoEquipo;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.equiposService
      .listar({ q: this.q.value || undefined, estado: this.estado.value })
      .subscribe({
        next: (equipos) => {
          this.equipos.set(equipos);
          this.cargando.set(false);
          this.cargado.set(true);
        },
        error: (err) => {
          this.mensajeError.set(
            `No se pudo cargar el listado (status ${err.status ?? 'sin conexión'}). Revisa que el backend esté corriendo en localhost:8000.`,
          );
          this.cargando.set(false);
          this.cargado.set(true);
        },
      });
  }
}
