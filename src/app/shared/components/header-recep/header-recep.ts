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
  id : number | null = null;

  mostrarDropdown = false;


  toggleDropdown() {
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  //Se ejecuta cuando angular detecta un cambio
  ngDoCheck() {
    this.nombre = this.auth.getNombre();
    this.apellido = this.auth.getApellidoPaterno();
    this.rol = this.auth.getRol();
    this.id = this.auth.getId();
  }


  logout(){
    this.auth.cerrarSesion();
  }


}
