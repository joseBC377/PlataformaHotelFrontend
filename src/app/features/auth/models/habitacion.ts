import { CategoriaHabitacion } from "./categoria-habitacion";

export interface Habitacion {
  id?: number;
  nombre: string;
  descripcion: string;
  estado: string;
  categoriaHabitacion: CategoriaHabitacion;
}
