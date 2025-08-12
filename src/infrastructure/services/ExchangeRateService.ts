// APIレスポンスの型定義
interface ExchangeRateResponse {
  result: 'success' | 'error';
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number; // 各国通貨コードとレート
  };
  'error-type'?: string;
}

export class ExchangeRateService {
  private static cache: {
    rates: Record<string, number>;
    timestamp: number;
  } | null = null;
  private static readonly CACHE_DURATION = 1000 * 60 * 30; // 30分

  /**
   * 為替レートを取得する（キャッシュ付き）
   */
  static async getExchangeRates(): Promise<Record<string, number>> {
    const now = Date.now();

    // キャッシュが有効な場合はキャッシュを返す
    if (this.cache && now - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.rates;
    }

    try {
      const rates = await this.fetchLatestRates();

      // キャッシュを更新
      this.cache = {
        rates,
        timestamp: now,
      };

      return rates;
    } catch (error) {
      console.warn(
        'Failed to fetch exchange rates, using fallback rates:',
        error
      );
      return this.getFallbackRates();
    }
  }

  /**
   * ExchangeRate-API.comから最新の為替レートを取得
   */
  private static async fetchLatestRates(): Promise<Record<string, number>> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return this.getFallbackRates();
    }

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/JPY`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();

      if (data.result === 'error') {
        throw new Error(`API error: ${data['error-type']}`);
      }

      // JPYを基準とした為替レートを計算
      const jpyRates: Record<string, number> = {
        JPY: 1,
      };

      // 他の通貨のJPYに対する為替レートを計算
      Object.entries(data.conversion_rates).forEach(([currency, rate]) => {
        jpyRates[currency] = 1 / rate;
      });

      return jpyRates;
    } catch (error) {
      console.error('為替レートの取得に失敗しました:', error);
      throw error;
    }
  }

  /**
   * フォールバック用の為替レート
   */
  private static getFallbackRates(): Record<string, number> {
    return {
      JPY: 1,
      USD: 150,
      EUR: 160,
      GBP: 190,
      CAD: 110,
      AUD: 100,
      CHF: 170,
      CNY: 21,
      KRW: 0.11,
      SGD: 110,
    };
  }

  /**
   * 特定の通貨を円に変換する
   */
  static async convertToJPY(amount: number, currency: string): Promise<number> {
    const rates = await this.getExchangeRates();
    return amount * (rates[currency] || 1);
  }

  /**
   * キャッシュをクリアする
   */
  static clearCache(): void {
    this.cache = null;
  }
}
