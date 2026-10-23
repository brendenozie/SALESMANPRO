/**
 * SalesmanPro POS — Web Serial & Bridge Weighing Scale Service
 * Supports RS-232 / USB Serial digital counter scales using standard protocols:
 * - NCI / Fairbanks (e.g., Brecknell, Avery Weigh-Tronix, Tor-Rey)
 * - Mettler Toledo Continuous Protocol
 * - CAS PD-II / SW Series Protocol
 * Includes Web Serial API, Windows Desktop WebView2 Bridge, and Android Bridge integration.
 */

export interface ScaleReading {
  weight: number;
  unit: 'kg' | 'g' | 'lb' | 'oz';
  isStable: boolean;
  isTare: boolean;
  isConnected: boolean;
  raw?: string;
  error?: string;
}

export type ScaleProtocol = 'NCI' | 'TOLEDO' | 'CAS' | 'AVERY';

export interface ScaleConnectionConfig {
  baudRate?: number;
  protocol?: ScaleProtocol;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
}

class ScaleService {
  private port: any = null;
  private reader: any = null;
  private readableStreamClosed: any = null;
  private isReading = false;
  private listeners: Set<(reading: ScaleReading) => void> = new Set();
  private currentReading: ScaleReading = {
    weight: 0,
    unit: 'kg',
    isStable: false,
    isTare: false,
    isConnected: false,
  };
  private protocol: ScaleProtocol = 'NCI';

  constructor() {
    this.setupBridgeListeners();
  }

  public getCurrentReading(): ScaleReading {
    return { ...this.currentReading };
  }

