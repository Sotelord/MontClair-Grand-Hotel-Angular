import { ReservationDTO, ReservationServiceDTO } from '../models/reservation.model';
import { Room } from '../models/room.model';
import { RoomService } from '../service/room.service';
import { RoomTypeService } from '../service/room-type.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface PdfService {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface PdfPage {
  image: Uint8Array;
  width: number;
  height: number;
}

export interface ReservationPdfRoomInfo {
  room: Room | null;
  roomTypeImageUrl: string;
  roomTypeName: string;
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const SCALE = 4;
const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const colors = {
  paper: '#FFFFFF',
  background: '#F5F1EC',
  ink: '#17232D',
  navy: '#152C42',
  navyLight: '#203D56',
  muted: '#7B7772',
  gold: '#B88A56',
  goldLight: '#F5EEE4',
  border: '#E8E2DA',
  panel: '#FBF9F6',
  green: '#3E755C',
  amber: '#A66B22',
  red: '#A64C47',
};

function cleanValue(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text === 'undefined' || text === 'null' ? '' : text;
}

function formatCurrency(value: number): string {
  return Number.isFinite(value) ? currencyFormatter.format(value) : '';
}

function statusLabel(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmada';
    case 'ACTIVE':
      return 'Activa';
    case 'INACTIVE':
      return 'Finalizada';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return '';
  }
}

function getRoom(
  _reservation: ReservationDTO,
  roomOverride?: Room | null,
): Room | null {
  return roomOverride ?? null;
}

export async function loadReservationPdfRoom(
  reservation: ReservationDTO,
  roomService: RoomService,
  roomTypeService: RoomTypeService,
): Promise<ReservationPdfRoomInfo> {
  let room = getRoom(reservation);
  const roomId = reservation.roomId || room?.id;
  const initialRoomTypeId = reservation.roomTypeId || room?.roomType?.id;

  if (roomId) {
    try {
      const loadedRoom = await firstValueFrom(roomService.findById(roomId));
      room = {
        ...room,
        ...loadedRoom,
        roomType: loadedRoom.roomType ?? room?.roomType,
      };
    } catch (error) {
      console.error('No fue posible cargar los datos de la habitación.', error);
    }
  } else if (
    initialRoomTypeId &&
    (!room || !room.capacity || !room.roomType?.imageUrl)
  ) {
    try {
      const rooms = await firstValueFrom(
        roomService.findByTypeId(initialRoomTypeId),
      );
      const roomNumber = cleanValue(reservation.roomNumber).toLocaleLowerCase();
      const candidate =
        rooms.find(
          (item) =>
            cleanValue(item.number).toLocaleLowerCase() === roomNumber,
        ) ??
        rooms.find(
          (item) =>
            item.capacity > 0 ||
            item.roomType?.imageUrl ||
            item.imageUrl,
        ) ??
        rooms[0];
      if (candidate) {
        room = {
          ...room,
          ...candidate,
          roomType: { ...room?.roomType, ...candidate.roomType },
        };
      }
    } catch (error) {
      console.error(
        'No fue posible cargar los datos del tipo de habitación.',
        error,
      );
    }
  } else if (!roomId && !initialRoomTypeId && reservation.roomNumber) {
    try {
      const rooms = await firstValueFrom(roomService.findAll());
      const roomNumber = cleanValue(reservation.roomNumber).toLocaleLowerCase();
      const matchedRoom = rooms.find(
        (candidate) =>
          cleanValue(candidate.number).toLocaleLowerCase() === roomNumber,
      );
      if (matchedRoom) {
        room = matchedRoom;
      }
    } catch (error) {
      console.error(
        'No fue posible buscar los datos por número de habitación.',
        error,
      );
    }
  }

  const roomTypeId = reservation.roomTypeId || room?.roomType?.id;
  let roomTypeImageUrl = cleanValue(room?.roomType?.imageUrl);
  let roomTypeName = cleanValue(
    reservation.roomTypeName || room?.roomType?.name,
  );
  if (roomTypeId && (!roomTypeImageUrl || !roomTypeName)) {
    try {
      const roomType = await firstValueFrom(
        roomTypeService.findById(roomTypeId),
      );
      roomTypeImageUrl ||= cleanValue(roomType.imageUrl);
      roomTypeName ||= cleanValue(roomType.name);
      if (room) {
        room = { ...room, roomType: { ...room.roomType, ...roomType } };
      }
    } catch (error) {
      console.error('No fue posible cargar la imagen del tipo de habitación.', error);
    }
  }

  return { room, roomTypeImageUrl, roomTypeName };
}

