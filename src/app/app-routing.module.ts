import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceInputComponent } from './finance-input/finance-input.component';
import { CommunityComponent } from './community/community.component';

const routes: Routes = [
  {
    path: '',
    component: FinanceInputComponent,
  },
  {
    path: 'community',
    component: CommunityComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
