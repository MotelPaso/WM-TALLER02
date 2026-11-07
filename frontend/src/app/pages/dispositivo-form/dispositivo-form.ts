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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, forkJoin, of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { DispositivosService } from '../../services/dispositivos.service';
import {
  DispositivoCreatePayload,
  DispositivoUpdatePayload,
  Edificio,
  Sala,
  TipoDispositivo,
} from '../../models';

@Component({
  selector: 'app-dispositivo-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './dispositivo-form.html',
  styleUrl: './dispositivo-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositivoForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly auth = inject(AuthService);
  private readonly dispositivosService = inject(DispositivosService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly editando = signal(false);
  protected readonly dispositivoId = signal<number | null>(null);
  protected readonly codigoActual = signal('');

  protected readonly tipos = signal<TipoDispositivo[]>([]);
  protected readonly edificios = signal<Edificio[]>([]);
  protected readonly todasSalas = signal<Sala[]>([]);
  protected readonly edificioSeleccionado = signal<number | null>(null);

  protected readonly salasFiltradas = computed(() => {
    const edId = this.edificioSeleccionado();
    if (!edId) return [];
    return this.todasSalas().filter((s) => s.edificio?.id === edId);
  });

  protected readonly form = this.fb.group({
    codigo_inventario: ['', [Validators.required, Validators.maxLength(30)]],
    tipo_dispositivo_id: this.fb.control<number | null>(null, Validators.required),
    edificio_id: this.fb.control<number | null>(null, Validators.required),
    sala_id: this.fb.control<number | null>({ value: null, disabled: true }, Validators.required),
    descripcion: ['', Validators.maxLength(500)],
    fuera_de_servicio: [false],
  });

  constructor() {
    this.form.controls.edificio_id.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((edificioId) => {
        this.edificioSeleccionado.set(edificioId);
        if (edificioId) {
          this.form.controls.sala_id.enable();
          const salaActual = this.form.controls.sala_id.value;
          if (salaActual) {
            const pertenece = this.todasSalas().some(
              (s) => s.id === salaActual && s.edificio?.id === edificioId,
            );
            if (!pertenece) {
              this.form.controls.sala_id.setValue(null);
            }
          }
        } else {
          this.form.controls.sala_id.disable();
          this.form.controls.sala_id.setValue(null);
        }
      });
  }

  ngOnInit(): void {
    // La protección de rol se delega al tecnicoGuard en app.routes.ts.
    // Este componente solo es alcanzable si el usuario ya es técnico.
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editando.set(true);
      this.dispositivoId.set(Number(idParam));
    }

    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.error.set('');

    const id = this.dispositivoId();

    forkJoin({
      tipos: this.dispositivosService.getTiposDispositivo(),
      edificios: this.dispositivosService.getEdificios(),
      salas: this.dispositivosService.getSalas(),
      dispositivo: this.editando() && id ? this.dispositivosService.getDispositivo(id) : of(null),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ tipos, edificios, salas, dispositivo }) => {
          this.tipos.set(tipos);
          this.edificios.set(edificios);
          this.todasSalas.set(salas);

          if (dispositivo) {
            this.codigoActual.set(dispositivo.codigo_inventario);
            this.edificioSeleccionado.set(dispositivo.sala.edificio.id);
            this.form.controls.sala_id.enable();
            this.form.patchValue({
              codigo_inventario: dispositivo.codigo_inventario,
              tipo_dispositivo_id: dispositivo.tipo.id,
              edificio_id: dispositivo.sala.edificio.id,
              sala_id: dispositivo.sala.id,
              descripcion: dispositivo.descripcion ?? '',
              fuera_de_servicio: dispositivo.estado.nombre === 'fuera_de_servicio',
            });
          }
        },
        error: (err) => {
          this.error.set(
            `No pudimos cargar los datos necesarios (status ${err.status ?? 'sin conexión'}). Revisa el backend.`,
          );
        },
      });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const formVal = this.form.getRawValue();
    const codigo = formVal.codigo_inventario.trim().toUpperCase();

    if (this.editando()) {
      const id = this.dispositivoId();
      if (!id) return;

      const payload: DispositivoUpdatePayload = {
        codigo_inventario: codigo,
        tipo_dispositivo_id: formVal.tipo_dispositivo_id!,
        sala_id: formVal.sala_id!,
        descripcion: formVal.descripcion.trim() || null,
        fuera_de_servicio: formVal.fuera_de_servicio,
      };

      this.dispositivosService
        .actualizarDispositivo(id, payload)
        .pipe(finalize(() => this.guardando.set(false)))
        .subscribe({
          next: (disp) => {
            this.snackBar.open('Dispositivo actualizado correctamente.', 'OK', { duration: 3000 });
            this.router.navigate(['/dispositivos', disp.id]);
          },
          error: (err) => {
            if (err.status === 409) {
              this.error.set(
                err.error?.detail || `Ya existe un dispositivo con el código ${codigo}.`,
              );
            } else {
              this.error.set(
                err.error?.detail || 'Ocurrió un error al actualizar el dispositivo.',
              );
            }
          },
        });
    } else {
      const payload: DispositivoCreatePayload = {
        codigo_inventario: codigo,
        tipo_dispositivo_id: formVal.tipo_dispositivo_id!,
        sala_id: formVal.sala_id!,
        descripcion: formVal.descripcion.trim() || null,
      };

      this.dispositivosService
        .crearDispositivo(payload)
        .pipe(finalize(() => this.guardando.set(false)))
        .subscribe({
          next: (disp) => {
            this.snackBar.open('Dispositivo registrado correctamente.', 'OK', { duration: 3000 });
            this.router.navigate(['/dispositivos', disp.id]);
          },
          error: (err) => {
            if (err.status === 409) {
              this.error.set(
                err.error?.detail || `Ya existe un dispositivo con el código ${codigo}.`,
              );
            } else {
              this.error.set(err.error?.detail || 'Ocurrió un error al registrar el dispositivo.');
            }
          },
        });
    }
  }
}
