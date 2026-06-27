// src/app/auth/models/metodo-pago.ts
export interface MetodoPagoModel {
  id_metodo_pago?: number;
  tipo: string;                    // enum RolMetodoPago
  ultimoscuatrodigitos?: string;   // CHAR(4)
  fechaVencimiento?: string;       // MM/YY
  token?: string;
  activo: boolean;
  usuario?: {
    id_usuario: number;
    nombre_usuario: string;
    apellido_paterno: string;
    apellido_materno?: string;
  };
}