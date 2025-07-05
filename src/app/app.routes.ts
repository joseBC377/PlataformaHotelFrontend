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
import { CategoriaHabitacionAdminComponent } from './features/admin/categoria-habitacion/categoria-habitacion';
import { ReservaServicioAdminComponent } from './features/admin/reserva-servicio/reserva-servicio';
import { ResenaAdminComponent } from './features/admin/resenas/resenas';


export const routes: Routes = [
    {
        path: 'admin', component: AdminLayout, canActivate: [authGuard], children: [
            {
                path: 'intranet', component: Intranet, title: 'Intranet'
            },
        ]
    },
    {
        path: '', component: ClientLayout, children: [
            {
                path: 'login', component: Login, title: "Iniciar Sesión"
            },
            {
                path: 'habitacion', component: HabitacionesAdminComponent, title: 'Habitacion'
            },
            {
                path: 'servicio', component: ServiciosAdminComponent, title: "Servicio"
            },
            {
                path: 'categoria-habitacion', component: CategoriaHabitacionAdminComponent, title: "Categoria-Habitacion"
            },
             {
                path: 'reserva-servicio', component: ReservaServicioAdminComponent, title: "Reserva-Servicio"
            },
               {
                path: 'resena', component: ResenaAdminComponent, title: "Resena"
            },
            {
                path: 'nosotros', component: Nosotros, title: "Nosotros"
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
