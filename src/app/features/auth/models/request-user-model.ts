export interface RequestUserModel {
    nombre_usuario: string,
    apellido_paterno: string,
    apellido_materno: string,
    correo: string,
    fecha_nacimiento: string,
    telefono: string,
    password?:string,
    rol?:string
}
