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

export const routes: Routes = [
    {
        path: 'admin', component: AdminLayout, canActivate: [authGuard], children: [
            {
                path: 'intranet', component: Intranet, title: 'Intranet'
            }
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
                path:'inicio',component:Inicio, title:"Inicio"
            },
            {
                path: '**', component: Error, title: "Pagina de error"
            }
        ]
    }

];
