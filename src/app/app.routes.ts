import { Routes } from '@angular/router';
import { Habitaciones } from './pages/habitaciones/habitaciones';
import { Login } from './features/auth/pages/login/login';
import { AdminLayout } from './features/auth/layouts/admin-layout/admin-layout';
import { ClientLayout } from './features/auth/layouts/client-layout/client-layout';
import { Intranet } from './features/admin/intranet/intranet';
import { authGuard } from './core/guards/auth-guard';
import { Nosotros } from './features/publico/nosotros/nosotros';
import { Error } from './features/publico/error/error';

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
                path: 'habitaciones', component: Habitaciones
            },
            {
                path: '**', component: Error, title: "Pagina de error"
            }
        ]
    }

];
