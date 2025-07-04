import { Reserva } from "./reserva";
import { Rol } from "./rol";

export interface Usuario {
    id?:number,
    nombre: string,
    apellido: string,
    correo: string,
    telefono:string,
    password:string,
    rol:Rol,
    reserva:Reserva[]
}
