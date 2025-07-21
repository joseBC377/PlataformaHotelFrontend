import { HttpTestingController, HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CategoriaHabitacion } from "../../auth/models/categoria_habitacion";
import { Habitacion } from "../../auth/models/habitacion";
import { HabitacionServices } from "../services/habitacion.services";

describe('HabitacionServices', () => {
  let service: HabitacionServices;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:8081/api/habitacion';

  // Mock de una categoría
  const mockCategoria: CategoriaHabitacion = {
    id: 1,
    nombre: 'Suite',
    descripcion: 'Suite de lujo',
    capacidad: 2,
    precio: 300,
    imagen: 'suite.jpg'
  };

  // Mock de habitaciones
  const mockHabitaciones: Habitacion[] = [
    {
      id: 1,
      nombre: 'Hab101',
      descripcion: 'Habitación con vista al mar',
      estado: 'DISPONIBLE',
      categoriaHabitacion: mockCategoria
    }
  ];

  const nuevaHabitacion: Habitacion = {
    nombre: 'Hab202',
    descripcion: 'Habitación Deluxe',
    estado: 'OCUPADO',
    categoriaHabitacion: mockCategoria
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HabitacionServices]
    });

    service = TestBed.inject(HabitacionServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('debe obtener todas las habitaciones (GET)', () => {
    service.getAllHabitaciones().subscribe(habitaciones => {
      expect(habitaciones.length).toBe(1);
      expect(habitaciones[0].nombre).toBe('Hab101');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockHabitaciones);
  });

  it('debe obtener una habitación por ID (GET)', () => {
    service.getHabitacionById(1).subscribe(habitacion => {
      expect(habitacion.nombre).toBe('Hab101');
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHabitaciones[0]);
  });

  it('debe insertar una habitación (POST)', () => {
    service.postInsertarHabitacion(nuevaHabitacion).subscribe(habitacion => {
      expect(habitacion.nombre).toBe('Hab202');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre).toBe('Hab202');
    req.flush(nuevaHabitacion);
  });

  it('debe editar una habitación (PUT)', () => {
    const habitacionEditada = { ...nuevaHabitacion, estado: 'DISPONIBLE' };

    service.putEditarHabitacion(2, habitacionEditada).subscribe(habitacion => {
      expect(habitacion.estado).toBe('DISPONIBLE');
    });

    const req = httpMock.expectOne(`${API_URL}/2`);
    expect(req.request.method).toBe('PUT');
    req.flush(habitacionEditada);
  });

  it('debe eliminar una habitación (DELETE)', () => {
    service.deleteHabitacion(2).subscribe(response => {
      expect(response).toEqual(mockHabitaciones[0]);
    });

    const req = httpMock.expectOne(`${API_URL}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockHabitaciones[0]);
  });
  
});