import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ContactoModel } from '../../auth/models/contacto';
import { ContactoService } from '../../admin/services/contacto.services';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.html',
  styleUrls: ['./contactos.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class Contactos implements OnInit {

  protected contacto$!: Observable<ContactoModel[]>;
  protected contactoForm!: FormGroup;

  private serv = inject(ContactoService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.iniciar();
    this.cargarContacto();
  }
  iniciar(): void {
    this.contactoForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      apellido: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email
      ]],
      mensaje: ['', [
        Validators.required,
        Validators.minLength(10)
      ]]
    });
  }

  cargarContacto(): void {
    this.contacto$ = this.serv.getSelectContact();
  }
  onSubmit(): void {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      return;
    }

    const data: ContactoModel = this.contactoForm.value;

    this.serv.postContactContact(data).subscribe({
      next: () => {
        alert('Mensaje enviado correctamente');
        this.contactoForm.reset();
        this.cargarContacto();
      },
      error: (e) => {
        console.error(e);
        alert('Error al enviar el mensaje');
      }
    });
  }
}