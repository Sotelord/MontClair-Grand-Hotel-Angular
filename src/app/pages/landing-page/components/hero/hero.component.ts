import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @ViewChild('heroTrack', { static: true })
  heroTrack!: ElementRef<HTMLElement>;

  @ViewChild('heroStage', { static: true })
  heroStage!: ElementRef<HTMLElement>;

  @ViewChild('heroCanvas', { static: true })
  heroCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly totalFrames = 150;
  private readonly frames: (HTMLImageElement | null)[] = new Array(
    this.totalFrames,
  ).fill(null);

  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private targetFrame = 0;
  private currentFrame = 0;
  private lastDrawnIndex = -1;
  private rafId: number | null = null;
  private destroyed = false;
  private reducedMotion = false;

  private readonly onScrollBound = () => this.updateTargetFromScroll();
  private readonly onResizeBound = () => this.resizeCanvas();

  ngAfterViewInit(): void {
    const canvas = this.heroCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      return;
    }

    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.resizeCanvas();
    this.preloadFrames();

    if (this.reducedMotion) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScrollBound, { passive: true });
      window.addEventListener('resize', this.onResizeBound, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
        this.resizeObserver.observe(this.heroStage.nativeElement);
      }
      this.updateTargetFromScroll();
      this.startRenderLoop();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    window.removeEventListener('scroll', this.onScrollBound);
    window.removeEventListener('resize', this.onResizeBound);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private getFrameUrl(index: number): string {
    const padded = String(index + 1).padStart(4, '0');
    return `hero-frames/frame_${padded}.webp`;
  }

  private preloadFrames(): void {
    // 1) Cargar primero el frame inicial para pintarlo de inmediato
    this.loadFrame(0, () => {
      if (!this.destroyed && this.lastDrawnIndex === -1) {
        this.drawFrame(0);
      }
    });

    if (this.reducedMotion) {
      return;
    }

    // 2) Precarga progresiva: primero cada 5 frames para respuesta rápida al scroll, luego el resto
    const priorityOrder: number[] = [];
    for (let i = 5; i < this.totalFrames; i += 5) {
      priorityOrder.push(i);
    }
    for (let i = 1; i < this.totalFrames; i++) {
      if (i % 5 !== 0) {
        priorityOrder.push(i);
      }
    }

    for (const index of priorityOrder) {
      this.loadFrame(index);
    }
  }

  private loadFrame(index: number, onLoad?: () => void): void {
    const img = new Image();
    img.decoding = 'async';
    img.src = this.getFrameUrl(index);
    img.onload = () => {
      if (this.destroyed) {
        return;
      }
      this.frames[index] = img;
      onLoad?.();
    };
  }

  private resizeCanvas(): void {
    const stage = this.heroStage.nativeElement;
    const canvas = this.heroCanvas.nativeElement;
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.lastDrawnIndex = -1;
      this.drawFrame(Math.round(this.currentFrame));
    }
  }

  private updateTargetFromScroll(): void {
    const track = this.heroTrack.nativeElement;
    const rect = track.getBoundingClientRect();
    const scrollableDistance = track.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) {
      this.targetFrame = 0;
      return;
    }

    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / scrollableDistance));
    this.targetFrame = progress * (this.totalFrames - 1);
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.destroyed) {
        return;
      }

      // Interpolación suave hacia el frame objetivo del scroll
      const diff = this.targetFrame - this.currentFrame;
      if (Math.abs(diff) > 0.05) {
        this.currentFrame += diff * 0.18;
      } else {
        this.currentFrame = this.targetFrame;
      }

      const frameIndex = Math.min(
        this.totalFrames - 1,
        Math.max(0, Math.round(this.currentFrame)),
      );

      if (frameIndex !== this.lastDrawnIndex) {
        this.drawFrame(frameIndex);
      }

      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  private findClosestLoadedFrame(targetIndex: number): HTMLImageElement | null {
    const direct = this.frames[targetIndex];
    if (direct) {
      return direct;
    }

    for (let offset = 1; offset < this.totalFrames; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && this.frames[prev]) {
        return this.frames[prev];
      }
      const next = targetIndex + offset;
      if (next < this.totalFrames && this.frames[next]) {
        return this.frames[next];
      }
    }

    return null;
  }

  private drawFrame(frameIndex: number): void {
    if (!this.ctx) {
      return;
    }

    const img = this.findClosestLoadedFrame(frameIndex);
    if (!img || !img.naturalWidth || !img.naturalHeight) {
      return;
    }

    const canvas = this.heroCanvas.nativeElement;
    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Equivalente a object-fit: cover centrado
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    this.ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    this.lastDrawnIndex = frameIndex;
  }
}