function getServices(reservation: ReservationDTO): PdfService[] {
  return (reservation.services ?? [])
    .filter((service: ReservationServiceDTO) => cleanValue(service.name))
    .map((service) => ({
      name: cleanValue(service.name),
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      subtotal: service.subtotal,
    }));
}

function imageUrlsForRoom(
  room: Room | null,
  roomTypeImageUrl: string,
): string[] {
  const sources = [
    roomTypeImageUrl,
    room?.roomType?.imageUrl,
    room?.imageUrl,
    room?.secondaryImageUrl,
  ].filter((source): source is string => !!cleanValue(source));
  const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
  const urls = new Set<string>();

  for (const source of sources) {
    try {
      urls.add(new URL(source, `${apiOrigin}/`).href);
      urls.add(new URL(source, document.baseURI).href);
    } catch (error) {
      console.warn('Se omitió una URL de imagen de habitación no válida.', error);
    }
  }
  return [...urls];
}

function loadImage(source: string): Promise<HTMLImageElement | null> {
  if (!source) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const image = new Image();
    const imageUrl = new URL(source, document.baseURI);
    if (imageUrl.origin !== window.location.origin) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = imageUrl.href;
  });
}

async function loadRoomImage(
  room: Room | null,
  roomTypeImageUrl: string,
): Promise<HTMLImageElement | null> {
  for (const source of imageUrlsForRoom(room, roomTypeImageUrl)) {
    const image = await loadImage(source);
    if (image) {
      return image;
    }
  }
  return null;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string | CanvasGradient | CanvasPattern,
  stroke?: string,
): void {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = 0.8;
    context.stroke();
  }
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    maxWidth?: number;
  } = {},
): void {
  context.fillStyle = options.color ?? colors.ink;
  context.font = options.font ?? '10px Arial, sans-serif';
  context.textAlign = options.align ?? 'left';
  context.textBaseline = 'alphabetic';
  context.fillText(
    cleanValue(text),
    x,
    y,
    options.maxWidth ?? PAGE_WIDTH,
  );
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const ratio = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / ratio;
  const sourceHeight = height / ratio;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  context.save();
  context.beginPath();
  context.roundRect(x, y, width, height, 3);
  context.clip();
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
  context.restore();
}

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawLabel(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): void {
  drawText(context, label.toLocaleUpperCase('es-ES'), x, y, {
    color: colors.muted,
    font: 'bold 7px Arial, sans-serif',
    maxWidth: width,
  });
  drawText(context, value || '—', x, y + 15, {
    font: '10px Arial, sans-serif',
    maxWidth: width,
  });
}

function drawSectionTitle(
  context: CanvasRenderingContext2D,
  number: string,
  title: string,
  y: number,
): void {
  drawText(context, number, 42, y, {
    color: colors.gold,
    font: 'bold 8px Arial, sans-serif',
  });
  drawText(context, title.toLocaleUpperCase('es-ES'), 58, y, {
    color: colors.ink,
    font: 'bold 8px Arial, sans-serif',
  });
  context.fillStyle = colors.border;
  context.fillRect(42, y + 7, PAGE_WIDTH - 84, 0.7);
}

function drawBadge(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  context.font = 'bold 7px Arial, sans-serif';
  const width = Math.min(context.measureText(text.toLocaleUpperCase('es-ES')).width + 18, 154);
  roundedRect(context, x, y, width, 20, 2, '#FFFFFF', color);
  drawText(context, text.toLocaleUpperCase('es-ES'), x + width / 2, y + 13, {
    color,
    font: 'bold 7px Arial, sans-serif',
    align: 'center',
    maxWidth: width - 8,
  });
}

