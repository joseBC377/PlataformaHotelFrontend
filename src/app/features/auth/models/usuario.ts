import { ReservaModel } from "./reserva";
import { Rol } from "./rol";

export interface UsuarioModel {
    id?:number,
    nombre: string,
    apellido: string,
    correo: string,
    telefono:string,
    password:string,
    rol:Rol,
    reserva:ReservaModel[]
}
