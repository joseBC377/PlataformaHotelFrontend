import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Servicio } from '../../auth/models/servicio';
import { ServicioService } from '../services/servicio.service';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './servicio.html',
  styleUrls: ['./servicio.scss']
})
export class ServiciosAdminComponent implements OnInit {
  protected servicio$!: Observable<Servicio[]>;
  private serv = inject(ServicioService);
  private fb = inject(FormBuilder);

  public servicioForm: FormGroup = this.fb.group({
    id_servicio: [null],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    imagen: ['', Validators.required]
  });

  public modoEdicion = false;
  public idServicioEditar: number | null = null;
  selectedFile: File | null = null;
  imagenInvalida = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  get nombre() { return this.servicioForm.get('nombre'); }
  get descripcion() { return this.servicioForm.get('descripcion'); }
  get precio() { return this.servicioForm.get('precio'); }
  get imagen() { return this.servicioForm.get('imagen'); }


  ngOnInit(): void {
    this.servicio$ = this.serv.listar();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.servicioForm.patchValue({ imagen: base64 });
        this.imagenInvalida = false;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagenInvalida = true;
    }
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const data = this.servicioForm.value;

    if (this.modoEdicion) {
      this.serv.editar(this.idServicioEditar!, data).subscribe(() => {
        this.servicio$ = this.serv.listar();
        this.resetFormulario();
      });
    } else {
      this.serv.insertar(data).subscribe(() => {
        this.servicio$ = this.serv.listar();
        this.resetFormulario();
      });
    }
  }

  editarServicio(servicio: Servicio): void {
    this.servicioForm.patchValue(servicio);
    this.idServicioEditar = servicio.id_servicio ?? null;
    this.modoEdicion = true;
  }

  eliminarServicio(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.serv.eliminar(id).subscribe(() => {
        this.servicio$ = this.serv.listar(); 
        if (this.idServicioEditar === id) {
          this.resetFormulario();
        }
      });
    }
  }

  resetFormulario() {
    this.servicioForm.reset();
    this.modoEdicion = false;
    this.idServicioEditar = null;
    this.selectedFile = null;
    this.imagenInvalida = false;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}