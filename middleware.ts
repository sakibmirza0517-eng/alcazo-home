import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🛡️ SECURITY MIDDLEWARE: Har request ko protect karega
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Clickjacking Protection (Koi dusri site iframe mein teri site nahi chala sakti)
  response.headers.set('X-Frame-Options', 'DENY');

  // 2. MIME Sniffing Protection (Browser file type ko guess nahi karega, XSS attack se bachata hai)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 3. Referrer Policy (Privacy protect karta hai)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 4. Permissions Policy (Camera, Mic, Location ka unauthorized access rokta hai)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 5. XSS Protection (Purane browsers ke liye Cross-Site Scripting protection)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// Ye middleware har route par apply hoga
export const config = {
  matcher: '/:path*',
};