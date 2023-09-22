import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FinanceInputComponent } from './finance-input/finance-input.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataInputComponent } from './data-input/data-input.component';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';


import { EditorModule } from '@tinymce/tinymce-angular';

import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClientModule } from '@angular/common/http';
import { CommunityComponent } from './community/community.component';
import { PostComponent } from './post/post.component';
import { FeatureRequestsComponent } from './feature-requests/feature-requests.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatsComponent } from './chats/chats.component';
import { OrderByPipe } from './order-by.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    FinanceInputComponent,
    DataInputComponent,
    CommunityComponent,
    PostComponent,
    FeatureRequestsComponent,
    ProfileComponent,
    ChatsComponent,
    OrderByPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    TextFieldModule,
    EditorModule,
    FormsModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
