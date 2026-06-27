import { Habitacion } from "./habitacion";

export interface CategoriaHabitacion {
  id_categoria_habitacion?: number;
  nombre_categoria: string;
  descripcion_categoria: string;
  capacidad: number;
  precio: number;
  imagen: string;
  habitacion?: Habitacion[];
}
