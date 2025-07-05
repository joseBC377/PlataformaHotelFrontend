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
import { Usuario } from './features/admin/usuario/usuario';
import { ReservaHabitacion } from './features/admin/reserva-habitacion/reserva-habitacion';
import { Reserva } from './features/admin/reserva/reserva';
import { Contacto } from './features/admin/contacto/contacto';
import { Pago } from './features/admin/pago/pago';

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
                path: 'habitacion', component: ReservaHabitacion, title: 'Habitacion'
            },
            {
                path: 'pago', component: Pago, title: 'Pago de Reserva'
            },
            {
                path: 'reserva', component: Reserva, title: 'Reserva'
            },
            {
                path: 'contacto', component: Contacto, title: 'Contacto'
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
                path: 'habitaciones', component: Habitaciones, title:"Habitaciones"
            },
            {
                path: 'servicios', component: Servicios, title:"Servicios"
            },
            {
                path: 'reservas', component: Reservas, title:"Reservas"
            },
            {
                path: 'contactos', component: Contactos, title:"Contactos"
            },
            {
                path:'',component:Inicio, title:"Inicio"
            },
            
            {
                path: '**', component: Error, title: "Pagina de error"
            }
        ]
    }

];
