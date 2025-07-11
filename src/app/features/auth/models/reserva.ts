import { UsuarioModel } from "./usuario";

export interface ReservaModel {
    id_reserva?:number,
    fecha_inicio:string,
    fecha_fin:string,
    usuario:UsuarioModel,
}
