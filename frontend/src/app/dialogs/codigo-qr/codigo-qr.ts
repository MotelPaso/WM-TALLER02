import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toDataURL } from 'qrcode';

import { Dispositivo } from '../../models';

@Component({
  selector: 'app-codigo-qr',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './codigo-qr.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodigoQr {
  readonly data = inject<Dispositivo>(MAT_DIALOG_DATA);

  protected readonly imagen = signal('');
  protected readonly error = signal(false);

  constructor() {
    // El QR guarda solo el código de inventario: así no depende del dominio de la app.
    toDataURL(this.data.codigo_inventario, { width: 320, margin: 2 })
      .then((url) => this.imagen.set(url))
      .catch(() => this.error.set(true));
  }
}
