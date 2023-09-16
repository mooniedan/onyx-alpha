import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'

export interface FinanceData {
  id: number;
  userId: string
  data: any
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  getFinanceData(userId: string) {
    // const dbData: any = 
    return this.supabase
      .from('financedata')
      .select(`id, user_id, data`)
      .eq('user_id', userId)
      .single()
  }

  updateFinanceData(data: any) {
    return this.supabase.from('financedata').upsert(data)
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email: email,
      password: password
    })
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
  }

  async signOut() {
    return this.supabase.auth.signOut()
  }

  async requestPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://getonyx.co',
    })
  }
}