import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Credenciales } from '../../models/credenciales';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  toggled = false;
  showSignIn() {
    this.toggled = false;
  }
  showSignUp() {
    this.toggled = true;
  }
  private fb= inject(FormBuilder)
  private service= inject(AuthService);
  private credenciales: Credenciales ={
    email: '', password:''
  }
  public errorMsg= signal<string|null>(null);
  public loginForm: FormGroup = this.fb.group({
    email: ['',[Validators.required,Validators.email]],
    password: ['',[Validators.required,Validators.minLength(6)]]
  });

  get email(){
    return this.loginForm.get('email');
  }
  get password(){
    return this.loginForm.get('password')
  }
  /*formulario fin */
  loginFn(){
    //sino cumple validacion se sale
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    //refrescar mensajes de error
    this.errorMsg.set(null);
    //captura datos
    this.credenciales.email= this.loginForm.value.email;
    this.credenciales.password=this.loginForm.value.password;
    //proceso de login
    this.service.iniciarSesion(this.credenciales).subscribe({
      next:(res)=>{
        console.log("Tokens: ",res.access_token,res.refresh_token)
      },
      error:(e)=>{
        this.errorMsg.set('Credenciales erroneas');
        console.warn(e.message);
      }
    })
  }
}
