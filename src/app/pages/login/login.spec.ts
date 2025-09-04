import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import 'jasmine'; // Explicitly import Jasmine types

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // This should now work without errors
    expect(component).toBeTruthy();
  });
});