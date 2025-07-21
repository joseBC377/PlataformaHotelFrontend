import { TestBed } from '@angular/core/testing';
import { ResenaService } from '../services/resena.service';
import { Resena } from '../../auth/models/resena';
import { Rol } from '../../auth/models/rol';
import { RequestResenaModel } from '../../auth/models/request-resena-model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';



describe('ResenaService', () => {

    let service: ResenaService;
    let httpMock: HttpTestingController;

    const URL = 'http://localhost:8081/api/resena';

    // Mock de una reseña
    const mockResenas: Resena[] = [
        {
            id: 1,
            calificacion: 4.5,
            descripcion: 'Muy buena',
            fecha: '2025-01-01',
            usuario: {
                id: 10,
                nombre: 'Juan',
                apellido: 'Pérez',
                correo: 'juan@test.com',
                telefono: '123456789',
                password: '12345',
                rol: Rol.ADMIN,
                reserva: []
            },
            habitacion: {
                id: 20,
                nombre: 'Habitación 1',
                descripcion: 'Habitación de prueba',
                estado: 'DISPONIBLE',
                categoriaHabitacion: {
                    id: 1,
                    nombre: 'Suite',
                    descripcion: 'Suite de lujo',
                    capacidad: 2,
                    precio: 300,
                    imagen: ''
                }
            }
        }
    ];

    const nuevaResena: RequestResenaModel = {
        calificacion: 5,
        descripcion: 'Excelente',
        fecha: '2025-07-21',
        usuario: { id: 10 },
        habitacion: { id: 20 }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ResenaService]
        });

        service = TestBed.inject(ResenaService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Verifica que no haya solicitudes pendientes
    });

    it('debe listar reseñas (GET)', () => {
        service.listar().subscribe(resenas => {
            expect(resenas.length).toBe(1);
            expect(resenas[0].descripcion).toBe('Muy buena');
        });

        const req = httpMock.expectOne(URL);
        expect(req.request.method).toBe('GET');
        req.flush(mockResenas);
    });

    it('debe insertar reseña (POST)', () => {
        service.insertar(nuevaResena).subscribe(); // sin expect
        const req = httpMock.expectOne(URL);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.descripcion).toBe('Excelente');
        req.flush({}); // o lo que sea; no importa
    });

    it('debe editar reseña (PUT)', () => {
        service.editar(1, nuevaResena).subscribe(); // sin expect
        const req = httpMock.expectOne(`${URL}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush({}); // igual
    });

    it('debe eliminar reseña (DELETE)', () => {
        service.eliminar(1).subscribe(response => {
            expect(response).toBe('Reseña eliminada');
        });

        const req = httpMock.expectOne(`${URL}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush('Reseña eliminada');
    });


});
