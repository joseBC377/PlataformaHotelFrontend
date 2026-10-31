<h1 align="center">Plataforma Hotel Frontend</h1>

<!-- Imagen central -->
<p align="center">
  <img src="https://github.com/user-attachments/assets/11392368-7809-4645-a0d9-7172cd600b0c" alt="logo" width="760"/>
</p>

<h2>Introducción</h2>
<p>
  <strong>Royal Suites Hotel</strong> es una moderna interfaz web diseñada para gestionar reservas de hotel, habitaciones, usuarios y tareas administrativas, todo en un mismo lugar. Está diseñada para ofrecer una experiencia de usuario clara, ágil y eficiente, tanto para clientes como para el personal del hotel.
</p>

<ul>
  <li><strong>Fácil de usar</strong></li>
</ul>
<blockquote>
  Construida con <strong>Angular</strong>, esta plataforma es rápida de instalar y sencilla de ejecutar. Gracias a su arquitectura modular y componentes reutilizables, puedes concentrarte en las funcionalidades del negocio sin preocuparte por el código repetitivo.
</blockquote>

<ul>
  <li><strong>Personalizable</strong></li>
</ul>
<blockquote>
  Desde colores hasta distribución de componentes, <strong>Plataforma Hotel</strong> es completamente personalizable. Puedes modificar su diseño para ajustarse a tu marca o agregar nuevas funcionalidades según las necesidades del hotel.
</blockquote>

## 💻 Tecnologías utilizadas

### Frontend (Angular)
- Angular 17
- TypeScript
- Angular Router
- Angular Reactive Forms
- Bootstrap 5 

### Backend (Spring Boot) 
- Spring Boot 3 (Java 17)
- Spring Data JPA para persistencia de datos
- Base de datos MySQL
- Seguridad y autenticación con **JWT (JSON Web Tokens)**
- Control de usuarios y roles (ADMIN / CLIENT)
- Controladores REST para exponer la API
- Manejo de excepciones y validaciones personalizadas
- CORS
- Railway

### Herramientas adicionales
- Visual Studio Code
- Postman (para pruebas de API)
- Git y GitHub
- Angular CLI


<h2> Funcionalidades implementadas</h2>

- Registro, autenticación y autorización de usuarios con JWT.
- Gestión de usuarios con roles (ADMIN y CLIENT).
- Visualización y gestión de habitaciones.
- Gestión completa de reservas (crear, listar, eliminar).
- Exposición de API REST segura para el frontend.
- Validaciones robustas y manejo de errores en backend y frontend.


<h2>🚀 Instalación</h2>
<p>
  Sigue estos pasos para instalar el proyecto <strong>PlataformaHotelFrontend</strong> en tu entorno local:
</p>

<ol>
  <li>
    <p><strong>Clona el repositorio</strong></p>
    <pre><code>git clone https://github.com/joseBC377/PlataformaHotelFrontend.git
cd PlataformaHotelFrontend</code></pre>
  </li>

  <li>
    <p><strong>Instala las dependencias del proyecto</strong></p>
    <pre><code>npm install</code></pre>
  </li>
  </ol>
<h2>🏃‍♂️ Ejecución</h2>

<p>
  Sigue estos pasos para ejecutar el proyecto <strong>PlataformaHotelFrontend</strong> en tu entorno local:
</p>

<ol>
  <li>
    <p><strong>Ejecuta la aplicación en modo desarrollo</strong></p>
    <pre><code>ng serve</code></pre>
    <p>Luego abre tu navegador y entra a:</p>
    <pre><code>http://localhost:4200</code></pre>
  </li>

  <li>
    <p><strong>¿No tienes Angular CLI?</strong> Instálalo globalmente con:</p>
    <pre><code>npm install -g @angular/cli</code></pre>
  </li>
</ol>

<p>
  Para más información sobre configuración o personalización, revisa la documentación oficial de Angular o los archivos <code>angular.json</code>.
</p>


## 🔄 Conexión con el Backend
Este frontend está diseñado para funcionar junto con el backend del proyecto hotelero desarrollado en Spring Boot.
Asegúrate de que el backend esté corriendo en el puerto correcto (`8081`) y de que la API esté disponible.
[🔗 Ver backend en GitHub](https://github.com/joseBC377/PlataformaHotel)


<h2> Uso del sistema</h2>
<p>Una vez ejecutado el proyecto, podrás:</p>
<ul>
  <li>Registrar y autenticar usuarios.</li>
  <li>Ver habitaciones disponibles.</li>
  <li>Reservar habitaciones.</li>
  <li>Acceder al panel administrativo (usuarios, habitaciones, reservas).</li>
  <li>Validar formularios y gestionar errores.</li>
  <li>Interactuar con la API REST del backend.</li>
</ul>

<h2>📁 Estructura del proyecto</h2>

<pre>
PlataformaHotelFrontend/
├── node_modules/           # Módulos y dependencias instaladas por npm
├── public/                 # Archivos públicos accesibles directamente por el navegador
│   ├── assets/             # Recursos estáticos como imágenes
│       └── images/         # Imágenes organizadas por sección (contactos, login, etc.)
│   
├── src/                    # Código fuente principal de la aplicación
│   ├── app/                # Estructura base de la aplicación Angular
│   │   ├── core/           # Módulos centrales reutilizables (autenticación, servicios base)
│   │   ├── features/       # Funcionalidades principales divididas por dominio
│   │   ├── auth/           # Módulo relacionado al login y autenticación
│   │   └── shared/         # Archivos compartidos (header, estilos, footer)
│   ├── styles/          
│   ├── index.html         
│   ├── main.server.ts    
│   ├── main.ts            
│   ├── server.ts          
│   ├── style.scss         
├── .editorconfig          
├── .gitignore              
├── angular.json            
</pre>






