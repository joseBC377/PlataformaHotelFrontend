import { ReservaModel } from "./reserva";

export interface PagoModel {
    idPago:number;
    total:number;
    metodo_pago:string;
    estado_pago:string;
    fecha_pago:string;
    id_reserva:ReservaModel;
}