function drawHeader(
  context: CanvasRenderingContext2D,
  reservation: ReservationDTO,
  logo: HTMLImageElement | null,
  pageNumber: number,
  pageCount: number,
): void {
  context.fillStyle = colors.background;
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  roundedRect(context, 20, 14, PAGE_WIDTH - 40, PAGE_HEIGHT - 28, 2, colors.paper);

  const accent = context.createLinearGradient(20, 0, PAGE_WIDTH - 20, 0);
  accent.addColorStop(0, colors.gold);
  accent.addColorStop(0.55, '#E6C98D');
  accent.addColorStop(1, colors.gold);
  context.fillStyle = accent;
  context.fillRect(20, 14, PAGE_WIDTH - 40, 4);
  roundedRect(context, 20, 18, PAGE_WIDTH - 40, 62, 2, colors.navy);

  if (logo) {
    drawImageContain(context, logo, 42, 28, 166, 44);
  } else {
    drawText(context, 'MONTCLAIR', 42, 48, {
      color: colors.paper,
      font: '22px Georgia, serif',
    });
    drawText(context, 'GRAND HOTEL', 43, 61, {
      color: colors.gold,
      font: 'bold 7px Arial, sans-serif',
    });
  }

  drawText(context, 'DETALLE DE ESTANCIA', PAGE_WIDTH - 42, 43, {
    color: '#E6C98D',
    font: 'bold 7px Arial, sans-serif',
    align: 'right',
  });
  drawText(context, `RESERVACIÓN #${reservation.id}`, PAGE_WIDTH - 42, 57, {
    color: colors.paper,
    font: '10px Georgia, serif',
    align: 'right',
  });
  context.fillStyle = colors.border;
  context.fillRect(42, 79, PAGE_WIDTH - 84, 0.8);

  if (pageCount > 1) {
    drawText(
      context,
      `PÁGINA ${pageNumber} DE ${pageCount}`,
      PAGE_WIDTH - 42,
      PAGE_HEIGHT - 30,
      { color: colors.muted, font: '7px Arial, sans-serif', align: 'right' },
    );
  }
}

