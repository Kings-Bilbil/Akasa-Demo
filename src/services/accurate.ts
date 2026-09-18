import crypto from 'crypto';

/**
 * Accurate API Service Helper
 * Menangani generasi Signature HMAC-SHA256 sesuai standar Accurate Online
 */

const API_TOKEN = process.env.ACCURATE_API_TOKEN || '';
const SIGNATURE_SECRET = process.env.ACCURATE_SIGNATURE_SECRET || '';
const API_BASE_URL = 'https://zeus.accurate.id/accurate/api';

/**
 * Mendapatkan timestamp dengan format dd/mm/yyyy hh:mm:ss
 */
function getAccurateTimestamp(): string {
  const now = new Date();
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yyyy = now.getFullYear();
  
  const hh = pad(now.getHours());
  const mn = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  
  return `${dd}/${mm}/${yyyy} ${hh}:${mn}:${ss}`;
}

/**
 * Generate HMAC-SHA256 Signature Base64
 */
function generateSignature(timestamp: string): string {
  if (!SIGNATURE_SECRET) {
    console.warn("Peringatan: ACCURATE_SIGNATURE_SECRET belum diatur di environment.");
  }
  const hmac = crypto.createHmac('sha256', SIGNATURE_SECRET);
  hmac.update(timestamp, 'utf8');
  return hmac.digest('base64');
}

/**
 * Fungsi utama untuk memanggil API Accurate
 * @param endpoint Endpoint path (contoh: '/item/list.do')
 * @param method HTTP Method (GET atau POST)
 * @param body Data untuk request POST
 */
export async function fetchAccurateAPI(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  const timestamp = getAccurateTimestamp();
  const signature = generateSignature(timestamp);
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'X-Api-Timestamp': timestamp,
    'X-Api-Signature': signature,
    'Accept': 'application/json'
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[Accurate API] Memanggil ${method} ${url}`);

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok || !data.s) {
      console.error(`[Accurate API Error]`, data);
      throw new Error(data?.d?.[0] || 'Gagal memanggil API Accurate');
    }
    
    return data;
  } catch (error) {
    console.error(`[Accurate API Exception]`, error);
    throw error;
  }
}
