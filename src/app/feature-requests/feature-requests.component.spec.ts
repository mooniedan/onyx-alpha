import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureRequestsComponent } from './feature-requests.component';

describe('FeatureRequestsComponent', () => {
  let component: FeatureRequestsComponent;
  let fixture: ComponentFixture<FeatureRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureRequestsComponent]
    });
    fixture = TestBed.createComponent(FeatureRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
