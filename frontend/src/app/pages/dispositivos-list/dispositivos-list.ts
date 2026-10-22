import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { etiquetaEstadoDispositivo, Dispositivo, ESTADOS_DISPOSITIVO, EstadoDispositivo } from '../../models';
import { DispositivosService } from '../../services/dispositivos.service';

@Component({
  selector: 'app-dispositivos-list',
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
  templateUrl: './dispositivos-list.html',
  styleUrl: './dispositivos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivosList implements OnInit {
  private readonly dispositivosService = inject(DispositivosService);

  protected readonly columnas = ['nombre', 'tipo', 'ubicacion', 'estado'];
  protected readonly estados = ESTADOS_DISPOSITIVO;

  protected readonly q = new FormControl('', { nonNullable: true });
  protected readonly estado = new FormControl<'todos' | EstadoDispositivo>('todos', { nonNullable: true });

  protected readonly dispositivos = signal<Dispositivo[]>([]);
  protected readonly cargando = signal(false);
  protected readonly cargado = signal(false);
  protected readonly mensajeError = signal('');

  protected etiquetaEstado = etiquetaEstadoDispositivo;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.dispositivosService
      .listar({ q: this.q.value || undefined, estado: this.estado.value })
      .subscribe({
        next: (dispositivos) => {
          this.dispositivos.set(dispositivos);
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
