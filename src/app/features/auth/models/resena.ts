import { Habitacion } from "./habitacion";
import { Servicio } from "./servicio";
import { UsuarioModel } from "./usuario";

export interface Resena {
  //id_resena?: number;
  id_resena?: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  usuario: { id_usuario: number; nombre_usuario: string; apellido_paterno: string };
  habitacion: { id_habitacion: number; nombre_habitacion: string; estado: string };
  servicio: { id_servicio: number; nombre_servicio: string };
}
