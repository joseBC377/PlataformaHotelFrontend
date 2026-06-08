import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AdminLayout } from './features/auth/layouts/admin-layout/admin-layout';
import { ClientLayout } from './features/auth/layouts/client-layout/client-layout';
import { Intranet } from './features/admin/intranet/intranet';
import { authGuard } from './core/guards/auth-guard';
import { Nosotros } from './features/publico/nosotros/nosotros';
import { Error } from './features/publico/error/error';
import { Habitaciones } from './features/publico/habitacion/habitaciones';
import { Inicio } from './features/publico/inicio/inicio';
import { Servicios } from './features/publico/servicios/servicios';
import { Reservas } from './features/publico/reservas/reservas';
import { Contactos } from './features/publico/contactos/contactos';
import { HabitacionesAdminComponent } from './features/admin/habitacion/habitacion';
import { ServiciosAdminComponent } from './features/admin/servicio/servicio';
import { ResenaAdminComponent } from './features/admin/resenas/resenas';
import { Usuario } from './features/admin/usuario/usuario';
import { Contacto } from './features/admin/contacto/contacto';
import { CategoriaHabitacionServices } from './features/admin/services/categoria-habitacion';
import { CategoriaHabitacionComponent } from './features/admin/categoria-habitacion/categoria-habitacion';
import { PagosComponent } from './features/admin/pago/pago';
import { ReservaService } from './features/admin/services/reserva.services';
import { ReservasAdminComponent } from './features/admin/reserva/reserva';
import { Pago } from './features/publico/pago/pago';
import { CrearReserva } from './features/publico/crear-reserva/crear-reserva';
import { ResumenReserva } from './features/publico/resumen-reserva/resumen-reserva';
import { Metodopago } from './features/admin/metodopago/metodopago';

export const routes: Routes = [
    {
        path: 'admin', component: AdminLayout, canActivate: [authGuard], children: [
            {
                path: 'intranet', component: Intranet, title: 'Intranet'
            },
            {
                path: 'usuario', component: Usuario, title: 'Usuario'
            },
            {
                path: 'pago', component: PagosComponent, title: 'Pago de Reserva'
            },
            {
                path: 'reserva', component: ReservasAdminComponent, title: 'Reserva'
            },
            {
                path: 'contacto', component: Contacto, title: 'Contacto'
            },
            {
                path: 'habitacion', component: HabitacionesAdminComponent, title: 'Habitacion'
            },
            {
                path: 'servicio', component: ServiciosAdminComponent, title: "Servicio"
            },
            {
                path: 'categoria-habitacion', component: CategoriaHabitacionComponent, title: "Categoria-Habitacion"
            },
            {
                path: 'resena', component: ResenaAdminComponent, title: "Resena"
            },
            {
                path: 'metodo', component: Metodopago, title: "Método de Pago"
            },
        ]
    },
    {
        path: '', component: ClientLayout, children: [
            {
                path: 'login', component: Login, title: "Iniciar Sesión"
            },
            {
                path: 'nosotros', component: Nosotros, title: "Nosotros"
            },
            {
                path: 'pago', component: Pago, title: "Pagar Reserva"
            },
            {
                path: 'crear-reserva', component: CrearReserva, title: "Crear Reserva"
            },
            {
                path: 'resumen', component: ResumenReserva, title: "Resumen de Reserva"
            },
            {
                path: 'habitaciones', component: Habitaciones, title: "Habitaciones"
            },
            {
                path: 'servicios', component: Servicios, title: "Servicios"
            },
            {
                path: 'reservas', component: Reservas, title: "Reservas"
            },
            {
                path: 'contactos', component: Contactos, title: "Contactos"
            },
            {
                path: '', component: Inicio, title: "Inicio"
            },

            {
                path: '**', component: Error, title: "Pagina de error"
            }
        ]
    }

];
