export interface RequestResenaModel {
  calificacion: number;
  comentario: string;
  fecha: string;
  usuario: { id_usuario: number };
  habitacion: { id_habitacion: number };
  servicio: { idServicio?: number };
}
