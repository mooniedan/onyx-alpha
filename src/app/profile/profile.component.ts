import { Component, Input, Output, EventEmitter, OnInit, WritableSignal, Signal, signal, computed } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { availableTags } from '../community/community.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<void>();
  profile: Profile;
  availableTags = availableTags;
  interests: string[] = [];


  constructor(private readonly supabase: SupabaseService) {
    this.profile = new Profile();
  }

  async ngOnInit() {
    this.refreshProfile();
  }

  async refreshProfile() {
    let { data: data, error, status } = await this.supabase.getProfile(this.supabase.user.id);

    if (error && status !== 406) {
      throw error
    }

    if (data) {
      this.profile = { ...this.supabase.profile };
      this.interests = ((this.profile.interests || '').split(','));
      console.log(this.profile);
    }
  }

  async updateProfile() {
    console.log(this.profile);

    if (this.profile.username && this.profile.location) {
      if (this.profile.id) {
        await this.supabase.updateProfile(this.profile);
      } else {
        await this.supabase.createProfile(this.profile);
      }
    }
    await this.supabase.refreshProfile();
    this.profile = this.supabase.profile;
  }

  toggleIsTag(tag: string) {
    if (this.interests.includes(tag)) {
      this.interests.splice(this.profile.interests?.indexOf(tag), 1);
    } else {
      this.interests.push(tag);
    }
  }
}


export class Profile {
  id!: number;
  username!: string;
  user_id!: string;
  created_at!: Date;
  location!: string;
  year_of_birth!: number;
  dependents!: number;
  marital_status!: string;
  interests!: string;
}