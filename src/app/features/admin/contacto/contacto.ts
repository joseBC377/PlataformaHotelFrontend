import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactoModel } from '../../auth/models/contacto';
import { ContactoService } from '../services/contacto.services';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto implements OnInit {
  private serv = inject(ContactoService);

  // Lists
  contactos: ContactoModel[] = [];
  contactosFiltrados: ContactoModel[] = [];
  contactosPaginados: ContactoModel[] = [];
  cargando = true;

  // Search
  buscarQuery = '';

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.contactosFiltrados.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.cargarContactos();
  }

  cargarContactos(): void {
    this.cargando = true;
    this.serv.getSelectContact().subscribe({
      next: (data) => {
        this.contactos = data || [];
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar contactos', err);
        this.cargando = false;
      }
    });
  }

  actualizarTabla() {
    let result = [...this.contactos];

    // Filter by search query (name, email, or message)
    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(c => 
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.apellido || '').toLowerCase().includes(q) ||
        (c.correo || '').toLowerCase().includes(q) ||
        (c.mensaje || '').toLowerCase().includes(q)
      );
    }

    this.contactosFiltrados = result;

    // Pagination calculations
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.contactosPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarTabla();
    }
  }

  getIniciales(c: ContactoModel): string {
    const n = c.nombre?.charAt(0) || '';
    const a = c.apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || 'M';
  }

  eliminarMensaje(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      this.serv.deleteIdContact(id).subscribe({
        next: () => {
          this.cargarContactos();
        },
        error: () => {
          alert('Error al eliminar el mensaje');
        }
      });
    }
  }
}