function drawMainPage(
  context: CanvasRenderingContext2D,
  reservation: ReservationDTO,
  room: Room | null,
  roomTypeName: string,
  logo: HTMLImageElement | null,
  roomImage: HTMLImageElement | null,
  services: PdfService[],
  continuationPages: number,
  generatedAt: string,
): void {
  drawHeader(context, reservation, logo, 1, continuationPages + 1);
  drawText(context, 'SU ESTANCIA EN MONTCLAIR', 42, 104, {
    color: colors.gold,
    font: 'bold 7px Arial, sans-serif',
  });
  drawText(context, `Reservación #${reservation.id}`, 42, 132, {
    color: colors.ink,
    font: '25px Georgia, serif',
  });

  const statusColor =
    reservation.status === 'CANCELLED'
      ? colors.red
      : reservation.status === 'ACTIVE'
        ? colors.green
        : colors.gold;
  drawBadge(context, statusLabel(reservation.status), 371, 111, statusColor);
  drawBadge(
    context,
    reservation.paid ? 'Cuenta pagada' : 'Pendiente de pago',
    371,
    136,
    reservation.paid ? colors.green : colors.amber,
  );

  drawSectionTitle(context, '01', 'Información del huésped', 176);
  roundedRect(context, 42, 188, 246, 112, 3, colors.panel, colors.border);
  roundedRect(context, 300, 188, 253, 112, 3, colors.panel, colors.border);

  const guestName = [
    cleanValue(reservation.clientFirstName),
    cleanValue(reservation.clientLastName),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleUpperCase('es-ES');
  drawLabel(context, 'Nombre completo', guestName, 55, 207, 220);
  drawLabel(
    context,
    'Correo electrónico',
    cleanValue(reservation.clientEmail),
    55,
    239,
    220,
  );
  drawLabel(
    context,
    'Teléfono',
    cleanValue(reservation.clientPhone) || 'No especificado',
    55,
    271,
    220,
  );

  drawText(context, 'FECHAS DE ESTANCIA', 314, 207, {
    color: colors.gold,
    font: 'bold 7px Arial, sans-serif',
  });
  drawLabel(context, 'Entrada', cleanValue(reservation.checkInDate), 314, 230, 104);
  drawLabel(context, 'Salida', cleanValue(reservation.checkOutDate), 437, 230, 104);
  context.fillStyle = colors.border;
  context.fillRect(314, 266, 225, 0.7);
  const nights =
    typeof reservation.nights === 'number' && Number.isFinite(reservation.nights)
      ? reservation.nights
      : null;
  const guestCount =
    typeof reservation.numberOfPeople === 'number' &&
    Number.isFinite(reservation.numberOfPeople)
      ? `${reservation.numberOfPeople} huéspedes`
      : '';
  const staySummary = [
    guestCount,
    nights === null ? '' : `${nights} ${nights === 1 ? 'noche' : 'noches'}`,
  ]
    .filter(Boolean)
    .join(' · ');
  if (staySummary) {
    drawText(context, staySummary, 314, 285, {
      color: colors.ink,
      font: 'bold 9px Arial, sans-serif',
    });
  }

  drawSectionTitle(context, '02', 'Habitación reservada', 328);
  roundedRect(context, 42, 340, 511, 128, 3, colors.paper, colors.border);
  if (roomImage) {
    drawImageCover(context, roomImage, 52, 350, 154, 108);
  } else {
    roundedRect(context, 52, 350, 154, 108, 2, colors.goldLight);
    drawText(context, 'IMAGEN DE HABITACIÓN', 129, 402, {
      color: colors.muted,
      font: 'bold 7px Arial, sans-serif',
      align: 'center',
      maxWidth: 140,
    });
    drawText(context, 'MONTCLAIR GRAND HOTEL', 129, 417, {
      color: colors.gold,
      font: '8px Georgia, serif',
      align: 'center',
      maxWidth: 140,
    });
  }

  const roomTitle =
    cleanValue(reservation.roomName) ||
    cleanValue(room?.name) ||
    `Habitación ${cleanValue(reservation.roomNumber || room?.number)}`;
  drawText(context, cleanValue(roomTypeName || reservation.roomTypeName || room?.roomType?.name).toLocaleUpperCase('es-ES'), 222, 365, {
    color: colors.gold,
    font: 'bold 7px Arial, sans-serif',
  });
  drawText(context, roomTitle.toLocaleUpperCase('es-ES'), 222, 386, {
    color: colors.ink,
    font: 'bold 17px Georgia, serif',
    maxWidth: 205,
  });
  drawLabel(
    context,
    'Número',
    cleanValue(reservation.roomNumber || room?.number),
    222,
    411,
    74,
  );
  drawLabel(
    context,
    typeof room?.floor === 'number' ? 'Piso' : 'Cama',
    typeof room?.floor === 'number'
      ? String(room.floor)
      : cleanValue(room?.bedType),
    302,
    411,
    68,
  );
  drawLabel(
    context,
    'Capacidad',
    typeof room?.capacity === 'number' ? `${room.capacity} huéspedes` : '',
    378,
    411,
    82,
  );
  if (typeof room?.area === 'number' && room.area > 0) {
    drawLabel(context, 'Superficie', `${room.area} m²`, 222, 442, 92);
  }
  drawText(context, 'TARIFA APLICADA', 538, 365, {
    color: colors.muted,
    font: 'bold 6px Arial, sans-serif',
    align: 'right',
  });
  const nightlyRate =
    typeof reservation.pricePerNight === 'number' &&
    Number.isFinite(reservation.pricePerNight)
      ? reservation.pricePerNight
      : room?.pricePerNight;
  if (typeof nightlyRate === 'number' && Number.isFinite(nightlyRate)) {
    drawText(context, formatCurrency(nightlyRate), 538, 383, {
      color: colors.ink,
      font: 'bold 11px Arial, sans-serif',
      align: 'right',
    });
    drawText(context, 'por noche', 538, 396, {
      color: colors.muted,
      font: '7px Arial, sans-serif',
      align: 'right',
    });
  }

  drawSectionTitle(context, '03', 'Servicios y experiencias', 494);
  const firstPageServices = services.slice(0, 3);
  const serviceStartY = 506;
  roundedRect(context, 42, serviceStartY, 511, 23, 2, colors.goldLight);
  drawText(context, 'SERVICIO', 53, serviceStartY + 15, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
  });
  drawText(context, 'CANTIDAD', 364, serviceStartY + 15, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
    align: 'center',
  });
  drawText(context, 'PRECIO UNITARIO', 447, serviceStartY + 15, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
    align: 'right',
  });
  drawText(context, 'SUBTOTAL', 540, serviceStartY + 15, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
    align: 'right',
  });

  let rowY = serviceStartY + 23;
  if (!firstPageServices.length) {
    drawText(context, 'Sin servicios adicionales contratados', 53, rowY + 16, {
      color: colors.muted,
      font: 'italic 8px Arial, sans-serif',
    });
    rowY += 24;
  }
  for (const [index, service] of firstPageServices.entries()) {
    const baseline = rowY + 16;
    drawText(context, service.name, 53, baseline, {
      color: colors.ink,
      font: 'bold 8px Arial, sans-serif',
      maxWidth: 275,
    });
    drawText(context, String(service.quantity), 364, baseline, {
      color: colors.ink,
      font: '8px Arial, sans-serif',
      align: 'center',
    });
    drawText(context, formatCurrency(service.unitPrice), 447, baseline, {
      color: colors.ink,
      font: '8px Arial, sans-serif',
      align: 'right',
    });
    drawText(context, formatCurrency(service.subtotal), 540, baseline, {
      color: colors.ink,
      font: 'bold 8px Arial, sans-serif',
      align: 'right',
    });
    context.fillStyle = colors.border;
    context.fillRect(42, rowY + 23, 511, 0.6);
    rowY += 24;
    if (index < firstPageServices.length - 1) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(42, rowY, 511, 23);
    }
  }

  if (continuationPages > 0) {
    drawText(context, 'El detalle de servicios continúa en la página siguiente.', 53, rowY + 15, {
      color: colors.muted,
      font: 'italic 8px Arial, sans-serif',
    });
    return;
  }

  drawSummary(context, reservation, services, rowY + 18, generatedAt);
}

