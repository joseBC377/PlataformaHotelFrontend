import { HttpTestingController, HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CategoriaHabitacion } from "../../auth/models/categoria_habitacion";
import { CategoriaHabitacionServices } from "../services/categoria_habitacion";

describe('CategoriaHabitacionServices', () => {
  let service: CategoriaHabitacionServices;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:8081/api/categoriaHabitacion';

  const mockCategorias: CategoriaHabitacion[] = [
    {
      id: 1,
      nombre: 'Suite',
      descripcion: 'Suite de lujo',
      capacidad: 2,
      precio: 300,
      imagen: 'suite.jpg'
    }
  ];

  const nuevaCategoria: CategoriaHabitacion = {
    nombre: 'Deluxe',
    descripcion: 'Habitación deluxe',
    capacidad: 4,
    precio: 450,
    imagen: 'deluxe.jpg'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoriaHabitacionServices]
    });

    service = TestBed.inject(CategoriaHabitacionServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Asegura que no haya solicitudes pendientes
  });

  it('debe obtener todas las categorías (GET)', () => {
    service.getAllCategorias().subscribe(categorias => {
      expect(categorias.length).toBe(1);
      expect(categorias[0].nombre).toBe('Suite');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategorias);
  });

  it('debe obtener una categoría por ID (GET)', () => {
    service.getCategoriaById(1).subscribe(categoria => {
      expect(categoria.nombre).toBe('Suite');
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategorias[0]);
  });

  it('debe insertar una categoría (POST con FormData)', () => {
    const formData = new FormData();
    formData.append('nombre', nuevaCategoria.nombre);
    formData.append('descripcion', nuevaCategoria.descripcion);
    formData.append('capacidad', nuevaCategoria.capacidad.toString());
    formData.append('precio', nuevaCategoria.precio.toString());
    formData.append('imagen', nuevaCategoria.imagen);

    service.postInsertarCategoria(formData).subscribe(response => {
      expect(response).toEqual({ mensaje: 'Categoria creada' });
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    req.flush({ mensaje: 'Categoria creada' });
  });

  it('debe editar una categoría (PUT con FormData)', () => {
    const formData = new FormData();
    formData.append('nombre', 'Suite Editada');

    service.putEditarCategoria(1, formData).subscribe(response => {
      expect(response).toEqual({ mensaje: 'Categoria actualizada' });
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ mensaje: 'Categoria actualizada' });
  });

  it('debe eliminar una categoría (DELETE)', () => {
    service.deleteCategoria(1).subscribe(response => {
      expect(response).toEqual(mockCategorias[0]);
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockCategorias[0]);
  });
});