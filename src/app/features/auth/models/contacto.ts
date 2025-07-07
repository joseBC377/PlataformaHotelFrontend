import { UsuarioModel } from "./usuario";

export interface ContactoModel {
    id?:number;
    nombre:string;
    apellido:string;
    correo:string;
    mensaje:string;
    id_usuario:UsuarioModel;
}
