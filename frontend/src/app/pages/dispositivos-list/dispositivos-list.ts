import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { FiltroSelect } from '../../components/filtro-select/filtro-select';
import { TarjetaDispositivo } from '../../components/tarjeta-dispositivo/tarjeta-dispositivo';
import {
  Dispositivo,
  DispositivoFiltros,
  EstadoDispositivo,
  OpcionFiltro,
  Sala,
  TipoDispositivo,
} from '../../models';
import { DispositivosService } from '../../services/dispositivos.service';
import { TarjetaSala } from '../../components/tarjeta-sala/tarjeta-sala';

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
    RouterLink,
    EstadoVacio,
    TarjetaDispositivo,
    FiltroSelect,
    TarjetaSala,
  ],
  templateUrl: './dispositivos-list.html',
  styleUrl: './dispositivos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivosList implements OnInit {
  private readonly dispositivosService = inject(DispositivosService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly columnas = ['nombre', 'tipo', 'ubicacion', 'estado'];

  protected readonly filtros = this.fb.group({
    q: [''],
    estado: this.fb.control<number | null>(null),
    tipoId: this.fb.control<number | null>(null),
    salaId: this.fb.control<number | null>(null),
  });

  protected readonly estados = signal<EstadoDispositivo[]>([]);
  protected readonly dispositivos = signal<Dispositivo[]>([]);
  protected readonly salas = signal<Sala[]>([]);
  protected readonly tipos = signal<TipoDispositivo[]>([]);

  protected readonly opcionesSalas = computed<OpcionFiltro[]>(() =>
    this.salas().map((sala) => ({ id: sala.id, label: sala.codigo })),
  );
  protected readonly opcionesTipos = computed<OpcionFiltro[]>(() =>
    this.tipos().map((tipo) => ({ id: tipo.id, label: tipo.nombre })),
  );
  protected readonly opcionesEstados = computed<OpcionFiltro[]>(() =>
    this.estados().map((estado) => ({ id: estado.id, label: estado.nombre })),
  );

  protected readonly salasConDispositivos = computed(() => {
    const ids = new Set(this.dispositivos().map((dispositivo) => dispositivo.sala.id));
    return this.salas().filter((sala) => ids.has(sala.id));
  });

  protected readonly cargando = signal(false);
  protected readonly cargado = signal(false);
  protected readonly mensajeError = signal('');

  constructor() {
    this.filtros.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargar());
  }

  ngOnInit(): void {
    this.cargarSalas();
    this.cargarTipos();
    this.cargarEstados();
    this.cargar();
  }

  protected cargarEstados(): void {
    this.dispositivosService.getEstados().subscribe({
      next: (estados: any) => {
        this.estados.set(estados);
      },
    });
  }

  protected cargarSalas(): void {
    this.dispositivosService.getSalas().subscribe({
      next: (salas) => {
        this.salas.set(salas);
      },
    });
  }

  protected cargarTipos(): void {
    this.dispositivosService.getTiposDispositivo().subscribe({
      next: (tipos) => {
        this.tipos.set(tipos);
      },
    });
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.dispositivosService.getDispositivos(this.filtrosActuales()).subscribe({
      next: (dispositivos) => {
        this.dispositivos.set(dispositivos);
        this.cargando.set(false);
        this.cargado.set(true);
        console.log(dispositivos);
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

  private filtrosActuales(): DispositivoFiltros {
    const { q, estado, tipoId, salaId } = this.filtros.getRawValue();
    const estadoSeleccionado = this.estados().find((item) => item.id === estado);

    return {
      q: q.trim() || undefined,
      estado: estadoSeleccionado?.nombre ?? undefined,
      tipo_id: tipoId ?? undefined,
      sala_id: salaId ?? undefined,
    };
  }
}
