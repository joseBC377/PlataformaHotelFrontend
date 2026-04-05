export interface PagoReservaInfo {
    reserva: {
        fechaEntrada: string;
        fechaSalida: string;
        adultos: number;
        ninos: number;
        habitaciones: number;
        idUsuario: number;
    };

    pago: {
        total: number;
        igv: number;
        metodoPago: string;
        estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
        fechaPago: string;
    };

}

