# Montclair Grand Hotel

Frontend en Angular del sitio web y panel administrativo del **Montclair Grand Hotel**, desarrollado como parte del Sprint 6. Los datos de habitaciones, servicios, clientes y reservas se manejan actualmente con información quemada (mock) dentro de los servicios de Angular, sin conexión a un backend real.

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Angular CLI](https://angular.dev/tools/cli) v19

```bash
npm install -g @angular/cli
```

## Instalación

1. Clonar el repositorio y ubicarse en la carpeta del proyecto:

```bash
cd MontClairGrandHotel
```

2. Instalar las dependencias:

```bash
npm install
```

## Ejecución en desarrollo

Levantar el servidor local con:

```bash
ng serve
```

Luego abrir el navegador en `http://localhost:4200/`. La aplicación se recarga automáticamente al modificar los archivos fuente.

## Otros comandos útiles

```bash
ng build      # Compila el proyecto de producción en dist/
ng test       # Ejecuta las pruebas unitarias con Karma
ng generate component nombre-componente   # Genera un nuevo componente
```

## Estructura de carpetas

```
src/app/
├── components/            # Componentes reutilizables compartidos
│   ├── navbar/             # Barra de navegación del sitio público
│   ├── footer/             # Pie de página del sitio público
│   ├── admin-navbar/       # Barra de navegación del panel admin
│   ├── admin-footer/       # Pie de página del panel admin
│   ├── admin-page-header/  # Encabezado de páginas del panel admin
│   ├── page-header/        # Encabezado genérico de páginas públicas
│   └── room-card/          # Tarjeta de presentación de una habitación
│
├── pages/                  # Páginas (vistas) de la aplicación
│   ├── landing-page/        # Página de inicio, con sus propios subcomponentes
│   │   └── components/       # hero, booking-bar, services-section, room-section,
│   │                          # gallery-banner, location-map, service-card
│   ├── rooms-cards/          # Listado de habitaciones disponibles
│   │   └── components/       # introduction, rooms-carousel, baner-reserva
│   ├── rooms-type-detail/    # Detalle de un tipo de habitación
│   │   └── components/       # room-item-card, room-list-card
│   ├── room-types-admin/     # Panel admin: listado de tipos de habitación
│   │   └── components/       # room-types-table
│   └── room-type-form/       # Panel admin: formulario de alta/edición de tipo de habitación
│
├── service/                # Servicios con los datos quemados (mock)
│   ├── room.service.ts
│   ├── room-type.service.ts
│   ├── client.service.ts
│   ├── reservation.service.ts
│   ├── reservation-room.service.ts
│   ├── adquired-service.service.ts
│   └── services.service.ts
│
├── models/                 # Interfaces/modelos de datos (Room, Client, Reservation, etc.)
│
├── app.component.ts        # Componente raíz: alterna entre layout público y admin
└── app.routes.ts           # Definición de rutas de la aplicación
```

## Páginas de la aplicación

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Landing Page | Página principal del hotel: hero, barra de reserva, servicios, habitaciones destacadas, galería y ubicación. |
| `/rooms/cards` | Listado de habitaciones | Muestra las habitaciones disponibles en formato de tarjetas/carrusel. |
| `/rooms/type/:id` | Detalle de tipo de habitación | Información detallada de un tipo de habitación específico. |
| `/admin/rooms-types` | Administración de tipos de habitación | Panel admin con tabla de tipos de habitación existentes. |
| `/admin/room-types/add` | Crear tipo de habitación | Formulario para agregar un nuevo tipo de habitación. |
| `/admin/room-types/edit/:id` | Editar tipo de habitación | Formulario para editar un tipo de habitación existente. |

El layout (navbar/footer) cambia automáticamente entre la versión pública y la versión de administración según si la ruta actual comienza con `/admin`.
