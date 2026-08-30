import { SmmProvider } from './types';
import { MockSmmProvider } from './MockSmmProvider';
import { StandardSmmProvider } from './StandardSmmProvider';
import { SiteSocialProvider } from '../../services/provider/site-social';

class ProviderFactoryClass {
  private currentProvider: SmmProvider | null = null;

  getProvider(): SmmProvider {
    if (this.currentProvider) {
      return this.currentProvider;
    }

    const isMock = import.meta.env?.VITE_MOCK_PROVIDER === 'true';

    // --- Bảo mật API Key ---
    // Production: gọi qua Vercel serverless proxy /api/provider
    //   → key lưu trong Vercel Dashboard env (SMM_PROVIDER_API_KEY), không bị expose vào JS bundle
    // Dev (import.meta.env.DEV): gọi thẳng với key từ .env để tiện test local
    const isDev = import.meta.env.DEV === true;
    const devApiUrl = import.meta.env?.VITE_SMM_PROVIDER_API_URL || 'https://tangliketym.click/api/v2';
    const devApiKey = import.meta.env?.VITE_SMM_PROVIDER_API_KEY || '';

    const apiUrl = isDev ? devApiUrl : '/api/provider';
    const apiKey = isDev ? devApiKey : 'proxy'; // key thực được inject server-side

    if (isMock || (!isDev && !apiUrl)) {
      this.currentProvider = new MockSmmProvider();
    } else if (
      !isDev || // production → luôn StandardSmmProvider qua proxy
      apiUrl.includes('/api/v2') ||
      apiUrl.includes('v2') ||
      apiUrl.includes('tangliketym')
    ) {
      this.currentProvider = new StandardSmmProvider({
        name: isDev ? 'TangLikeTym API v2 (Dev)' : 'TangLikeTym via Proxy',
        slug: 'tangliketym-v2',
        apiUrl,
        apiKey,
        useProxy: !isDev,
      });
    } else {
      this.currentProvider = new SiteSocialProvider({
        apiUrl,
        token: apiKey,
      });
    }

    return this.currentProvider;
  }

  /** Reset singleton — gọi khi admin đổi provider config */
  reset() {
    this.currentProvider = null;
  }

  setProvider(provider: SmmProvider) {
    this.currentProvider = provider;
  }
}

export const ProviderFactory = new ProviderFactoryClass();
