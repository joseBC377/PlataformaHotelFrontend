import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Credenciales } from '../../models/credenciales';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequestUserModel } from '../../models/request-user-model';
import { AdminServices } from '../../../admin/services/admin.services';

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
  //fomrulario login con guards
  private fb = inject(FormBuilder)
  private service = inject(AuthService);
  private credenciales: Credenciales = {
    email: '', password: ''
  }
  //Servicio extraido de AdminServices , para el registro
  private serv= inject(AdminServices);

  public errorMsg = signal<string | null>(null);
  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password')
  }
  /*formulario fin */
  loginFn() {
    //sino cumple validacion se sale
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    //refrescar mensajes de error
    this.errorMsg.set(null);
    //captura datos
    this.credenciales.email = this.loginForm.value.email;
    this.credenciales.password = this.loginForm.value.password;
    console.log(this.credenciales)
    //proceso de login
    this.service.iniciarSesion(this.credenciales).subscribe({
      next: (res) => {
        console.log("Tokens: ", res.access_token, res.refresh_token)
      },
      error: (e) => {
        this.errorMsg.set('Credenciales erroneas');
        console.warn(e.message);
      }
    })
  }
  //formulario registro
  public registrForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]*$/)]],
    apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z]*$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    correoRe: ['', [Validators.required, Validators.email]],
    passwordRe: ['', [Validators.required, Validators.minLength(6)]]
  })
  //getters and setters
  get nombre(): AbstractControl | null {
    return this.registrForm.get('nombre');
  }
  get apellido(): AbstractControl | null {
    return this.registrForm.get('apellido');
  }
  get telefono(): AbstractControl | null {
    return this.registrForm.get('telefono');
  }
  get correoRegistro(): AbstractControl | null {
    return this.registrForm.get('correoRe');
  }
  get passwordRegistro(): AbstractControl | null {
    return this.registrForm.get('passwordRe');
  }



  registroFn() {
    if (this.registrForm.invalid) {
      this.registrForm.markAllAsTouched();
      return;
    }

    const form = this.registrForm.value;

    const user: RequestUserModel = {
      firstname: form.nombre,
      lastname: form.apellido,
      email: form.correo,
      telefono: form.telefono,
      password: form.passwordRe?.trim() || undefined
    };
      
      this.serv.insertIdClient(user).subscribe({
        next: () => {
          this.registrForm.reset();
          alert("Usuario registrado correctamente");
        },
        error: () => {
          alert("Error al registrar usuario")
        }
      });
    
  }

}
