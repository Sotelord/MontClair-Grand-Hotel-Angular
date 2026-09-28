import { Injectable } from '@angular/core';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  constructor() {}

  getServices() {
    return this.serviceArray;
  }

  private serviceArray: Service[] = [
    {
      id: 1,
      name: 'Restaurante',
      description:
        'Gastronomía de autor con ingredientes frescos y locales, presentada en un ambiente elegante y sofisticado.',
      price: 40.0,
      icon: 'images/ic_Restaurante.png',
      imageUrl:
        'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 01',
      schedule: '6:30 AM - 11:30 PM',
      priceLabel: 'Desde € 40 EUR',
      heroDescription:
        'Gastronomía de autor concebida para los paladares más exigentes. Cocina mediterránea refinada, producto local y una cava histórica frente al mar de Mónaco.',
      tagline: 'HAUTE CUISINE & MARIDAJE',
      headline: 'Un viaje gastronómico donde el sabor y el arte se encuentran',
      fullDescription:
        'Déjate seducir por un menú diseñado por nuestro chef ejecutivo, combinando la frescura del Mediterráneo con técnicas de alta cocina internacional en una atmósfera de luz tenue y servicio impecable.',
      scheduleNote: 'Desayuno, Almuerzo y Cena',
      priceNote: 'A la carta o menú maridaje',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Menú degustación de 7 tiempos',
          description:
            'Creaciones de autor con maridaje seleccionado por sumiller.',
        },
        {
          title: 'Cava privada de añadas históricas',
          description:
            'Etiquetas exclusivas de Burdeos, Champagne y la Provenza.',
        },
        {
          title: "Chef's Table confidencial",
          description:
            'Mesa privada frente a la cocina para un máximo de 6 comensales.',
        },
        {
          title: 'Terraza panorámica con vistas al puerto',
          description: 'Cenas bajo el cielo estrellado del Principado.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 2,
      name: 'Spa & Bienestar',
      description:
        'Tratamientos relajantes, masajes y circuitos de bienestar diseñados para una pausa íntima y exclusiva.',
      price: 100.0,
      icon: 'images/ic_Spa.png',
      imageUrl:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 02',
      schedule: '8:00 AM - 10:00 PM',
      priceLabel: 'Desde €100 EUR',
      heroDescription:
        'Un santuario privado concebido para quienes buscan silencio, exclusividad y bienestar absoluto. Rituales de autor, espacios de mármol y experiencias sensoriales diseñadas hasta el último detalle.',
      tagline: 'SIGNATURE SPA EXPERIENCE',
      headline: 'Un oasis de tranquilidad para cuerpo y mente',
      fullDescription:
        'Sumérgete en una experiencia de bienestar reservada para quienes esperan algo excepcional. Nuestro spa combina arquitectura íntima, tratamientos de autor y rituales personalizados en un entorno diseñado para desconectarte del mundo exterior.',
      scheduleNote: 'Todos los días',
      priceNote: 'Por persona · reserva previa',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Masajes signature y terapéuticos',
          description:
            'Técnicas personalizadas y aceites premium seleccionados para ti.',
        },
        {
          title: 'Circuito privado de hidroterapia',
          description:
            'Piscina climatizada, contrastes térmicos y zonas de inmersión.',
        },
        {
          title: 'Rituales faciales y corporales',
          description:
            'Protocolos de alta gama enfocados en restauración profunda.',
        },
        {
          title: 'Sauna, vapor y lounge de relajación',
          description:
            'Ambientes de acceso limitado para una experiencia más íntima.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 3,
      name: 'Gimnasio',
      description:
        'Equipos de última generación y espacios preparados para entrenamiento personal durante tu estancia.',
      price: 0.0,
      icon: 'https://cdn-icons-png.flaticon.com/512/1518/1518886.png',
      imageUrl:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 03',
      schedule: '6:00 AM - 10:00 PM',
      priceLabel: 'Incluido',
      heroDescription:
        'Instalaciones de alto rendimiento diseñadas para mantener tu vitalidad y bienestar físico con la más avanzada tecnología y atención personalizada.',
      tagline: 'WELLNESS & HIGH PERFORMANCE',
      headline: 'Entrenamiento de élite y energía renovada en cada sesión',
      fullDescription:
        'Espacios luminosos y diáfanos equipados con la gama más avanzada de Technogym, zonas de peso libre, cardio inmersivo y asesoramiento deportivo a medida.',
      scheduleNote: 'Acceso 24h para huéspedes',
      priceNote: 'Acceso ilimitado durante la estancia',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Equipamiento Technogym Artis',
          description:
            'Maquinaria biomecánica de precisión con conectividad digital integrada.',
        },
        {
          title: 'Entrenamiento personal bajo demanda',
          description:
            'Entrenadores certificados para sesiones a medida de fuerza y movilidad.',
        },
        {
          title: 'Estudio de Yoga, Pilates & Mindfulness',
          description:
            'Clases guiadas matutinas para despertar cuerpo y mente.',
        },
        {
          title: 'Área de recuperación y toallas frías',
          description:
            'Hidratación con aguas infusionadas y servicio de toallas de algodón egipcio.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 4,
      name: 'Piscina',
      description:
        'Piscina climatizada con vista panorámica y zona de descanso para disfrutar del entorno mediterráneo.',
      price: 0.0,
      icon: 'https://cdn-icons-png.flaticon.com/512/157/157839.png',
      imageUrl:
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 04',
      schedule: '7:00 AM - 9:00 PM',
      priceLabel: 'Incluido',
      heroDescription:
        'Un espejo de agua infinita suspendido sobre la costa de Mónaco. Climatización perfecta, solárium privado y servicio de coctelería junto al agua.',
      tagline: 'PANORAMIC INFINITY POOL',
      headline: 'El placer de nadar con el Mediterráneo en el horizonte',
      fullDescription:
        'Relájate en nuestras tumbonas premium mientras disfrutas de una temperatura de agua constante a 28°C, toallas aromáticas y atención personalizada de nuestros camareros de piscina.',
      scheduleNote: 'Todos los días',
      priceNote: 'Acceso exclusivo para huéspedes',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Agua climatizada todo el año',
          description:
            'Sistema de filtración salina respetuoso con la piel a 28°C.',
        },
        {
          title: 'Solárium privado con camas balinesas',
          description:
            'Espacios de sombraje natural y vistas directas a la bahía.',
        },
        {
          title: 'Pool Bar & Snacks saludables',
          description:
            'Smoothies revitalizantes, frutas de temporada y cócteles de autor.',
        },
        {
          title: 'Servicio de toallas y amenidades',
          description: 'Protectores solares orgánicos y brumas refrescantes.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 5,
      name: 'Salones de eventos',
      description:
        'Espacios elegantes para eventos corporativos, recepciones privadas y celebraciones especiales.',
      price: 0.0,
      icon: 'https://cdn-icons-png.flaticon.com/512/4799/4799365.png',
      imageUrl:
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 05',
      schedule: '8:00 AM - 12:00 AM',
      priceLabel: 'A consultar',
      heroDescription:
        'Escenarios sofisticados donde cada detalle técnico y gastronómico se orquesta con máxima precisión para recepciones, juntas y celebraciones memorables.',
      tagline: 'EXCLUSIVE GATHERINGS & GALAS',
      headline: 'El marco perfecto para tus momentos más distinguidos',
      fullDescription:
        'Salones modulables de gran altura revestidos en maderas nobles y mármol, equipados con acústica de concierto, proyecciones láser 4K y servicio de catering de alta cocina.',
      scheduleNote: 'Reserva según disponibilidad',
      priceNote: 'Presupuestos a medida',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Salones modulables hasta 300 invitados',
          description:
            'Configuraciones versátiles para banquetes, cócteles o conferencias.',
        },
        {
          title: 'Tecnología audiovisual inmersiva',
          description:
            'Sistemas de sonido envolvente, pantallas 4K y streaming privado.',
        },
        {
          title: 'Banquetería y sumillería exclusiva',
          description:
            'Menús personalizados creados por nuestros chefs de banquete.',
        },
        {
          title: 'Planificador de eventos dedicado',
          description:
            'Asistencia personalizada desde la concepción hasta el cierre del evento.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 6,
      name: 'Room Service',
      description:
        'Servicio a la habitación disponible las 24 horas, con una presentación cuidada y atención personalizada.',
      price: 0.0,
      icon: 'images/ic_RService.png',
      imageUrl:
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 06',
      schedule: '24 horas',
      priceLabel: 'Sin cargo adicional',
      heroDescription:
        'La excelencia culinaria de Montclair servida en la intimidad de tu suite. Desayunos gourmet en el balcón, cenas a la luz de las velas y refrigerios nocturnos.',
      tagline: 'IN-SUITE DINING 24/7',
      headline: 'Gastronomía de primer nivel en la privacidad de tu suite',
      fullDescription:
        'Disfruta de platos recién preparados, carritos térmicos de plata y un servicio discreto y puntual a cualquier hora del día o de la noche.',
      scheduleNote: 'Disponible 24/7',
      priceNote: 'Carta de precios según consumición',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Desayunos de autor servidos al amanecer',
          description:
            'Huevos benedictinos, bollería recién horneada y zumos naturales.',
        },
        {
          title: 'Carta nocturna de platos calientes',
          description:
            'Opciones gastronómicas reconfortantes disponibles toda la noche.',
        },
        {
          title: 'Servicio de champán y caviar',
          description:
            'Presentación en hielo con copas de cristal de Baccarat.',
        },
        {
          title: 'Atención personalizada y discreta',
          description:
            'Montaje de mesa completo en la terraza o salón de la suite.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 7,
      name: 'Servicio de lavandería',
      description:
        'Lavandería y tintorería exprés con una presentación sobria, cuidada y acorde con la experiencia premium del hotel.',
      price: 30.0,
      icon: 'https://cdn-icons-png.flaticon.com/512/1075/1075355.png',
      imageUrl:
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 07',
      schedule: '7:00 AM - 7:00 PM',
      priceLabel: 'Desde € 30 EUR',
      heroDescription:
        'Cuidado minucioso para tus prendas más delicadas. Técnicas ecológicas de planchado y tintorería artesanal entregadas con funda protectora en tu armario.',
      tagline: 'EXPRESS VALET & DRY CLEANING',
      headline: 'El cuidado más exigente para tus mejores prendas',
      fullDescription:
        'Tratamiento textil de alta gama para seda, lino, lana virgen y trajes a medida, con servicio exprés en el mismo día y plegado en papel de seda.',
      scheduleNote: 'Lunes a Domingo',
      priceNote: 'Por prenda o servicio completo',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Servicio exprés en 4 horas',
          description: 'Recogida y entrega directa en tu habitación.',
        },
        {
          title: 'Tratamientos eco-friendly',
          description:
            'Productos hipoalergénicos y técnicas sin químicos agresivos.',
        },
        {
          title: 'Planchado artesanal al vapor',
          description:
            'Cuidado especializado para trajes de noche y camisas de etiqueta.',
        },
        {
          title: 'Presentación impecable',
          description:
            'Perchas de madera forrada y fundas protectoras transpirables.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
    {
      id: 8,
      name: 'Traslados',
      description:
        'Servicio privado con vehículos premium y chauffeur para desplazamientos por Mónaco y la Costa Azul.',
      price: 0.0,
      icon: 'https://cdn-icons-png.flaticon.com/512/3767/3767259.png',
      imageUrl:
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      tag: 'EXPERIENCIA 08',
      schedule: '24 horas',
      priceLabel: 'A consultar',
      heroDescription:
        'Flota exclusiva de berlinas y minivans de alta gama con chóferes multilingües para traslados al Aeropuerto de Niza, helipuerto y destinos exclusivos de la Riviera.',
      tagline: 'CHAUFFEUR & LUXURY FLEET',
      headline: 'Movilidad de lujo con puntualidad y distinción absoluta',
      fullDescription:
        'Viaja con la máxima serenidad y confort en vehículos equipados con Wi-Fi de alta velocidad, agua mineral artesanal y atención a cada uno de tus itinerarios.',
      scheduleNote: 'Reserva 24/7 previa',
      priceNote: 'Tarifas fijas por trayecto',
      secondaryImageUrl:
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      highlights: [
        {
          title: 'Flota Mercedes-Benz Clase S y Maybach',
          description: 'Vehículos insonorizados con tapicería de cuero nappa.',
        },
        {
          title: 'Chóferes profesionales y bilingües',
          description:
            'Conocimiento experto de las rutas y protocolos de la Riviera.',
        },
        {
          title: 'Conexión directa Aeropuerto Niza-Costa Azul',
          description:
            'Recepción personalizada en terminal con cartel y asistencia de equipaje.',
        },
        {
          title: 'Servicio a disposición por horas',
          description:
            'Flexibilidad absoluta para compras, reuniones o paseos nocturnos.',
        },
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      ],
      hidden: false,
    },
  ];
}
