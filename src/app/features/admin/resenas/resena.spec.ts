import { TestBed } from '@angular/core/testing';
import { ResenaService } from '../services/resena.service';
import { Resena } from '../../auth/models/resena';
import { RequestResenaModel } from '../../auth/models/request-resena-model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ResenaService', () => {

    let service: ResenaService;
    let httpMock: HttpTestingController;

    const URL = 'http://localhost:8081/api/resena';

    const mockResenas: Resena[] = [
        {
            id_resena: 1,
            calificacion: 4.5,
            comentario: 'Muy buena',
            fecha: '2025-01-01',
            usuario: {
                id_usuario: 10,
                nombre_usuario: 'Juan',
                apellido_paterno: 'Pérez'
            },
            habitacion: {
                id_habitacion: 20,
                nombre_habitacion: 'Habitación 1',
                estado: 'DISPONIBLE'
            },
            servicio: {
                id_servicio: 1,
                nombre_servicio: 'Spa'
            }
        }
    ];

    const nuevaResena: RequestResenaModel = {
        calificacion: 5,
        comentario: 'Excelente',
        fecha: '2025-07-21',
        usuario: { id_usuario: 10 },
        habitacion: { id_habitacion: 20 },
        servicio: { idServicio: 1 }
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
        httpMock.verify();
    });

    it('debe listar reseñas (GET)', () => {
        service.listar().subscribe(resenas => {
            expect(resenas.length).toBe(1);
            expect(resenas[0].comentario).toBe('Muy buena');
        });

        const req = httpMock.expectOne(URL);
        expect(req.request.method).toBe('GET');
        req.flush(mockResenas);
    });

    it('debe insertar reseña (POST)', () => {
        service.insertar(nuevaResena).subscribe();
        const req = httpMock.expectOne(URL);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.comentario).toBe('Excelente');
        req.flush({});
    });

    it('debe editar reseña (PUT)', () => {
        service.editar(1, nuevaResena).subscribe();
        const req = httpMock.expectOne(`${URL}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush({});
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