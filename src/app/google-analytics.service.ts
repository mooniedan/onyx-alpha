import { Injectable } from '@angular/core';
import { FinanceItem } from './models/finance-item.model';
import { AuthSession } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { SupabaseService } from './services/supabase.service';
declare let gtag: (type: string, tag: any, config: any) => void;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  session!: AuthSession;

  constructor(private readonly supabase: SupabaseService) {
    if (this.supabase.session) {
      this.session = this.supabase.session
    }
  }

  public emitEvent(eventName: string, eventCategory: string, eventAction: string, eventPayload: any = {}) {

    const { user } = this.session
    eventPayload.eventCategory = eventCategory;
    eventPayload.user = user?.email;
    eventPayload.eventAction = eventAction;
    // eventPayload.environment = environment.environment;
    console.log(eventPayload);
    gtag('event', eventName, eventPayload)
  }
}
