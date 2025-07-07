import { Usuario } from "../../admin/usuario/usuario";
import { Habitacion } from "./habitacion";

export interface Resena {
    id?:number,
    calificacion:number,
    fecha:string,
    usuario:Usuario,
    habitacion:Habitacion
}
