import { CategoriaHabitacion } from "./categoria_habitacion";

export interface Habitacion {
  id?: number;
  nombre: string;
  descripcion: string;
  estado: string;
  categoriaHabitacion: CategoriaHabitacion;
}
