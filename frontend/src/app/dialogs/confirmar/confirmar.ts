import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmarData {
  titulo?: string;
  mensaje?: string;
  accion?: string;
  error?: string;
}

@Component({
  selector: 'app-confirmar',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmar.html',
  styleUrl: './confirmar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confirmar {
  readonly data = inject<ConfirmarData>(MAT_DIALOG_DATA, { optional: true });
}
