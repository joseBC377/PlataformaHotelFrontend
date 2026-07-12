import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header-recep',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-recep.html',
  styleUrl: './header-recep.scss'
})
export class HeaderRecep {

  private auth = inject(AuthService);

  nombre: string | null = '';
  apellido: string | null = '';
  rol: string | null = '';
  id: number | null = null;

  mostrarDropdown = false;
  menuMovilAbierto = false; // nuevo

  toggleDropdown() {
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  toggleMenuMovil() {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil() {
    this.menuMovilAbierto = false;
  }

  ngDoCheck() {
    this.nombre = this.auth.getNombre();
    this.apellido = this.auth.getApellidoPaterno();
    this.rol = this.auth.getRol();
    this.id = this.auth.getId();
  }

  logout() {
    this.auth.cerrarSesion();
  }
}