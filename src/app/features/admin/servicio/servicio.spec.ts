import { TestBed } from '@angular/core/testing';
import { ServicioService } from '../services/servicio.service';
import { Servicio } from '../../auth/models/servicio';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ServicioService', () => {
  let service: ServicioService;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:8081/api/servicio';

  const mockServicios: Servicio[] = [
    {
      idServicio: 1,
      nombre_servicio: 'Spa y Masajes',
      descripcion_servicio: 'Acceso a sauna y masajes relajantes',
      precio: 120.0,
      imagen: 'spa.jpg',
      reservaServicio: [],
      resena: []
    }
  ];

  const nuevoServicio: Servicio = {
    nombre_servicio: 'Desayuno Buffet',
    descripcion_servicio: 'Desayuno continental e internacional',
    precio: 45.0,
    imagen: 'desayuno.jpg',
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

  it('debe listar los servicios (GET)', () => {
    service.listar().subscribe(servicios => {
      expect(servicios.length).toBe(1);
      expect(servicios[0].nombre_servicio).toBe('Spa y Masajes');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockServicios);
  });

  it('debe crear un nuevo servicio (POST)', () => {
    service.insertar(nuevoServicio).subscribe(res => {
      expect(res).toEqual(nuevoServicio);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre_servicio).toBe('Desayuno Buffet');
    req.flush(nuevoServicio);
  });

  it('debe editar un servicio (PUT)', () => {
    const servicioEditado = { ...nuevoServicio, precio: 50.0 };

    service.editar(1, servicioEditado).subscribe(res => {
      expect(res).toEqual(servicioEditado);
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(servicioEditado);
  });

  it('debe eliminar un servicio (DELETE)', () => {
    service.eliminar(1).subscribe();

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});