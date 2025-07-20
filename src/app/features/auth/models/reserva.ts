import { UsuarioModel } from "./usuario";

export interface ReservaModel {
    id?:number,
    fecha_inicio:string,
    fecha_fin:string,
    usuario:UsuarioModel |null,
}
