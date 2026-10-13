import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface GalleryItem {
  id: number;
  title: string;
  category: 'exteriores' | 'suites' | 'gastronomia' | 'spa' | 'eventos';
  categoryLabel: string;
  imageUrl: string;
  description: string;
  isWide?: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  selectedCategory: string = 'todas';
  selectedImage: GalleryItem | null = null;

  categories = [
    { id: 'todas', label: 'Todas' },
    { id: 'suites', label: 'Suites & Habitaciones' },
    { id: 'gastronomia', label: 'Gastronomía' },
    { id: 'spa', label: 'Spa & Bienestar' },
    { id: 'exteriores', label: 'Exteriores & Piscina' },
    { id: 'eventos', label: 'Eventos & Salones' },
  ];

  galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: 'Fachada al Atardecer',
      category: 'exteriores',
      categoryLabel: 'Exteriores',
      imageUrl: 'images/Hotel Atardecer.jpg',
      description: 'Vista crepuscular de la arquitectura emblemática del Montclair Grand Hotel frente a la costa mediterránea.',
    },
    {
      id: 2,
      title: 'Grand Royal Suite',
      category: 'suites',
      categoryLabel: 'Suites',
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      description: 'Dormitorio principal con acabados en maderas nobles, lino egipcio y vistas panorámicas al mar.',
    },
    {
      id: 3,
      title: 'Restaurante Le Mirador',
      category: 'gastronomia',
      categoryLabel: 'Gastronomía',
      imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
      description: 'Alta cocina mediterránea galardonada, maridada con los viñedos más selectos del principado.',
    },
    {
      id: 4,
      title: 'Santuario Spa & Hidroterapia',
      category: 'spa',
      categoryLabel: 'Spa & Bienestar',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      description: 'Circuito termal de hidroterapia, aromaterapia y tratamientos holísticos para rejuvenecer cuerpo y mente.',
    },
    {
      id: 5,
      title: 'Piscina Infinity Panorámica',
      category: 'exteriores',
      categoryLabel: 'Piscina',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
      description: 'Piscina de borde infinito climatizada con solárium privado y servicio de cócteles artesanos.',
    },
    {
      id: 6,
      title: 'Interior Suite Ejecutiva',
      category: 'suites',
      categoryLabel: 'Habitaciones',
      imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      description: 'Espacio armónico diseñado para el máximo confort y descanso sereno con iluminación inteligente.',
    },
    {
      id: 7,
      title: 'Salón de Galas & Bodas Reales',
      category: 'eventos',
      categoryLabel: 'Eventos & Bodas',
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
      description: 'Majestuoso salón con candelabros de cristal, perfecto para recepciones, banquetes y bodas de ensueño.',
      isWide: true,
    },
    {
      id: 8,
      title: 'Servicio Gastronómico en Habitación',
      category: 'gastronomia',
      categoryLabel: 'Room Service',
      imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
      description: 'Desayunos a la carta y cenas de alta gastronomía servidas con discreción las 24 horas del día.',
    },
    {
      id: 9,
      title: 'Baño de Mármol Imperial',
      category: 'suites',
      categoryLabel: 'Detalles de Lujo',
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      description: 'Baño spa privado con revestimiento de mármol de Carrara, bañera exenta y amenidades exclusivas.',
    },
    {
      id: 10,
      title: 'Centro de Fitness & Wellness',
      category: 'spa',
      categoryLabel: 'Fitness Center',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      description: 'Equipamiento de última generación Technogym con entrenadores personales disponibles previa reserva.',
    },
    {
      id: 11,
      title: 'Lounge Bar & Gran Vestíbulo',
      category: 'exteriores',
      categoryLabel: 'Lounge & Lobby',
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      description: 'Punto de encuentro distinguido con piano en vivo, selección de champagne y ambiente cosmopolita.',
    },
    {
      id: 12,
      title: 'Terraza Solárium Mediterráneo',
      category: 'exteriores',
      categoryLabel: 'Exteriores',
      imageUrl: 'images/Piscina.png',
      description: 'Vistas despejadas al mar en nuestro solárium exclusivo con cabañas privadas.',
    },
  ];

  get filteredItems(): GalleryItem[] {
    if (this.selectedCategory === 'todas') {
      return this.galleryItems;
    }
    return this.galleryItems.filter(item => item.category === this.selectedCategory);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  openLightbox(item: GalleryItem): void {
    this.selectedImage = item;
  }

  closeLightbox(): void {
    this.selectedImage = null;
  }
}
