import * as XLSX from 'xlsx';
import { getAllResponses } from '../../../lib/responseLog.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== process.env.EXPORT_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const responses = await getAllResponses();

  const rows = responses.map((r) => ({
    Timestamp: r.timestamp,
    Name: r.name,
    Phone: r.phone,
    'Order Number': r.orderNumber,
    Product: r.productName,
    Total: r.total,
    Response: r.response,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="whatsapp-order-responses.xlsx"`,
    },
  });
}