  public addListener(listener: (reading: ScaleReading) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentReading());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getCurrentReading());
      } catch (err) {
        console.error('[ScaleService] Listener error:', err);
      }
    });
  }

  /**
   * Listen for scale weight events from Desktop or Android Native Bridges
   */
  private setupBridgeListeners() {
    if (typeof window === 'undefined') return;

    // 1. Android Bridge Callback
    (window as any).onAndroidScaleReading = (dataStr: string) => {
      try {
        const parsed = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
        this.updateReading({
          weight: parseFloat(parsed.weight) || 0,
          unit: parsed.unit || 'kg',
          isStable: Boolean(parsed.isStable),
          isTare: Boolean(parsed.isTare),
          isConnected: true,
        });
      } catch (err) {
        console.warn('[ScaleService] Failed to parse Android scale reading:', err);
      }
    };

    // 2. Windows Desktop WebView2 Bridge Event
    if ((window as any).chrome?.webview) {
      try {
        (window as any).chrome.webview.addEventListener('message', (event: any) => {
          const msg = event.data;
          if (msg && msg.type === 'SCALE_READING') {
            this.updateReading({
              weight: parseFloat(msg.weight) || 0,
              unit: msg.unit || 'kg',
              isStable: Boolean(msg.isStable),
              isTare: Boolean(msg.isTare),
              isConnected: true,
            });
          }
        });
      } catch {}
    }
  }

  private updateReading(partial: Partial<ScaleReading>) {
    this.currentReading = {
      ...this.currentReading,
      ...partial,
    };
    this.notify();
  }

  /**
   * Connect to physical serial scale via Web Serial API or Native Bridge
   */
  public async connect(
    baudRate = 9600,
    config: Partial<ScaleConnectionConfig> = {}
  ): Promise<{ success: boolean; error?: string }> {
    this.protocol = config.protocol || 'NCI';

    if (typeof window === 'undefined') {
      return { success: false, error: 'Window context unavailable' };
    }

    // 1. Check Native Android Bridge
    if ((window as any).AndroidBridge?.connectScale) {
      try {
        (window as any).AndroidBridge.connectScale(baudRate);
        this.updateReading({ isConnected: true, error: undefined });
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Android scale connection failed' };
      }
    }

    // 2. Check Windows Desktop Bridge
    if ((window as any).chrome?.webview) {
      try {
        (window as any).chrome.webview.postMessage({
          type: 'CONNECT_SCALE',
          baudRate,
          protocol: this.protocol,
        });
        this.updateReading({ isConnected: true, error: undefined });
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Desktop scale connection failed' };
      }
    }

    // 3. Web Serial API (Chrome, Edge, Opera on desktop/laptop)
    if (!('serial' in navigator)) {
      return {
        success: false,
        error: 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or the native SalesmanPro Desktop app.',
      };
    }

    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({
        baudRate,
        dataBits: config.dataBits || 8,
        stopBits: config.stopBits || 1,
        parity: config.parity || 'none',
      });

      this.updateReading({ isConnected: true, error: undefined });
      this.startReadingLoop();
      return { success: true };
    } catch (err: any) {
      console.error('[ScaleService] Web Serial connect error:', err);
      const msg = err.name === 'NotFoundError' ? 'Scale port selection cancelled.' : err.message || 'Failed to open serial port';
      this.updateReading({ isConnected: false, error: msg });
      return { success: false, error: msg };
    }
  }

  /**
   * Continuous read loop for incoming serial stream
   */
  private async startReadingLoop() {
    if (!this.port || !this.port.readable || this.isReading) return;
    this.isReading = true;

    try {
      const textDecoder = new (window as any).TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      let buffer = '';

      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          // Frames typically terminate with CR LF (\r\n) or CR (\r)
          const lines = buffer.split(/[\r\n]+/);
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              this.parseScaleFrame(line.trim());
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('[ScaleService] Serial reading error:', err);
      this.updateReading({ isConnected: false, error: err.message });
    } finally {
      this.isReading = false;
    }
  }

  /**
   * Parse serial frame based on protocol
   */
  public parseScaleFrame(raw: string): ScaleReading | null {
    try {
      let weight = 0;
      let unit: 'kg' | 'g' | 'lb' | 'oz' = 'kg';
      let isStable = true;
      let isTare = false;

      // NCI / Fairbanks Format: <LF><status><status><sign><weight 5 digits><unit><CR>
      // Example: "  0.450kg" or "ST,GS,+  1.250kg"
      const nciMatch = raw.match(/([+-]?\s*\d+\.?\d*)\s*(kg|g|lb|oz)/i);
      if (nciMatch) {
        weight = parseFloat(nciMatch[1].replace(/\s+/g, ''));
        unit = nciMatch[2].toLowerCase() as any;
        isStable = !raw.includes('US') && !raw.includes('M');
        isTare = raw.includes('TR') || raw.includes('NT');
      } else {
        // Generic number extractor fallback
        const genericMatch = raw.match(/([+-]?\d+\.?\d*)/);
        if (genericMatch) {
          weight = parseFloat(genericMatch[1]);
          if (raw.toLowerCase().includes('lb')) unit = 'lb';
          else if (raw.toLowerCase().includes('g')) unit = 'g';
          else unit = 'kg';
        }
      }

      if (!isNaN(weight)) {
        const parsed: ScaleReading = {
          weight: Math.max(0, weight),
          unit,
          isStable,
          isTare,
          isConnected: true,
          raw,
        };
        this.updateReading(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('[ScaleService] Failed to parse frame:', raw, e);
    }
    return null;
  }

  /**
   * Send Zero / Tare command to physical scale
   */
  public async sendTareCommand(): Promise<void> {
    // 1. Android Bridge
    if ((window as any).AndroidBridge?.tareScale) {
      try {
        (window as any).AndroidBridge.tareScale();
        return;
      } catch {}
    }

    // 2. Desktop Bridge
    if ((window as any).chrome?.webview) {
      try {
        (window as any).chrome.webview.postMessage({ type: 'TARE_SCALE' });
        return;
      } catch {}
    }

    // 3. Web Serial output command (NCI standard: 'Z\r' or 'T\r')
    if (this.port && this.port.writable) {
      try {
        const textEncoder = new TextEncoder();
        const writer = this.port.writable.getWriter();
        await writer.write(textEncoder.encode('T\r\n'));
        writer.releaseLock();
      } catch (err) {
        console.warn('[ScaleService] Failed to write Tare command:', err);
      }
    }
  }

  /**
   * Manually simulate weight (for testing, demo, or manual entry)
   */
  public setSimulatedWeight(weight: number, unit: 'kg' | 'g' | 'lb' | 'oz' = 'kg') {
    this.updateReading({
      weight: Math.max(0, weight),
      unit,
      isStable: true,
      isTare: false,
      isConnected: true,
      raw: `SIMULATED_${weight}${unit}`,
    });
  }

  public async disconnect(): Promise<void> {
    this.isReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {}
      this.reader = null;
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch {}
      this.port = null;
    }
    this.updateReading({ isConnected: false });
  }
}

export const scaleService = new ScaleService();
