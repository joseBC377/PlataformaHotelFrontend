import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AdminLayout } from './features/auth/layouts/admin-layout/admin-layout';
import { ClientLayout } from './features/auth/layouts/client-layout/client-layout';
import { Intranet } from './features/admin/intranet/intranet';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: 'admin', component: AdminLayout, canActivate:[authGuard], children: [
            {
                path:'intranet', component:Intranet, title:'Intranet'
            }
        ]
    },
    {
        path: '', component: ClientLayout, children: [
            {
                path: 'login', component: Login, title: "Iniciar Sesión"
            }
        ]
    },
    // {
    //     path:'**'
    // }


];
