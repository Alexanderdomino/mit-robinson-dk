import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Radler } from './radler';

describe('Radler', () => {
  let component: Radler;
  let fixture: ComponentFixture<Radler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Radler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Radler);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
