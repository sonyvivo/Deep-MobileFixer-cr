import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSheetsComponent } from './job-sheets.component';

describe('JobSheetsComponent', () => {
  let component: JobSheetsComponent;
  let fixture: ComponentFixture<JobSheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSheetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
