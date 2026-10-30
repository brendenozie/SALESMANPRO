"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBarcodeScannerWedge = exports.scanAudio = void 0;
const react_1 = require("react");
/**
 * Audio feedback synthesizer using native Web Audio API (zero external assets)
 */
class ScanAudioSynthesizer {
    ctx = null;
    getContext() {
        if (typeof window === 'undefined')
            return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }
        return this.ctx;
    }
    playSuccess() {
        try {
            const ctx = this.getContext();
            if (!ctx)
                return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1760, ctx.currentTime); // High crisp A6 tone
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        }
        catch (e) {
            // Non-blocking audio
        }
    }
    playError() {
        try {
            const ctx = this.getContext();
            if (!ctx)
                return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.setValueAtTime(260, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        }
        catch (e) {
            // Non-blocking audio
        }
    }
}
exports.scanAudio = new ScanAudioSynthesizer();
/**
 * Universal Hardware Barcode Scanner Wedge Hook
 * Captures rapid keystrokes from USB & Bluetooth handheld laser/CCD barcode guns.
 */
function useBarcodeScannerWedge({ enabled = true, maxCadenceMs = 55, minBarcodeLength = 3, onScan, onBarcodeScanned, onError, }) {
    const effectiveScan = onScan || onBarcodeScanned || (() => { });
    const bufferRef = (0, react_1.useRef)('');
    const lastKeyTimeRef = (0, react_1.useRef)(0);
    const onScanRef = (0, react_1.useRef)(effectiveScan);
    const onErrorRef = (0, react_1.useRef)(onError);
    onScanRef.current = effectiveScan;
    onErrorRef.current = onError;
    const handleKeyDown = (0, react_1.useCallback)((e) => {
        if (!enabled)
            return;
        const now = Date.now();
        const timeDiff = now - lastKeyTimeRef.current;
        lastKeyTimeRef.current = now;
        // Ignore individual control keys
        if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
            return;
        }
        // Scanner finished transmitting line (Enter or Tab key)
        if (e.key === 'Enter' || e.key === 'Tab') {
            const barcode = bufferRef.current.trim();
            bufferRef.current = '';
            if (barcode.length >= minBarcodeLength) {
                // Prevent standard enter key submissions / form actions
                e.preventDefault();
                e.stopPropagation();
                console.log(`[BarcodeWedge] Scanned barcode: ${barcode}`);
                exports.scanAudio.playSuccess();
                onScanRef.current(barcode);
            }
            return;
        }
        // If typed character is a standard printable character
        if (e.key.length === 1) {
            // If elapsed time between keystrokes is longer than hardware scanner cadence, reset buffer
            if (timeDiff > maxCadenceMs) {
                bufferRef.current = e.key;
            }
            else {
                bufferRef.current += e.key;
            }
        }
    }, [enabled, maxCadenceMs, minBarcodeLength]);
    (0, react_1.useEffect)(() => {
        if (!enabled || typeof window === 'undefined')
            return;
        window.addEventListener('keydown', handleKeyDown, true);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [enabled, handleKeyDown]);
}
exports.useBarcodeScannerWedge = useBarcodeScannerWedge;
