import { Injectable } from '@angular/core';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class EscanerService {
  /**
   * Abre la cámara y devuelve el texto del QR, o null si la persona cancela.
   * En Android usa el escáner nativo; en el navegador, la cámara web.
   */
  async escanearQr(): Promise<string | null> {
    try {
      if (!Capacitor.isNativePlatform()) await this.verificarCamaraWeb();
      const { ScanResult } = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
        scanInstructions: 'Apunta al QR del dispositivo',
      });
      return ScanResult.trim() || null;
    } catch (err) {
      const e = err as Error;
      if (e?.name === 'NotFoundError') {
        throw new Error('No se encontró una cámara. Escribe el código en el buscador.');
      }
      const mensaje = String(e?.message ?? err).toLowerCase();
      if (mensaje.includes('cancel')) return null;
      throw new Error(
        'No se pudo usar la cámara. Revisa el permiso de cámara o escribe el código en el buscador.',
      );
    }
  }

  /**
   * En el navegador el plugin no avisa si falta la cámara o se niega el permiso
   * (se queda esperando), así que se pide antes y se suelta de inmediato.
   */
  private async verificarCamaraWeb(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
  }
}
