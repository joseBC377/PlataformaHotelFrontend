import { HttpTestingController, HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CategoriaHabitacion } from "../../auth/models/categoria-habitacion";
import { CategoriaHabitacionServices } from "../services/categoria-habitacion";

describe('CategoriaHabitacionServices', () => {
  let service: CategoriaHabitacionServices;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:8081/api/categoriaHabitacion';

  const mockCategorias: CategoriaHabitacion[] = [
    {
      id_categoria_habitacion: 1,
      nombre_categoria: 'Suite',
      descripcion_categoria: 'Suite de lujo',
      capacidad: 2,
      precio: 300,
      imagen: 'suite.jpg',
      habitacion: []
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoriaHabitacionServices]
    });

    service = TestBed.inject(CategoriaHabitacionServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener todas las categorías (GET)', () => {
    service.getAllCategorias().subscribe(categorias => {
      expect(categorias.length).toBe(1);
      expect(categorias[0].nombre_categoria).toBe('Suite');
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategorias);
  });

  it('debe obtener una categoría por ID (GET)', () => {
    service.getCategoriaById(1).subscribe(categoria => {
      expect(categoria.nombre_categoria).toBe('Suite');
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategorias[0]);
  });

  it('debe insertar una categoría (POST con FormData)', () => {
    const formData = new FormData();
    formData.append('nombre_categoria', 'Deluxe');
    formData.append('descripcion_categoria', 'Habitación deluxe');
    formData.append('capacidad', '4');
    formData.append('precio', '450');
    formData.append('imagen', 'deluxe.jpg');

    service.postInsertarCategoria(formData).subscribe(response => {
      expect(response).toEqual({ mensaje: 'Categoria creada' });
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    req.flush({ mensaje: 'Categoria creada' });
  });

  it('debe editar una categoría (PUT con FormData)', () => {
    const formData = new FormData();
    formData.append('nombre_categoria', 'Suite Editada');

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