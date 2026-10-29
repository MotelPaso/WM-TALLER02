import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { FiltroSelect } from './filtro-select';

describe('FiltroSelect', () => {
  let component: FiltroSelect;
  let fixture: ComponentFixture<FiltroSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroSelect);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl<number | null>(null));
    fixture.componentRef.setInput('opciones', [{ id: 1, label: 'Uno' }]);
    fixture.componentRef.setInput('etiqueta', 'Tipo');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
