import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { SignatureService } from 'src/app/service/signature.service';
import { PanelModule } from 'primeng/panel';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

interface DrawingState {
  drawing: boolean;
  start: { x: number | null; y: number | null };
  end: { x: number | null; y: number | null };
}

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    PanelModule,
    SliderModule,
    ButtonModule
  ]
})
export class SignatureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('signatureCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  // Contrôle de l'épaisseur
  lineWidth: number = 4;
  minLineWidth: number = 1;
  maxLineWidth: number = 20;

  // Couleur du trait
  strokeColor: string = '#000000'; // Noir par défaut

  private context!: CanvasRenderingContext2D;
  private animationFrameId!: number;

  private state: DrawingState = {
    drawing: false,
    start: { x: null, y: null },
    end: { x: null, y: null }
  };

  private lastPoint: { x: number; y: number } | null = null;

  signatureBase64: string = "";

  constructor(private signatureService: SignatureService) { }

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.setupEventListeners();
    this.startRendering();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d')!;

    // Effacer le canvas avec un fond transparent
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.updateCanvasStyles();
  }

  private updateCanvasStyles(): void {
    // Set canvas styles avec fond transparent
    this.context.strokeStyle = this.strokeColor;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.lineWidth = this.lineWidth;
    this.context.globalCompositeOperation = 'source-over';
  }

  private setupEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;

    // Mouse events
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    // Touch events for mobile devices
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private getCanvasCoordinates(clientX: number, clientY: number): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const canvasRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    return {
      x: (clientX - canvasRect.left) * scaleX,
      y: (clientY - canvasRect.top) * scaleY
    };
  }

  private onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    const { x, y } = this.getCanvasCoordinates(event.clientX, event.clientY);

    this.state = {
      drawing: true,
      start: { x, y },
      end: { x, y }
    };

    this.lastPoint = { x, y };

    // Start a new path immediately
    this.context.beginPath();
    this.context.moveTo(x, y);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.state.drawing) return;

    event.preventDefault();
    const { x, y } = this.getCanvasCoordinates(event.clientX, event.clientY);

    this.state = {
      ...this.state,
      end: { x, y }
    };
  }

  private onMouseUp(): void {
    if (this.state.drawing) {
      this.state = {
        drawing: false,
        start: { x: null, y: null },
        end: { x: null, y: null }
      };
      this.lastPoint = null;
    }
  }

  private onMouseLeave(): void {
    this.onMouseUp();
  }

  // Touch event handlers
  private onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);

    this.state = {
      drawing: true,
      start: { x, y },
      end: { x, y }
    };

    this.lastPoint = { x, y };

    // Start a new path immediately
    this.context.beginPath();
    this.context.moveTo(x, y);
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.state.drawing || event.touches.length === 0) return;

    event.preventDefault();
    const touch = event.touches[0];
    const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);

    this.state = {
      ...this.state,
      end: { x, y }
    };
  }

  private onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.onMouseUp();
  }

  private startRendering(): void {
    const render = () => {
      if (this.state.drawing &&
        this.state.start.x !== null &&
        this.state.start.y !== null &&
        this.state.end.x !== null &&
        this.state.end.y !== null) {

        if (this.lastPoint &&
          (this.lastPoint.x !== this.state.end.x || this.lastPoint.y !== this.state.end.y)) {

          this.context.lineTo(this.state.end.x, this.state.end.y);
          this.context.stroke();

          this.lastPoint = { x: this.state.end.x, y: this.state.end.y };
        }
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  // Méthodes pour contrôler l'épaisseur
  increaseLineWidth(): void {
    if (this.lineWidth < this.maxLineWidth) {
      this.lineWidth++;
      this.updateCanvasStyles();
    }
  }

  decreaseLineWidth(): void {
    if (this.lineWidth > this.minLineWidth) {
      this.lineWidth--;
      this.updateCanvasStyles();
    }
  }

  setLineWidth(width: number): void {
    if (width >= this.minLineWidth && width <= this.maxLineWidth) {
      this.lineWidth = width;
      this.updateCanvasStyles();
    }
  }

  // Méthode pour changer la couleur
  setStrokeColor(color: string): void {
    this.strokeColor = color;
    this.updateCanvasStyles();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.initializeCanvas();
  }

  clearSignature(): void {
    const canvas = this.canvasRef.nativeElement;
    // Effacer avec fond transparent
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.state = {
      drawing: false,
      start: { x: null, y: null },
      end: { x: null, y: null }
    };
    this.lastPoint = null;
  }

  saveSignature(): void {
    const canvas = this.canvasRef.nativeElement;

    // Créer un canvas temporaire avec fond transparent
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d')!;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Remplir avec fond transparent
    tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Copier le contenu du canvas original
    tempContext.drawImage(canvas, 0, 0);

    // Exporter en PNG avec fond transparent
    const dataUrl = tempCanvas.toDataURL('image/png');

    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `signature-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.signatureBase64 = dataUrl.split(',')[1];
    console.log('Signature Base64:', this.signatureBase64);

    this.signatureService.uploadSignature(this.signatureBase64).subscribe({
      next: (res) => console.log('Signature enregistrée', res),
      error: (err) => console.error('Erreur lors de l’enregistrement', err)
    });
  }

  // Nouvelle méthode pour obtenir la signature sans fond
  getSignatureWithoutBackground(): string {
    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d')!;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fond transparent
    tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempContext.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL('image/png');
  }

  getSignatureDataUrl(): string {
    return this.getSignatureWithoutBackground();
  }

  isEmpty(): boolean {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d')!;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i + 3] !== 0) {
        return false;
      }
    }
    return true;
  }

  // Helpers: base64 handling and downloads
  private ensureBase64DataUrl(base64: string, mime: string = 'image/png'): string {
    if (!base64) {
      return `data:${mime};base64,`;
    }
    return base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`;
  }

  private base64ToBlob(base64: string, contentType: string = 'image/png'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  downloadBase64AsPng(fileName: string, base64: string): void {
    const dataUrl = this.ensureBase64DataUrl(base64, 'image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadBase64AsPdf(fileName: string, base64: string): void {
    const dataUrl = this.ensureBase64DataUrl(base64, 'image/png');

    const img = new Image();
    img.onload = () => {
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight);
      const outName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      pdf.save(outName);
    };
    img.onerror = () => {
      console.error('Failed to load base64 image. Ensure it is a valid PNG base64 string.');
    };
    img.src = dataUrl;
  }

  // Public convenience methods
  downloadCurrentSignatureAsPng(): void {
    const dataUrl = this.getSignatureWithoutBackground();
    this.downloadBase64AsPng(`signature-${Date.now()}`, dataUrl);
  }

  downloadCurrentSignatureAsPdf(): void {
    if (this.isEmpty()) {
      return;
    }
    const dataUrl = this.getSignatureWithoutBackground();
    this.downloadBase64AsPdf(`signature-${Date.now()}`, dataUrl);
  }

  // Download any provided PNG base64 (without data URL) as PDF
  downloadProvidedBase64AsPdf(base64: string): void {
    this.downloadBase64AsPdf('signature', base64);
  }
}