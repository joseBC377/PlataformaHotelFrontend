import { HttpTestingController, HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CategoriaHabitacion } from "../../auth/models/categoria-habitacion";
import { Habitacion } from "../../auth/models/habitacion";
import { HabitacionServices } from "../services/habitacion.services";
import { EstadoReserva } from "../../auth/models/habitacionEstado";
import { RolTipo } from "../../auth/models/roltipo"; // O la ruta donde tengas definido RolTipo

describe('HabitacionServices', () => {
  let service: HabitacionServices;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:8081/api/habitacion';

  // Mock de una categoría alineado con tu modelo real
  const mockCategoria: CategoriaHabitacion = {
    id_categoria_habitacion: 1,
    nombre_categoria: 'Suite',
    descripcion_categoria: 'Suite de lujo',
    capacidad: 2,
    precio: 300,
    imagen: 'suite.jpg',
    habitacion: []
  };

  // Mock de habitaciones alineado con tu modelo real
  const mockHabitaciones: Habitacion[] = [
    {
      id_habitacion: 1,
      nombre_habitacion: 'Hab101',
      descripcion_habitacion: 'Habitación con vista al mar',
      estado: EstadoReserva.DISPONIBLE,
      tipo: 'SIMPLE' as unknown as RolTipo, // o RolTipo.SIMPLE si el enum tiene ese valor
      categoriaHabitacion: mockCategoria
    }
  ];

  const nuevaHabitacion: Habitacion = {
    nombre_habitacion: 'Hab202',
    descripcion_habitacion: 'Habitación Deluxe',
    estado: EstadoReserva.OCUPADA,
    tipo: 'DOUBLE' as unknown as RolTipo, // o RolTipo.DOUBLE si el enum tiene ese valor
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
      expect(habitaciones[0].nombre_habitacion).toBe('Hab101');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockHabitaciones);
  });

  it('debe obtener una habitación por ID (GET)', () => {
    service.getHabitacionById(1).subscribe(habitacion => {
      expect(habitacion.nombre_habitacion).toBe('Hab101');
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHabitaciones[0]);
  });

  it('debe insertar una habitación (POST)', () => {
    service.postInsertarHabitacion(nuevaHabitacion).subscribe(habitacion => {
      expect(habitacion.nombre_habitacion).toBe('Hab202');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre_habitacion).toBe('Hab202');
    req.flush(nuevaHabitacion);
  });

  it('debe editar una habitación (PUT)', () => {
    const habitacionEditada = { ...nuevaHabitacion, estado: EstadoReserva.DISPONIBLE };

    service.putEditarHabitacion(2, habitacionEditada).subscribe(habitacion => {
      expect(habitacion.estado).toBe(EstadoReserva.DISPONIBLE);
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