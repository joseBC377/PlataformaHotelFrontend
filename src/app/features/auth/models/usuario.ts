import { ReservaModel } from "./reserva";
import { Rol } from "./rol";

export interface UsuarioModel {
    id_usuario:number,
    nombre_usuario: string,
    apellido_paterno: string,
    apellido_materno: string,
    fecha_nacimiento: string,
    correo: string,
    telefono:string,
    password:string,
    rol:Rol,
    reserva:ReservaModel[]
}
