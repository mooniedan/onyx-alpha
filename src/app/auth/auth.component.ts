import { Component } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { SupabaseService } from '../services/supabase.service'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  loading = false
  error: string = '';
  message: string = '';

  signInForm = this.formBuilder.group({
    email: '',
    password: ''
  })

  signUpForm = this.formBuilder.group({
    email: '',
    password: '',
    passwordRepeat: ''
  })

  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) { }

  async signIn(): Promise<void> {
    this.error = '';
    this.message = '';
    try {
      this.loading = true
      const email = this.signInForm.value.email as string
      const password = this.signInForm.value.password as string
      const { error } = await this.supabase.signIn(email, password)
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        this.error = error.message
      }
    } finally {
      this.signInForm.reset()
      this.loading = false
    }
  }

  async signUp(): Promise<void> {
    this.error = '';
    this.message = '';
    try {
      this.loading = true
      const email = this.signUpForm.value.email as string
      const password = this.signUpForm.value.password as string
      const passwordRepeat = this.signUpForm.value.passwordRepeat as string
      if (password !== passwordRepeat) {
        throw new Error('Passwords do not match')
      }
      const { error } = await this.supabase.signUp(email, password)

      if (error) throw error
      this.message = 'Check your email for the login link!';
    } catch (error) {
      if (error instanceof Error) {
        this.error = error.message
      }
    } finally {
      this.signUpForm.reset()
      this.loading = false
    }
  }
}