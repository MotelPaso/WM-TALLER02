import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmar.html',
  styleUrl: './confirmar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confirmar {}
