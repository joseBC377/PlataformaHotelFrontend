import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';

export const routes: Routes = [
    {
        path: 'login', component: Login, title: "Iniciar Sesión"
    },
    {
        path: '', redirectTo: '/home', pathMatch: 'full'
    },
];
