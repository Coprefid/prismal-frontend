export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: NextRequest) {
  try {
    const { html, filename } = (await req.json()) as { html?: string; filename?: string };
    if (!html || typeof html !== 'string') {
      return new Response('Missing html', { status: 400 });
    }

    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      preferCSSPageSize: true,
    });

    await browser.close();

    const name = (filename && String(filename).trim()) || 'document';
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('PDF generation error', e);
    return new Response('PDF generation error', { status: 500 });
  }
}
