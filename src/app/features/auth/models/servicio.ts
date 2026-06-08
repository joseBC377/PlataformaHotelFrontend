import { Resena } from "./resena";
import { ReservaServicio } from "./reservaServicio";

export interface Servicio {
    id_servicio:number,
    nombre_servicio:string,
    descripcion_servicio:string,
    precio:number,
    imagen:string,
    reservaServicio: ReservaServicio[],
    resena: Resena
}