function drawSummary(
  context: CanvasRenderingContext2D,
  reservation: ReservationDTO,
  services: PdfService[],
  y: number,
  generatedAt: string,
): void {
  const roomSubtotal =
    typeof reservation.roomSubtotal === 'number'
      ? reservation.roomSubtotal
      : reservation.pricePerNight * (reservation.nights || 0);
  const servicesSubtotal =
    typeof reservation.servicesSubtotal === 'number'
      ? reservation.servicesSubtotal
      : services.reduce((total, service) => total + service.subtotal, 0);
  const total =
    typeof reservation.totalPrice === 'number'
      ? reservation.totalPrice
      : roomSubtotal + servicesSubtotal;
  const summaryY = Math.min(Math.max(y, 620), 632);
  const nights =
    typeof reservation.nights === 'number'
      ? reservation.nights
      : 0;
  const nightlyRate =
    typeof reservation.pricePerNight === 'number'
      ? reservation.pricePerNight
      : nights > 0
        ? roomSubtotal / nights
        : 0;
  const paidAmount =
    typeof reservation.paidAmount === 'number' ? reservation.paidAmount : 0;

  roundedRect(
    context,
    42,
    summaryY,
    PAGE_WIDTH - 84,
    145,
    3,
    colors.panel,
    colors.border,
  );
  drawText(context, 'DESGLOSE DETALLADO DE LA CUENTA', 56, summaryY + 19, {
    color: colors.gold,
    font: 'bold 8px Arial, sans-serif',
  });
  context.fillStyle = colors.border;
  context.fillRect(56, summaryY + 27, PAGE_WIDTH - 112, 0.7);

  const nightsLabel = nights ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : 'Estancia';
  drawText(
    context,
    `Alojamiento · ${nightsLabel} × ${formatCurrency(nightlyRate)} / noche`,
    56,
    summaryY + 45,
    { color: colors.muted, font: '8px Arial, sans-serif', maxWidth: 350 },
  );
  drawText(context, formatCurrency(roomSubtotal), PAGE_WIDTH - 56, summaryY + 45, {
    color: colors.ink,
    font: '8px Arial, sans-serif',
    align: 'right',
  });
  drawText(
    context,
    `Servicios contratados · ${services.length} ${services.length === 1 ? 'concepto' : 'conceptos'}`,
    56,
    summaryY + 62,
    { color: colors.muted, font: '8px Arial, sans-serif' },
  );
  drawText(context, formatCurrency(servicesSubtotal), PAGE_WIDTH - 56, summaryY + 62, {
    color: colors.ink,
    font: '8px Arial, sans-serif',
    align: 'right',
  });
  if (paidAmount > 0) {
    drawText(context, 'Monto abonado', 56, summaryY + 79, {
      color: colors.green,
      font: '8px Arial, sans-serif',
    });
    drawText(context, `− ${formatCurrency(paidAmount)}`, PAGE_WIDTH - 56, summaryY + 79, {
      color: colors.green,
      font: '8px Arial, sans-serif',
      align: 'right',
    });
  }
  const paymentText = reservation.paid ? 'Cuenta pagada' : 'Pendiente de pago';
  const pending =
    reservation.paid
      ? 0
      : typeof reservation.pendingBalance === 'number'
        ? reservation.pendingBalance
        : Math.max(0, total - paidAmount);
  drawText(context, paymentText, 56, summaryY + 96, {
    color: reservation.paid ? colors.green : colors.amber,
    font: 'bold 8px Arial, sans-serif',
  });
  drawText(
    context,
    `Saldo pendiente: ${formatCurrency(pending)}`,
    PAGE_WIDTH - 56,
    summaryY + 96,
    {
      color: reservation.paid ? colors.green : colors.amber,
      font: 'bold 8px Arial, sans-serif',
      align: 'right',
    },
  );

  const totalBand = context.createLinearGradient(42, 0, PAGE_WIDTH - 42, 0);
  totalBand.addColorStop(0, colors.navy);
  totalBand.addColorStop(1, colors.navyLight);
  roundedRect(context, 51, summaryY + 106, PAGE_WIDTH - 102, 29, 2, totalBand);
  drawText(context, 'TOTAL RESERVA', 64, summaryY + 125, {
    color: colors.paper,
    font: 'bold 8px Arial, sans-serif',
  });
  drawText(context, formatCurrency(total), PAGE_WIDTH - 64, summaryY + 127, {
    color: '#E6C98D',
    font: 'bold 14px Georgia, serif',
    align: 'right',
  });

  context.fillStyle = colors.border;
  context.fillRect(42, PAGE_HEIGHT - 57, PAGE_WIDTH - 84, 0.7);
  drawText(context, 'Impuestos y tasas de estancia incluidos.', 42, PAGE_HEIGHT - 43, {
    color: colors.muted,
    font: '7px Arial, sans-serif',
  });
  drawText(context, `Generado el ${generatedAt}`, 42, PAGE_HEIGHT - 29, {
    color: colors.muted,
    font: '7px Arial, sans-serif',
  });
  drawText(
    context,
    'MontClair Grand Hotel · Luxury Stay & Concierge Experience',
    PAGE_WIDTH - 42,
    PAGE_HEIGHT - 29,
    { color: colors.muted, font: '7px Georgia, serif', align: 'right' },
  );
}

