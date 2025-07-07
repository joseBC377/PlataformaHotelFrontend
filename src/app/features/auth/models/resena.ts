import { Habitacion } from "./habitacion";
import { UsuarioModel } from "./usuario";

export interface Resena {
    id?:number,
    calificacion:number,
    fecha:string,
    usuario:UsuarioModel,
    habitacion:Habitacion
}
