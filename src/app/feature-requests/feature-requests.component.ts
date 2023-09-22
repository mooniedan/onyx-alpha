import { Component, OnInit } from '@angular/core';
import { Vote } from '../community/community.component';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-feature-requests',
  templateUrl: './feature-requests.component.html',
  styleUrls: ['./feature-requests.component.scss']
})

export class FeatureRequestsComponent implements OnInit {
  feature = '';
  features: FeatureRequest[] = [];


  constructor(public readonly supabase: SupabaseService) {
  }

  submitResponse() {
    if (this.feature != '') {
      const response = new FeatureRequest();
      response.feature = this.feature;
      this.feature = '';
    }
  }

  async ngOnInit() {
    let { data: data, error, status } = await this.supabase.getPosts()

    // console.log(data, error, status);
    this.features = data || [];

    if (error && status !== 406) {
      throw error
    }
  }
}
export class FeatureRequest {
  id!: number;
  suggested_at!: Date;
  user_id!: string;
  feature!: string;
  votes: Vote[] = [];
}