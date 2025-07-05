import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './servicio.html',
  styleUrls: ['./servicio.scss']
})
export class ServiciosAdminComponent implements OnInit {
  servicios: any[] = [];

  servicioForm: FormGroup;
  modoEdicion = false;
  idServicioEditar: number | null = null;

  constructor(private fb: FormBuilder) {
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      imagen: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // ✅ Cargar servicios por defecto al iniciar
    this.servicios = [
      {
        id: 1,
        nombre: 'Restaurante',
        descripcion: 'Disfruta de una experiencia gastronómica única en nuestro restaurante gourmet. Nuestro menú incluye platos internacionales y opciones locales, preparados por chefs reconocidos. El ambiente elegante y acogedor lo convierte en el lugar perfecto para desayunos, almuerzos y cenas inolvidables.',
        precio: 40.00,
        imagen: 'assets/images/servicios/restaurante.jpg'
      },
      {
        id: 2,
        nombre: 'Restobar',
        descripcion: 'Relájate en nuestro restobar con una amplia variedad de cócteles, vinos y cervezas artesanales. Ideal para compartir una noche con amigos o disfrutar de música en vivo en un ambiente moderno y exclusivo.',
        precio: 25.00,
        imagen: 'assets/images/servicios/restobar.jpg'
      },
      {
        id: 3,
        nombre: 'Experiencias',
        descripcion: 'Te ofrecemos experiencias únicas como tours guiados por la ciudad, actividades culturales, clases de cocina peruana y mucho más. Nuestro personal se encargará de organizar todo para que vivas momentos inolvidables durante tu estancia.',
        precio: 55.00,
        imagen: 'assets/images/servicios/experiencia.jpg'
      }
    ];
  }

  agregarServicio() {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const nuevoServicio = this.servicioForm.value;

    if (this.modoEdicion && this.idServicioEditar !== null) {
      const index = this.servicios.findIndex(s => s.id === this.idServicioEditar);
      if (index !== -1) {
        this.servicios[index] = { ...nuevoServicio, id: this.idServicioEditar };
      }
    } else {
      const nuevo = {
        ...nuevoServicio,
        id: this.servicios.length > 0 ? Math.max(...this.servicios.map(s => s.id)) + 1 : 1
      };
      this.servicios.push(nuevo);
    }

    this.resetFormulario();
  }

  editarServicio(servicio: any) {
    this.servicioForm.setValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio,
      imagen: servicio.imagen
    });

    this.modoEdicion = true;
    this.idServicioEditar = servicio.id;
  }

  eliminarServicio(id: number) {
    this.servicios = this.servicios.filter(s => s.id !== id);
    if (this.idServicioEditar === id) {
      this.resetFormulario();
    }
  }

  actualizarServicio() {
    this.agregarServicio();
  }

  private resetFormulario() {
    this.servicioForm.reset();
    this.modoEdicion = false;
    this.idServicioEditar = null;
  }

  // ✅ Getters para validación en HTML
  get nombre() { return this.servicioForm.get('nombre'); }
  get descripcion() { return this.servicioForm.get('descripcion'); }
  get precio() { return this.servicioForm.get('precio'); }
  get imagen() { return this.servicioForm.get('imagen'); }
}
