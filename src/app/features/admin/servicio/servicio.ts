import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicio.html',
  styleUrls: ['./servicio.scss']
})
export class ServiciosAdminComponent {
  servicios = [
    {
      id: 1,
      nombre: 'Restaurante',
      descripcion: 'Disfruta de una experiencia gastronómica única en nuestro restaurante gourmet. Nuestro menú incluye platos internacionales y opciones locales, preparados por chefs reconocidos. El ambiente elegante y acogedor lo convierte en el lugar perfecto para desayunos, almuerzos y cenas inolvidables',
      precio: 40.00,
      imagen: 'assets/images/servicios/restaurante.jpg'
    },
    {
      id: 2,
      nombre: 'Restobar',
      descripcion: 'Relájate en nuestro restobar con una amplia variedad de cócteles, vinos y cervezas artesanales. Ideal para compartir una noche con amigos o disfrutar de música en vivo en un ambiente moderno y exclusivo',
      precio: 25.00,
      imagen: 'assets/images/servicios/restobar.jpg'
    },
    {
      id: 3,
      nombre: 'Experiencias',
      descripcion: 'Te ofrecemos experiencias únicas como tours guiados por la ciudad, actividades culturales, clases de cocina peruana y mucho más. Nuestro personal se encargará de organizar todo para que vivas momentos inolvidables durante tu estancia',
      precio: 55.00,
      imagen: 'assets/images/servicios/experiencia.jpg'
    }
  ];

  nuevoServicio = {
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen: ''
  };

  modoEdicion = false;
  idServicioEditar: number | null = null;

  agregarServicio() {
    if (this.modoEdicion && this.idServicioEditar !== null) {
      const index = this.servicios.findIndex(s => s.id === this.idServicioEditar);
      if (index !== -1) {
        this.servicios[index] = { ...this.nuevoServicio, id: this.idServicioEditar };
      }
      this.resetFormulario();
    } else {
      const nuevo = {
        ...this.nuevoServicio,
        id: this.servicios.length > 0 ? Math.max(...this.servicios.map(s => s.id)) + 1 : 1
      };
      this.servicios.push(nuevo);
      this.resetFormulario();
    }
  }

  editarServicio(servicio: any) {
    this.nuevoServicio = { ...servicio };
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
    if (this.idServicioEditar !== null) {
      const index = this.servicios.findIndex(s => s.id === this.idServicioEditar);
      if (index !== -1) {
        this.servicios[index] = { ...this.nuevoServicio, id: this.idServicioEditar };
      }
      this.resetFormulario();
    }
  }

  private resetFormulario() {
    this.nuevoServicio = {
      nombre: '',
      descripcion: '',
      precio: 0,
      imagen: ''
    };
    this.modoEdicion = false;
    this.idServicioEditar = null;
  }
}
