import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ServicioService } from "../services/servicio.service";
import { Servicio } from "../../auth/models/servicio";
import { TestBed } from "@angular/core/testing";


describe('ServicioService', () => {
  let service: ServicioService;
  let httpMock: HttpTestingController;

  const URL = 'http://localhost:8081/api/servicio';

  // Mock de un servicio
  const mockServicios: Servicio[] = [
    {
      id_servicio: 1,
      nombre: 'Servicio de Spa',
      descripcion: 'Masajes y relajación',
      precio: 100,
      imagen: 'spa.jpg'
    }
  ];

  const nuevoServicio: Servicio = {
    id_servicio: 2,
    nombre: 'Servicio de Restaurante',
    descripcion: 'Comidas gourmet',
    precio: 50,
    imagen: 'restaurante.jpg'
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
    httpMock.verify(); // Verifica que no queden requests pendientes
  });

  it('debe listar servicios (GET)', () => {
    service.listar().subscribe(servicios => {
      expect(servicios.length).toBe(1);
      expect(servicios[0].nombre).toBe('Servicio de Spa');
    });

    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockServicios);
  });

  it('debe insertar un servicio (POST)', () => {
    service.insertar(nuevoServicio).subscribe(servicio => {
      expect(servicio.nombre).toBe('Servicio de Restaurante');
      expect(servicio.precio).toBe(50);
    });

    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre).toBe('Servicio de Restaurante');
    req.flush(nuevoServicio);
  });

  it('debe editar un servicio (PUT)', () => {
    const servicioEditado = { ...nuevoServicio, nombre: 'Restaurante Deluxe' };

    service.editar(2, servicioEditado).subscribe(servicio => {
      expect(servicio.nombre).toBe('Restaurante Deluxe');
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