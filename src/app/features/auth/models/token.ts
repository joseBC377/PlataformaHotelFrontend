import { Rol } from "./rol"

export interface Token {
    access_token: string,
    refresh_token: string
    id:number,
    nombre:string,
    //apellido:string,
    apellidoPaterno: string;
    apellidoMaterno: string;
    rol:Rol
}
