import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ReportesService } from '../../services/reportes.service';
import { ReportarFalla } from './reportar-falla';

describe('ReportarFalla', () => {
  it('no envía un título con solo espacios', async () => {
    const servicio = { crear: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [ReportarFalla],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { id: 1 } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: ReportesService, useValue: servicio },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReportarFalla);
    const componente = fixture.componentInstance as unknown as {
      form: { setValue: (v: object) => void; invalid: boolean };
      enviar: () => void;
    };

    componente.form.setValue({ titulo: '   ', descripcion: '   ' });
    componente.enviar();

    expect(componente.form.invalid).toBe(true);
    expect(servicio.crear).not.toHaveBeenCalled();
  });
});