function drawContinuationPage(
  context: CanvasRenderingContext2D,
  reservation: ReservationDTO,
  logo: HTMLImageElement | null,
  services: PdfService[],
  pageNumber: number,
  pageCount: number,
  generatedAt: string,
): void {
  drawHeader(context, reservation, logo, pageNumber, pageCount);
  drawText(context, 'DETALLE DE SERVICIOS', 42, 111, {
    color: colors.gold,
    font: 'bold 8px Arial, sans-serif',
  });
  drawText(context, 'Servicios y experiencias contratadas', 42, 138, {
    color: colors.ink,
    font: '22px Georgia, serif',
  });

  let y = 164;
  roundedRect(context, 42, y, 511, 25, 2, colors.goldLight);
  drawText(context, 'SERVICIO', 53, y + 16, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
  });
  drawText(context, 'CANTIDAD', 364, y + 16, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
    align: 'center',
  });
  drawText(context, 'PRECIO UNITARIO', 447, y + 16, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
    align: 'right',
  });
  drawText(context, 'SUBTOTAL', 540, y + 16, {
    color: colors.ink,
    font: 'bold 7px Arial, sans-serif',
    align: 'right',
  });
  y += 25;

  for (const service of services) {
    drawText(context, service.name, 53, y + 17, {
      color: colors.ink,
      font: '8px Arial, sans-serif',
      maxWidth: 275,
    });
    drawText(context, String(service.quantity), 364, y + 17, {
      color: colors.ink,
      font: '8px Arial, sans-serif',
      align: 'center',
    });
    drawText(context, formatCurrency(service.unitPrice), 447, y + 17, {
      color: colors.ink,
      font: '8px Arial, sans-serif',
      align: 'right',
    });
    drawText(context, formatCurrency(service.subtotal), 540, y + 17, {
      color: colors.ink,
      font: 'bold 8px Arial, sans-serif',
      align: 'right',
    });
    context.fillStyle = colors.border;
    context.fillRect(42, y + 25, 511, 0.6);
    y += 27;
  }

  if (pageNumber === pageCount) {
    drawSummary(context, reservation, getServices(reservation), y + 24, generatedAt);
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('No fue posible crear la imagen del documento.'));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      'image/jpeg',
      0.98,
    );
  });
}

