import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header-ad',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-ad.html',
  styleUrl: './header-ad.scss'
})
export class HeaderAd {


  private auth = inject(AuthService);

  nombre: string | null = '';
  apellido: string | null = '';
  rol: string | null = '';
  id: number | null = null;

  mostrarDropdown = false;


  toggleDropdown() {
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  ngOnInit() {
    this.nombre = this.auth.getNombre();
    this.apellido = this.auth.getApellido();
    this.rol = this.auth.getRol();
    this.id = this.auth.getId();
  }


  logout() {
    this.auth.cerrarSesion();
  }

}
