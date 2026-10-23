import { NextRequest, NextResponse } from "next/server";
import net from "net";

export const runtime = "nodejs";

interface ProbeResult {
  address: string;
  port: number;
  isReachable: boolean;
  name: string;
  manufacturer?: string;
  model?: string;
  latencyMs?: number;
}

/**
 * Test a TCP connection to host:port with bounded timeout
 */
function probeSocket(host: string, port: number, timeoutMs: number = 2000): Promise<{ reachable: boolean; latencyMs: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    let resolved = false;
    const finalize = (reachable: boolean, error?: string) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        reachable,
        latencyMs: Date.now() - startTime,
        error,
      });
    };

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      finalize(true);
    });

    socket.on("timeout", () => {
      finalize(false, "Connection timed out");
    });

    socket.on("error", (err) => {
      finalize(false, err.message);
    });

    try {
      socket.connect(port, host);
    } catch (err: any) {
      finalize(false, err.message);
    }
  });
}

/**
 * GET /api/devices/discover
 * Discovery capabilities, supported protocols, standard ports
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    supportedProtocols: [
      { type: "NETWORK_RAW", defaultPort: 9100, description: "Raw ESC/POS TCP Socket (Epson, Star, Xprinter, Bixolon)" },
      { type: "IPP", defaultPort: 631, description: "Internet Printing Protocol (HP, Canon, Brother, CUPS)" },
      { type: "LPR", defaultPort: 515, description: "Line Printer Remote Protocol" },
    ],
    defaultTimeoutMs: 2500,
    maxSubnetScanHosts: 16,
  });
}

/**
 * POST /api/devices/discover
 * Active validation and network device probing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, host, port = 9100, subnet, timeoutMs = 2500, paperWidth = "80mm" } = body;

    // 1. Validate Single Host / IP
    if (action === "VALIDATE_IP_PRINTER") {
      if (!host) {
        return NextResponse.json({ success: false, error: "Host address is required" }, { status: 400 });
      }

      const cleanHost = host.trim();
      const targetPort = Number(port) || 9100;
      const result = await probeSocket(cleanHost, targetPort, Math.min(Number(timeoutMs) || 2000, 4000));

      return NextResponse.json({
        success: true,
        host: cleanHost,
        port: targetPort,
        isReachable: result.reachable,
        latencyMs: result.latencyMs,
        error: result.reachable ? undefined : result.error,
      });
    }

    // 2. Active Probe on Subnet / Common Local Addresses
    if (action === "PROBE_NETWORK_DEVICES") {
      const candidates: Array<{ ip: string; port: number; name: string }> = [];

      // If user specified an IP prefix or subnet base, e.g. "192.168.1."
      const base = subnet ? subnet.replace(/\.\d*$/, "") : "192.168.1";
      // Scan bounded set of common POS thermal printer static IP assignments
      const commonEndings = [100, 101, 102, 103, 104, 105, 110, 150, 200, 201, 254, 87, 88];

      for (const end of commonEndings) {
        candidates.push({
          ip: `${base}.${end}`,
          port: 9100,
          name: `Thermal Printer (${base}.${end})`,
        });
      }

      // Probe concurrently with small timeout
      const probePromises = candidates.map(async (c) => {
        const probe = await probeSocket(c.ip, c.port, 1200);
        if (probe.reachable) {
          return {
            address: c.ip,
            port: c.port,
            isReachable: true,
            name: c.name,
            manufacturer: "ESC/POS Network Printer",
            model: "TCP/IP Port 9100",
            latencyMs: probe.latencyMs,
          } as ProbeResult;
        }
        return null;
      });

      const results = await Promise.all(probePromises);
      const activeDevices = results.filter((r): r is ProbeResult => r !== null);

      return NextResponse.json({
        success: true,
        devices: activeDevices,
        scannedCount: candidates.length,
      });
    }

    // 3. Raw Socket Test Print
    if (action === "TEST_PRINT_RAW_SOCKET") {
      if (!host) {
        return NextResponse.json({ success: false, error: "Host address is required" }, { status: 400 });
      }

      const cleanHost = host.trim();
      const targetPort = Number(port) || 9100;

      // Construct standard ESC/POS binary slip
      // ESC @ (Init)
      // ESC a 1 (Center)
      // Double strike bold, text, line feeds, cut
      const bufferList: Buffer[] = [
        Buffer.from([0x1b, 0x40]), // Initialize printer
        Buffer.from([0x1b, 0x61, 0x01]), // Align Center
        Buffer.from([0x1b, 0x45, 0x01]), // Bold ON
        Buffer.from("SALESMANPRO UNIFIED HARDWARE\n", "ascii"),
        Buffer.from([0x1b, 0x45, 0x00]), // Bold OFF
        Buffer.from("Intelligent Device Discovery Test\n", "ascii"),
        Buffer.from("--------------------------------\n", "ascii"),
        Buffer.from(`IP Address: ${cleanHost}:${targetPort}\n`, "ascii"),
        Buffer.from(`Paper Size: ${paperWidth}\n`, "ascii"),
        Buffer.from(`Date & Time: ${new Date().toLocaleString()}\n`, "ascii"),
        Buffer.from("Status: HARDWARE VERIFIED ONLINE\n", "ascii"),
        Buffer.from("--------------------------------\n\n", "ascii"),
        Buffer.from([0x1b, 0x61, 0x01]),
        Buffer.from("*** TEST PRINT SUCCESSFUL ***\n\n\n\n", "ascii"),
        Buffer.from([0x1d, 0x56, 0x41, 0x00]), // GS V 65 0 (Full cut with feed)
      ];

      const payloadBuffer = Buffer.concat(bufferList);

      const printResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);

        socket.connect(targetPort, cleanHost, () => {
          socket.write(payloadBuffer, () => {
            socket.end(() => resolve({ success: true }));
          });
        });

        socket.on("timeout", () => {
          socket.destroy();
          resolve({ success: false, error: `Socket timeout communicating with ${cleanHost}:${targetPort}` });
        });

        socket.on("error", (err) => {
          socket.destroy();
          resolve({ success: false, error: err.message });
        });
      });

      return NextResponse.json({
        success: printResult.success,
        error: printResult.error,
        message: printResult.success ? `Test slip printed successfully on ${cleanHost}:${targetPort}` : undefined,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid discovery action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API devices/discover Error]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal discovery error" }, { status: 500 });
  }
}