async function renderPage(
  draw: (context: CanvasRenderingContext2D) => void,
): Promise<PdfPage> {
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH * SCALE;
  canvas.height = PAGE_HEIGHT * SCALE;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('El navegador no pudo preparar el PDF.');
  }
  context.scale(SCALE, SCALE);
  draw(context);
  return {
    image: await canvasToJpeg(canvas),
    width: canvas.width,
    height: canvas.height,
  };
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function buildPdf(pages: PdfPage[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let byteLength = 0;

  const append = (bytes: Uint8Array): void => {
    chunks.push(bytes);
    byteLength += bytes.length;
  };
  const appendText = (text: string): void => append(encoder.encode(text));
  const appendObject = (id: number, body: string): void => {
    offsets[id] = byteLength;
    appendText(`${id} 0 obj\n${body}\nendobj\n`);
  };

  appendText('%PDF-1.4\n');
  appendObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  const pageIds = pages.map((_, index) => 5 + index * 3);
  appendObject(
    2,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  );
  appendObject(
    3,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  );
  appendObject(
    4,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  );

  pages.forEach((page, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const content = `q ${PAGE_WIDTH} 0 0 ${PAGE_HEIGHT} 0 0 cm /Im0 Do Q`;
    const contentBytes = encoder.encode(content);

    appendObject(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    appendObject(
      contentId,
      `<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`,
    );
    offsets[imageId] = byteLength;
    appendText(
      `${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.image.length} >>\nstream\n`,
    );
    append(page.image);
    appendText('\nendstream\nendobj\n');
  });

  const xrefOffset = byteLength;
  appendText(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let id = 1; id < offsets.length; id += 1) {
    appendText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  appendText(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  return concatBytes(chunks);
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export async function downloadReservationPdf(
  reservation: ReservationDTO,
  roomInfoOverride?: ReservationPdfRoomInfo | null,
): Promise<void> {
  try {
    const room = roomInfoOverride?.room ?? getRoom(reservation);
    const roomTypeName =
      roomInfoOverride?.roomTypeName || cleanValue(reservation.roomTypeName);
    const roomTypeImageUrl = roomInfoOverride?.roomTypeImageUrl ?? '';
    const [logo, roomImage] = await Promise.all([
      loadImage(new URL('images/Logo_oscuro_cropped.png', document.baseURI).href),
      loadRoomImage(room, roomTypeImageUrl),
    ]);
    const services = getServices(reservation);
    const generatedAt = formatGeneratedAt(new Date());
    const remaining = services.slice(3);
    const continuationPageCount = Math.ceil(remaining.length / 16);
    const pages: PdfPage[] = [];

    pages.push(
      await renderPage((context) =>
        drawMainPage(
          context,
          reservation,
          room,
          roomTypeName,
          logo,
          roomImage,
          services,
          continuationPageCount,
          generatedAt,
        ),
      ),
    );

    for (let index = 0; index < continuationPageCount; index += 1) {
      const pageServices = remaining.slice(index * 16, (index + 1) * 16);
      const pageNumber = index + 2;
      const pageCount = continuationPageCount + 1;
      pages.push(
        await renderPage((context) =>
          drawContinuationPage(
            context,
            reservation,
            logo,
            pageServices,
            pageNumber,
            pageCount,
            generatedAt,
          ),
        ),
      );
    }

    const blob = new Blob([buildPdf(pages)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservacion-${reservation.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('No fue posible generar el PDF de la reservación.', error);
    window.alert(
      'No fue posible generar el PDF. Intenta nuevamente; si el problema continúa, contacta con soporte.',
    );
  }
}
