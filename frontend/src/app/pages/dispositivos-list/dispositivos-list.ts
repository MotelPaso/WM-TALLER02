import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { debounceTime, map, merge } from 'rxjs';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { FiltroSelect } from '../../components/filtro-select/filtro-select';
import {
  Dispositivo,
  DispositivoFiltros,
  Edificio,
  ETIQUETAS_ESTADO_DISPOSITIVO,
  EstadoDispositivo,
  OpcionFiltro,
  Sala,
  TipoDispositivo,
} from '../../models';
import { DispositivosService } from '../../services/dispositivos.service';
import { AuthService } from '../../services/auth.service';
import { TarjetaDispositivo } from '../../components/tarjeta-dispositivo/tarjeta-dispositivo';
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
    RouterLink,
    EstadoVacio,
    FiltroSelect,
    TarjetaSala,
    TarjetaDispositivo,
  ],
  templateUrl: './dispositivos-list.html',
  styleUrl: './dispositivos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivosList implements OnInit {
  private readonly dispositivosService = inject(DispositivosService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly esTecnico = computed(() => this.auth.usuario()?.rol?.nombre === 'tecnico');
  protected readonly columnas = ['nombre', 'tipo', 'ubicacion', 'estado'];
  protected readonly vista = signal<'sala' | 'cuadricula'>('sala');

  protected readonly filtros = this.fb.group({
    q: [''],
    estado: this.fb.control<number | null>(null),
    tipoId: this.fb.control<number | null>(null),
    edificioId: this.fb.control<number | null>(null),
    salaId: this.fb.control<number | null>(null),
  });

  private readonly valoresFiltros = toSignal(
    merge(
      this.filtros.controls.q.valueChanges.pipe(debounceTime(300)),
      this.filtros.controls.estado.valueChanges,
      this.filtros.controls.tipoId.valueChanges,
      this.filtros.controls.edificioId.valueChanges,
      this.filtros.controls.salaId.valueChanges,
    ).pipe(map(() => this.filtros.getRawValue())),
    { initialValue: this.filtros.getRawValue() },
  );

  protected readonly estados = signal<EstadoDispositivo[]>([]);
  protected readonly todasSalas = signal<Sala[]>([]);
  protected readonly tipos = signal<TipoDispositivo[]>([]);
  protected readonly edificios = signal<Edificio[]>([]);

  // Salas filtradas según el edificio seleccionado en el filtro
  protected readonly salasFiltradas = computed<Sala[]>(() => {
    const edificioId = this.valoresFiltros().edificioId;
    if (!edificioId) return this.todasSalas();
    return this.todasSalas().filter((s) => s.edificio?.id === edificioId);
  });

  protected readonly opcionesSalas = computed<OpcionFiltro[]>(() =>
    this.salasFiltradas().map((sala) => ({ id: sala.id, label: sala.codigo })),
  );
  protected readonly opcionesTipos = computed<OpcionFiltro[]>(() =>
    this.tipos().map((tipo) => ({ id: tipo.id, label: tipo.nombre })),
  );
  protected readonly opcionesEstados = computed<OpcionFiltro[]>(() =>
    this.estados().map((estado) => ({
      id: estado.id,
      label: ETIQUETAS_ESTADO_DISPOSITIVO[estado.nombre] ?? estado.nombre,
    })),
  );
  protected readonly opcionesEdificios = computed<OpcionFiltro[]>(() =>
    this.edificios().map((edificio) => ({ id: edificio.id, label: edificio.nombre })),
  );

  private readonly parametros = computed<DispositivoFiltros>(
    () => {
      const { q, estado, tipoId, edificioId, salaId } = this.valoresFiltros();
      return {
        q: q.trim() || undefined,
        estado: this.estados().find((item) => item.id === estado)?.nombre,
        tipo_id: tipoId ?? undefined,
        edificio_id: edificioId ?? undefined,
        sala_id: salaId ?? undefined,
      };
    },
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );

  protected readonly dispositivosRecurso = rxResource({
    params: () => this.parametros(),
    stream: ({ params }) => this.dispositivosService.getDispositivos(params),
  });

  private readonly ultimaCarga = linkedSignal<Dispositivo[] | undefined, Dispositivo[] | undefined>({
    source: () =>
      this.dispositivosRecurso.hasValue() ? this.dispositivosRecurso.value() : undefined,
    computation: (actual, previa) => actual ?? previa?.value,
  });

  protected readonly dispositivos = computed<Dispositivo[]>(() => this.ultimaCarga() ?? []);
  protected readonly cargando = computed(() => this.dispositivosRecurso.isLoading());
  protected readonly cargado = computed(() => this.ultimaCarga() !== undefined);
  protected readonly mensajeError = computed(() => {
    const err = this.dispositivosRecurso.error();
    if (!err) return '';
    const status = err instanceof HttpErrorResponse ? err.status : undefined;
    return `No se pudo cargar el listado (status ${status ?? 'sin conexión'}). Revisa que el backend esté corriendo en localhost:8000.`;
  });

  protected readonly salasConDispositivos = computed(() => {
    const ids = new Set(this.dispositivos().map((dispositivo) => dispositivo.sala.id));
    return this.salasFiltradas().filter((sala) => ids.has(sala.id));
  });

  constructor() {
    const { edificioId, salaId } = this.filtros.controls;

    edificioId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      salaId.setValue(null);
    });
  }

  ngOnInit(): void {
    this.cargarSalas();
    this.cargarTipos();
    this.cargarEstados();
    this.cargarEdificios();
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
        this.todasSalas.set(salas);
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

  protected cargarEdificios(): void {
    this.dispositivosService.getEdificios().subscribe({
      next: (edificios) => {
        this.edificios.set(edificios);
      },
    });
  }

  protected cargar(): void {
    this.dispositivosRecurso.reload();
  }

  protected limpiarFiltros() {
    this.filtros.reset();
  }
}
