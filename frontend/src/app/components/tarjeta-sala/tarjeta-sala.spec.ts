import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarjetaSala } from './tarjeta-sala';

describe('TarjetaSala', () => {
  let component: TarjetaSala;
  let fixture: ComponentFixture<TarjetaSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaSala],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaSala);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sala', {
      id: 1,
      codigo: 'X1-29',
      numero: '29',
      edificio: { id: 1, numero: 'X1' },
    });
    fixture.componentRef.setInput('dispositivos', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
