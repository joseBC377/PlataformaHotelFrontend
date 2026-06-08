import { UsuarioModel } from "./usuario";

export interface ContactoModel {
    id_contacto:number;
    nombre:string;
    apellido:string;
    correo:string;
    mensaje:string;
}
