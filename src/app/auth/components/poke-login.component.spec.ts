import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeLoginComponent } from './poke-login.component';

describe('PokeLoginComponent', () => {
  let component: PokeLoginComponent;
  let fixture: ComponentFixture<PokeLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PokeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
