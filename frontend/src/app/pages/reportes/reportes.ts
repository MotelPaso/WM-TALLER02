import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { ReporteChips } from '../../components/reporte-chips/reporte-chips';
import { TarjetaDispositivo } from '../../components/tarjeta-dispositivo/tarjeta-dispositivo';
import { Confirmar } from '../../dialogs/confirmar/confirmar';
import { GestionarReporte } from '../../dialogs/gestionar-reporte/gestionar-reporte';
import { ESTADOS_REPORTE, etiquetaEstadoReporte, etiquetaPrioridad, Reporte } from '../../models';
import { AuthService } from '../../services/auth.service';
import { ReportesService } from '../../services/reportes.service';

export interface GrupoSalaReportes {
  sala: string;
  reportes: Reporte[];
}

@Component({
  selector: 'app-reportes',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    RouterLink,
    EstadoVacio,
    ReporteChips,
    TarjetaDispositivo,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reportes implements OnInit {
  private readonly reportesService = inject(ReportesService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly estados = ESTADOS_REPORTE;
  protected readonly esTecnico = computed(() => this.auth.usuario()?.rol?.nombre === 'tecnico');

  protected readonly filtros = this.fb.group({
    q: [''],
    estado: ['todos'],
    prioridad: ['todas'],
    sala: ['todas'],
  });

  private readonly filtroValores = signal({
    q: '',
    estado: 'todos',
    prioridad: 'todas',
    sala: 'todas',
  });

  protected readonly reportes = signal<Reporte[]>([]);
  protected readonly cargando = signal(false);
  protected readonly cargado = signal(false);
  protected readonly mensajeError = signal('');
  /** ids de reportes cuyo cambio de estado/eliminación está en vuelo */
  protected readonly enProceso = signal<Set<number>>(new Set());

  // ===== KPIs: conteos sobre TODOS los reportes (sin aplicar filtros) =====
  protected readonly conteoTotal = computed(() => this.reportes().length);
  protected readonly conteoAbiertos = computed(
    () => this.reportes().filter((r) => r.estado?.nombre === 'abierto').length,
  );
  protected readonly conteoEnProceso = computed(
    () => this.reportes().filter((r) => r.estado?.nombre === 'en_proceso').length,
  );
  protected readonly conteoResueltos = computed(
    () => this.reportes().filter((r) => r.estado?.nombre === 'resuelto').length,
  );

  protected etiquetaEstado = etiquetaEstadoReporte;
  protected etiquetaPrioridad = etiquetaPrioridad;

  constructor() {
    this.filtros.valueChanges.subscribe((vals) => {
      this.filtroValores.set({
        q: vals.q ?? '',
        estado: vals.estado ?? 'todos',
        prioridad: vals.prioridad ?? 'todas',
        sala: vals.sala ?? 'todas',
      });
    });
  }

  /** Aplica filtro de estado al hacer clic en una tarjeta KPI.
   *  Si el estado ya está activo, lo quita (vuelve a "todos"). */
  protected filtrarPorEstado(estado: string): void {
    const actual = this.filtros.controls.estado.value;
    this.filtros.controls.estado.setValue(actual === estado ? 'todos' : estado);
  }

  protected readonly salasDisponibles = computed<string[]>(() => {
    const salasSet = new Set<string>();
    for (const r of this.reportes()) {
      if (r.dispositivo?.sala?.codigo) {
        salasSet.add(r.dispositivo.sala.codigo);
      }
    }
    return Array.from(salasSet).sort();
  });

  protected readonly reportesFiltrados = computed<Reporte[]>(() => {
    const { q, estado, prioridad, sala } = this.filtroValores();
    const query = (q || '').trim().toLowerCase();

    return this.reportes().filter((r) => {
      // Filtro texto q
      if (query) {
        const codigoRep = this.formatoCodigo(r.id).toLowerCase();
        const titulo = (r.titulo || '').toLowerCase();
        const descripcion = (r.descripcion || '').toLowerCase();
        const creador = (r.creado_por?.nombre || '').toLowerCase();
        const codigoDisp = (r.dispositivo?.codigo_inventario || '').toLowerCase();
        const tipoDisp = (r.dispositivo?.tipo?.nombre || '').toLowerCase();
        const salaDisp = (r.dispositivo?.sala?.codigo || '').toLowerCase();

        const match =
          codigoRep.includes(query) ||
          String(r.id).includes(query) ||
          titulo.includes(query) ||
          descripcion.includes(query) ||
          creador.includes(query) ||
          codigoDisp.includes(query) ||
          tipoDisp.includes(query) ||
          salaDisp.includes(query);

        if (!match) return false;
      }

      // Filtro estado
      if (estado !== 'todos' && r.estado?.nombre !== estado) {
        return false;
      }

      // Filtro prioridad
      if (prioridad !== 'todas') {
        if (prioridad === 'sin_prioridad') {
          if (r.prioridad) return false;
        } else if (r.prioridad?.nombre !== prioridad) {
          return false;
        }
      }

      // Filtro sala
      if (sala !== 'todas' && r.dispositivo?.sala?.codigo !== sala) {
        return false;
      }

      return true;
    });
  });

  protected readonly reportesPorSala = computed<GrupoSalaReportes[]>(() => {
    const mapa = new Map<string, Reporte[]>();
    for (const r of this.reportesFiltrados()) {
      const codigoSala = r.dispositivo?.sala?.codigo ?? 'Sin sala';
      if (!mapa.has(codigoSala)) {
        mapa.set(codigoSala, []);
      }
      mapa.get(codigoSala)!.push(r);
    }
    return Array.from(mapa.entries()).map(([sala, reportes]) => ({
      sala,
      reportes,
    }));
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.reportesService.listar().subscribe({
      next: (reportes) => {
        this.reportes.set(reportes);
        this.cargando.set(false);
        this.cargado.set(true);
      },
      error: (err) => {
        this.mensajeError.set(
          `No se pudieron cargar los reportes (status ${err.status ?? 'sin conexión'}). Revisa que el backend esté corriendo en localhost:8000.`,
        );
        this.cargando.set(false);
        this.cargado.set(true);
      },
    });
  }

  protected formatoCodigo(id: number): string {
    return `REP-${String(id).padStart(4, '0')}`;
  }

  /** Un reporte se puede eliminar si es propio y sigue "abierto". */
  protected sePuedeEliminar(reporte: Reporte): boolean {
    const usuario = this.auth.usuario();
    return (
      !!usuario && reporte.creado_por?.id === usuario.id && reporte.estado?.nombre === 'abierto'
    );
  }

  protected eliminar(reporte: Reporte): void {
    const dialogRef = this.dialog.open(Confirmar, {
      width: '440px',
      data: {
        titulo: `¿Eliminar ${this.formatoCodigo(reporte.id)}?`,
        mensaje: `¿Estás seguro de que deseas eliminar el reporte "${reporte.titulo}"? Esta acción no se puede deshacer.`,
        accion: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      this.marcarEnProceso(reporte.id, true);
      this.reportesService.eliminar(reporte.id).subscribe({
        next: () => {
          this.reportes.update((lista) => lista.filter((r) => r.id !== reporte.id));
          this.marcarEnProceso(reporte.id, false);
          this.snackBar.open('Reporte eliminado.', 'OK', { duration: 3000 });
        },
        error: (err) => {
          this.marcarEnProceso(reporte.id, false);
          const detalle =
            err.error?.detail ?? `No se pudo eliminar (${err.status ?? 'sin conexión'}).`;
          this.snackBar.open(detalle, 'OK', {
            duration: 4000,
          });
        },
      });
    });
  }

  protected abrirGestionar(reporte: Reporte): void {
    const dialogRef = this.dialog.open(GestionarReporte, {
      data: reporte,
      width: '560px',
    });

    dialogRef.afterClosed().subscribe((actualizado?: Reporte) => {
      if (actualizado && actualizado.id) {
        this.reportes.update((lista) =>
          lista.map((r) => (r.id === actualizado.id ? actualizado : r)),
        );
      } else if (actualizado) {
        this.cargar();
      }
    });
  }

  protected exportarCSV(): void {
    const lista = this.reportesFiltrados();
    if (lista.length === 0) {
      this.snackBar.open('No hay reportes para exportar con los filtros actuales.', 'OK', {
        duration: 3000,
      });
      return;
    }

    const headers = [
      'Código',
      'Título',
      'Descripción',
      'Estado',
      'Prioridad',
      'Código Dispositivo',
      'Tipo Dispositivo',
      'Edificio',
      'Sala',
      'Reportado Por',
      'Fecha Creación',
      'Solución Técnica',
    ];

    const filas = lista.map((r) => [
      this.formatoCodigo(r.id),
      r.titulo ?? '',
      r.descripcion ?? '',
      this.etiquetaEstado(r.estado?.nombre ?? ''),
      r.prioridad ? this.etiquetaPrioridad(r.prioridad) : 'Sin prioridad',
      r.dispositivo?.codigo_inventario ?? '',
      r.dispositivo?.tipo?.nombre ?? '',
      r.dispositivo?.sala?.edificio?.nombre ?? '',
      r.dispositivo?.sala?.codigo ?? '',
      r.creado_por?.nombre ?? '',
      r.creado_en ? new Date(r.creado_en).toLocaleString('es-CL') : '',
      r.notas_resolucion ?? '',
    ]);

    // \uFEFF es el BOM UTF-8 para que Excel abra acentos y caracteres especiales correctamente
    const csvContent =
      '\uFEFF' +
      [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'),
        ...filas.map((fila) =>
          fila.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(';'),
        ),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `reportes_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.snackBar.open(`Se exportaron ${lista.length} reportes a CSV.`, 'OK', { duration: 3000 });
  }

  private marcarEnProceso(id: number, activo: boolean): void {
    this.enProceso.update((set) => {
      const copia = new Set(set);
      if (activo) copia.add(id);
      else copia.delete(id);
      return copia;
    });
  }
}
