import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceInputComponent } from './finance-input/finance-input.component';
import { CommunityComponent } from './community/community.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatsComponent } from './chats/chats.component';
import { FeatureRequestsComponent } from './feature-requests/feature-requests.component';

const routes: Routes = [
  {
    path: '',
    component: FinanceInputComponent,
  },
  {
    path: 'community',
    component: CommunityComponent,
  },
  {

    path: 'feature-requests',
    component: FeatureRequestsComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'chats',
    component: ChatsComponent
  },
  {
    path: 'chats/:user_id',
    component: ChatsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
