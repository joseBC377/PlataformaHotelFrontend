import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { ServicioService } from '../services/servicio.service';
import { Servicio } from '../../auth/models/servicio';

describe('ServicioService', () => {

  let service: ServicioService;
  let httpMock: HttpTestingController;

  const URL = 'http://localhost:8081/api/servicio';

  const mockServicios: Servicio[] = [
    {
      idServicio: 1,
      nombre_servicio: 'Servicio de Spa',
      descripcion_servicio: 'Masajes y relajación',
      precio: 100,
      imagen: 'spa.jpg',
      reservaServicio: [],
      resena: []
    }
  ];

  const nuevoServicio: Servicio = {
    idServicio: 2,
    nombre_servicio: 'Servicio de Restaurante',
    descripcion_servicio: 'Comidas gourmet',
    precio: 50,
    imagen: 'restaurante.jpg',
    reservaServicio: [],
    resena: []
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioService]
    });

    service = TestBed.inject(ServicioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe listar servicios (GET)', () => {

    service.listar().subscribe(servicios => {
      expect(servicios.length).toBe(1);
      expect(servicios[0].nombre_servicio).toBe('Servicio de Spa');
    });

    const req = httpMock.expectOne(URL);

    expect(req.request.method).toBe('GET');

    req.flush(mockServicios);
  });

  it('debe insertar un servicio (POST)', () => {

    service.insertar(nuevoServicio).subscribe(servicio => {
      expect(servicio.nombre_servicio).toBe('Servicio de Restaurante');
      expect(servicio.precio).toBe(50);
    });

    const req = httpMock.expectOne(URL);

    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre_servicio)
      .toBe('Servicio de Restaurante');

    req.flush(nuevoServicio);
  });

  it('debe editar un servicio (PUT)', () => {

    const servicioEditado: Servicio = {
      ...nuevoServicio,
      nombre_servicio: 'Restaurante Deluxe'
    };

    service.editar(2, servicioEditado).subscribe(servicio => {
      expect(servicio.nombre_servicio).toBe('Restaurante Deluxe');
    });

    const req = httpMock.expectOne(`${URL}/2`);

    expect(req.request.method).toBe('PUT');

    req.flush(servicioEditado);
  });

  it('debe eliminar un servicio (DELETE)', () => {

    service.eliminar(2).subscribe(response => {
      expect(response).toBe('Servicio eliminado');
    });

    const req = httpMock.expectOne(`${URL}/2`);

    expect(req.request.method).toBe('DELETE');

    req.flush('Servicio eliminado');
  });

});