import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, output, signal } from "@angular/core";

type LectorQr = typeof import("jsqr").default;

const INTERVALO_LECTURA_MS = 200;

@Component({
  selector: "app-escaner-qr",
  styleUrl: "./escaner-qr.scss",
  templateUrl: "./escaner-qr.html",
})
export class EscanerQr implements AfterViewInit, OnDestroy {
  readonly leido = output<string>();

  @ViewChild("video") private readonly video?: ElementRef<HTMLVideoElement>;

  protected readonly encendida = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly lienzo = document.createElement("canvas");
  private flujo: MediaStream | null = null;
  private temporizador: number | null = null;
  private destruido = false;

  ngAfterViewInit(): void {
    void this.encender();
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.apagar();
  }

  private async encender(): Promise<void> {
    const video = this.video?.nativeElement;
    if (!video) return;
    try {
      const [modulo, flujo] = await Promise.all([
        import("jsqr"),
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }),
      ]);
      this.flujo = flujo;
      if (this.destruido) {
        this.apagar();
        return;
      }
      video.srcObject = flujo;
      await video.play();
      this.encendida.set(true);
      this.temporizador = window.setInterval(() => this.leer(video, modulo.default), INTERVALO_LECTURA_MS);
    } catch {
      this.error.set("No se pudo usar la cámara. Revisá el permiso del navegador o ingresá el código a mano.");
    }
  }

  private leer(video: HTMLVideoElement, lector: LectorQr): void {
    if (video.readyState < video.HAVE_ENOUGH_DATA) return;
    const ancho = video.videoWidth;
    const alto = video.videoHeight;
    this.lienzo.width = ancho;
    this.lienzo.height = alto;
    const contexto = this.lienzo.getContext("2d", { willReadFrequently: true });
    if (!contexto) return;
    contexto.drawImage(video, 0, 0, ancho, alto);
    const codigo = lector(contexto.getImageData(0, 0, ancho, alto).data, ancho, alto, { inversionAttempts: "dontInvert" });
    if (!codigo?.data) return;
    this.apagar();
    this.leido.emit(codigo.data);
  }

  private apagar(): void {
    if (this.temporizador !== null) window.clearInterval(this.temporizador);
    this.temporizador = null;
    this.flujo?.getTracks().forEach((pista) => pista.stop());
    this.flujo = null;
    this.encendida.set(false);
  }
}
