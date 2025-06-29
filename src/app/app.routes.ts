import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AdminLayout } from './features/auth/layouts/admin-layout/admin-layout';
import { ClientLayout } from './features/auth/layouts/client-layout/client-layout';

export const routes: Routes = [
    {
        path: 'admin', component: AdminLayout, children: [

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
