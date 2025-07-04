import { Usuario } from "./usuario";

export interface Reserva {
    id?:number,
    fecha_inicio:string,
    fecha_fin:string,
    usuario:Usuario,
}
