import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminServices } from '../services/admin.services';
import { UsuarioModel } from '../../auth/models/usuario';
import { RequestUserModel } from '../../auth/models/request-user-model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario implements OnInit {
  private authService = inject(AuthService);
  private serv = inject(AdminServices);
  private fb = inject(FormBuilder);

  // Users Lists
  usuarios: UsuarioModel[] = [];
  usuariosFiltrados: UsuarioModel[] = [];
  usuariosPaginados: UsuarioModel[] = [];
  cargando = true;

  // Search & Filter
  buscarQuery = '';
  filtroRol = '';

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Modal controls
  mostrarModalUsuario = false;
  editando = false;
  idEditando!: number;
  rolLogueado = '';

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.usuariosFiltrados.length);
  }

  public usuarioForm: FormGroup = this.fb.group({
    id_usuario: [null],
    nombre_usuario: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    apellido_paterno: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    apellido_materno: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    correo: ['', [Validators.required, Validators.email]],
    fecha_nacimiento: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    rol: ['', [Validators.required]]
  });

  get nombre_usuario() { return this.usuarioForm.get('nombre_usuario'); }
  get apellido_paterno() { return this.usuarioForm.get('apellido_paterno'); }
  get apellido_materno() { return this.usuarioForm.get('apellido_materno'); }
  get correo() { return this.usuarioForm.get('correo'); }
  get fecha_nacimiento() { return this.usuarioForm.get('fecha_nacimiento'); }
  get password() { return this.usuarioForm.get('password'); }
  get telefono() { return this.usuarioForm.get('telefono'); }
  get rol() { return this.usuarioForm.get('rol'); }

  getRolLabel(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return 'ADMINISTRADOR';
      case 'RECEPCION':
        return 'RECEPCIÓN';
      case 'CLIENT':
        return 'CLIENTE';
      default:
        return rol;
    }
  }

  getIniciales(u: UsuarioModel): string {
    const n = u.nombre_usuario?.charAt(0) || '';
    const a = u.apellido_paterno?.charAt(0) || '';
    return (n + a).toUpperCase() || 'U';
  }

  getBadgeClass(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return 'badge-admin';
      case 'RECEPCION':
        return 'badge-recep';
      case 'CLIENT':
        return 'badge-client';
      default:
        return 'badge-secondary';
    }
  }

  ngOnInit(): void {
    this.rolLogueado = this.authService.getRol() ?? '';
    this.listarUsuarios();
    
    if (this.rolLogueado === 'RECEPCION') {
      this.usuarioForm.patchValue({
        rol: 'CLIENT'
      });
    }
  }

  listarUsuarios() {
    this.cargando = true;
    this.serv.getSeletAllUsers().subscribe({
      next: (users) => {
        const rol = this.rolLogueado;
        if (rol === 'ADMIN') {
          this.usuarios = users || [];
        } else if (rol === 'RECEPCION') {
          this.usuarios = (users || []).filter(u => u.rol === 'CLIENT');
        } else {
          this.usuarios = users || [];
        }
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.cargando = false;
      }
    });
  }

  actualizarTabla() {
    let result = [...this.usuarios];

    // Search query filter
    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(u => 
        (u.nombre_usuario || '').toLowerCase().includes(q) ||
        (u.apellido_paterno || '').toLowerCase().includes(q) ||
        (u.apellido_materno || '').toLowerCase().includes(q) ||
        (u.correo || '').toLowerCase().includes(q) ||
        (u.telefono || '').toLowerCase().includes(q)
      );
    }

    // Role filter
    if (this.filtroRol) {
      result = result.filter(u => u.rol === this.filtroRol);
    }

    this.usuariosFiltrados = result;

    // Pagination calculations
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.usuariosPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarTabla();
    }
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Modal Actions
  abrirModalNuevo() {
    this.editando = false;
    this.idEditando = 0;
    this.usuarioForm.reset();
    
    // Set default rol
    if (this.rolLogueado === 'RECEPCION') {
      this.usuarioForm.patchValue({
        rol: 'CLIENT'
      });
    } else {
      this.usuarioForm.patchValue({
        rol: 'CLIENT'
      });
    }

    // Password is required for new users
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    
    this.mostrarModalUsuario = true;
  }

  editarUsuario(usuario: UsuarioModel) {
    this.editando = true;
    this.idEditando = usuario.id_usuario ?? 0;

    this.usuarioForm.patchValue({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      correo: usuario.correo,
      fecha_nacimiento: usuario.fecha_nacimiento,
      telefono: usuario.telefono,
      rol: usuario.rol
    });

    // Password is NOT required when editing
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();

    this.mostrarModalUsuario = true;
  }

  cerrarModal() {
    this.mostrarModalUsuario = false;
    this.usuarioForm.reset();
  }

  registroFn() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const form = this.usuarioForm.value;

    const user: RequestUserModel & { rol: string } = {
      nombre_usuario: form.nombre_usuario,
      apellido_paterno: form.apellido_paterno,
      apellido_materno: form.apellido_materno,
      fecha_nacimiento: form.fecha_nacimiento,
      correo: form.correo,
      telefono: form.telefono,
      password: form.password?.trim() || undefined,
      rol: this.rolLogueado === 'RECEPCION' ? 'CLIENT' : form.rol
    };

    if (this.editando) {
      this.serv.updateIdClient(this.idEditando, user).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarUsuarios();
        },
        error: (err) => {
          alert("Error al editar el usuario");
        }
      });
    } else {
      this.serv.insertIdClient(user).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarUsuarios();
        },
        error: (err) => {
          alert("Error al registrar el usuario");
        }
      });
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.serv.deleteIdUser(id).subscribe({
        next: () => {
          this.listarUsuarios();
        },
        error: () => {
          alert('Error al eliminar el usuario');
        }
      });
    }
  }
}
