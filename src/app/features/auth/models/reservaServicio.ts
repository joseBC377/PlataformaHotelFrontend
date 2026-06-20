import { ReservaModel } from "./reserva";
import { Servicio } from "./servicio";

export interface ReservaServicio {
    id_reserva_servicio:number,
    reserva:ReservaModel,
    servicio: Servicio,
    subtotal:number
}
