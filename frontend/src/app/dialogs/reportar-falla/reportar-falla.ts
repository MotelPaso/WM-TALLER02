import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reportar-falla',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './reportar-falla.html',
  styleUrl: './reportar-falla.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportarFalla {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
