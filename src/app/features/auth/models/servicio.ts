import { Resena } from "./resena";
import { ReservaServicio } from "./reservaServicio";

export interface Servicio {
    idServicio?:number,
    nombre_servicio:string,
    descripcion_servicio:string,
    precio:number,
    imagen:string,
    reservaServicio: ReservaServicio[],
    resena: Resena
}
