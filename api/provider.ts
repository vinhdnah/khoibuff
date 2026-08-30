/**
 * Vercel Serverless Function: /api/provider
 *
 * Proxy an toan cho SMM Provider API.
 * - API key duoc doc tu env SERVER-SIDE (khong co tien to VITE_)
 * - Frontend chi gui cac tham so action, khong can biet key
 * - Ngan CORS va ngan lo key trong JS bundle
 *
 * Env vars can set tren Vercel Dashboard (KHONG phai .env):
 *   SMM_PROVIDER_API_URL  = https://tangliketym.click/api/v2
 *   SMM_PROVIDER_API_KEY  = <your_api_key>
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiUrl =
    process.env.SMM_PROVIDER_API_URL || 'https://tangliketym.click/api/v2';
  const apiKey = process.env.SMM_PROVIDER_API_KEY;

  if (!apiKey) {
    console.error('[provider-proxy] SMM_PROVIDER_API_KEY is not set');
    return res.status(500).json({ error: 'Provider not configured on server' });
  }

  const params: Record<string, any> = req.body || {};

  const formData = new URLSearchParams();
  formData.append('key', apiKey);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && k !== 'key') {
      formData.append(k, String(v));
    }
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `Provider returned HTTP ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[provider-proxy] fetch error:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal proxy error' });
  }
}
