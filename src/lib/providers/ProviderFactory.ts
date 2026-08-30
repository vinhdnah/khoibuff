import { SmmProvider } from './types';
import { MockSmmProvider } from './MockSmmProvider';
import { SiteSocialProvider } from '../../services/provider/site-social';

class ProviderFactoryClass {
  private currentProvider: SmmProvider | null = null;

  getProvider(): SmmProvider {
    if (this.currentProvider) {
      return this.currentProvider;
    }

    const isMock = import.meta.env?.VITE_MOCK_PROVIDER === 'true';
    const apiUrl = import.meta.env?.VITE_SMM_PROVIDER_API_URL || 'https://domain.com/api';
    const apiKey = import.meta.env?.VITE_SMM_PROVIDER_API_KEY || '';

    if (isMock || !apiKey) {
      this.currentProvider = new MockSmmProvider();
    } else {
      this.currentProvider = new SiteSocialProvider({
        apiUrl,
        token: apiKey,
      });
    }

    return this.currentProvider;
  }

  setProvider(provider: SmmProvider) {
    this.currentProvider = provider;
  }
}

export const ProviderFactory = new ProviderFactoryClass();
