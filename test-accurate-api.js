
import crypto from 'crypto';

const API_TOKEN = process.env.ACCURATE_API_TOKEN || '';
const SIGNATURE_SECRET = process.env.ACCURATE_SIGNATURE_SECRET || '';
const API_BASE_URL = 'https://zeus.accurate.id/accurate/api';

function getAccurateTimestamp() {
  const options = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('id-ID', options);
  const parts = formatter.formatToParts(new Date());
  const getPart = (type) => parts.find(p => p.type === type)?.value || '00';
  return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
}

function generateSignature(timestamp) {
  const hmac = crypto.createHmac('sha256', SIGNATURE_SECRET);
  hmac.update(timestamp, 'utf8');
  return hmac.digest('base64');
}

async function fetchAccurateAPI(endpoint) {
  const timestamp = getAccurateTimestamp();
  const signature = generateSignature(timestamp);
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'X-Api-Timestamp': timestamp,
      'X-Api-Signature': signature,
      'Accept': 'application/json'
    }
  });
  return response.json();
}

async function main() {
  try {
    // Get list of items
    console.log("Fetching items list...");
    const items = await fetchAccurateAPI('/item/list.do');
    console.log("Items List Data:");
    if (items.d && items.d.length > 0) {
      console.log(items.d[0]); // Print first item
      
      const firstItemId = items.d[0].id;
      console.log(`\nFetching detail for item id: ${firstItemId}`);
      const detail = await fetchAccurateAPI(`/item/detail.do?id=${firstItemId}`);
      console.log("Item Detail Data:");
      console.log(JSON.stringify(detail, null, 2));
    } else {
      console.log(items);
    }
  } catch (err) {
    console.error(err);
  }
}

main();
