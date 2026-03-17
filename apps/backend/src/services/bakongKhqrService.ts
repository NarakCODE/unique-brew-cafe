import { BakongKHQR, MerchantInfo, khqrData } from 'bakong-khqr';
import QRCode from 'qrcode';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const TOKEN_BUFFER_MS = 60 * 1000;
const KHQR_EXPIRY_MS = 15 * 60 * 1000;

type BakongTokenResponse = {
  responseCode?: number;
  errorCode?: number;
  data?: {
    token?: string;
  };
};

type BakongTransactionCheckResponse = {
  responseCode?: number;
  errorCode?: number;
  data?: unknown;
};

type KhqrGenerationInput = {
  amount: number;
  billNumber: string;
  storeLabel: string;
};

type KhqrGenerationResult = {
  qrPayload: string;
  qrImageDataUrl: string;
  md5: string;
  expiresAt: Date;
};

type BakongTransactionStatus = {
  isPaid: boolean;
  transactionId?: string;
  raw: unknown;
};

class BakongKhqrService {
  private cachedToken: string | null = null;
  private cachedTokenExpiresAt = 0;

  isConfigured() {
    return Boolean(
      config.bakongApiEmail &&
        config.bakongMerchantAccountId &&
        config.bakongMerchantName &&
        config.bakongMerchantId &&
        config.bakongAcquiringBank
    );
  }

  async generateMerchantKhqr({
    amount,
    billNumber,
    storeLabel,
  }: KhqrGenerationInput): Promise<KhqrGenerationResult> {
    if (!this.isConfigured()) {
      throw new AppError(
        'Bakong KHQR is not configured on the server',
        503
      );
    }

    const expiresAt = new Date(Date.now() + KHQR_EXPIRY_MS);
    const khqr = new BakongKHQR();
    const merchantInfo = new MerchantInfo(
      config.bakongMerchantAccountId,
      config.bakongMerchantName,
      config.bakongMerchantCity,
      config.bakongMerchantId,
      config.bakongAcquiringBank,
      {
        amount: Number(amount.toFixed(2)),
        currency: khqrData.currency.usd,
        billNumber,
        storeLabel,
        expirationTimestamp: Math.floor(expiresAt.getTime() / 1000),
      }
    );

    const result = khqr.generateMerchant(merchantInfo);
    const qrPayload = result.data?.qr?.trim();
    const md5 = result.data?.md5?.trim();

    if (!qrPayload || !md5) {
      throw new AppError('Unable to generate Bakong KHQR payload', 502);
    }

    const qrImageDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 800,
    });

    return {
      qrPayload,
      qrImageDataUrl,
      md5,
      expiresAt,
    };
  }

  async checkTransactionByMd5(md5: string): Promise<BakongTransactionStatus> {
    if (!this.isConfigured()) {
      throw new AppError(
        'Bakong KHQR is not configured on the server',
        503
      );
    }

    const token = await this.getAccessToken();
    const response = await fetch(
      `${config.bakongApiBaseUrl}/v1/check_transaction_by_md5`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ md5 }),
      }
    );

    if (!response.ok) {
      throw new AppError(
        `Bakong transaction check failed with status ${response.status}`,
        502
      );
    }

    const payload =
      (await response.json()) as BakongTransactionCheckResponse | unknown;
    const raw = payload as BakongTransactionCheckResponse;
    const data = this.extractObject(raw.data);
    const transactionId =
      this.pickString(data, [
        'transactionId',
        'transaction_id',
        'hash',
        'externalRef',
        'external_ref',
      ]) ?? md5;

    return {
      isPaid: this.readPaidState(data),
      transactionId,
      raw: payload,
    };
  }

  private async getAccessToken(): Promise<string> {
    if (
      this.cachedToken &&
      this.cachedTokenExpiresAt > Date.now() + TOKEN_BUFFER_MS
    ) {
      return this.cachedToken;
    }

    const response = await fetch(`${config.bakongApiBaseUrl}/v1/renew_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: config.bakongApiEmail }),
    });

    if (!response.ok) {
      throw new AppError(
        `Bakong token renewal failed with status ${response.status}`,
        502
      );
    }

    const payload = (await response.json()) as BakongTokenResponse;
    const token = payload.data?.token?.trim();

    if (!token) {
      throw new AppError('Bakong token renewal did not return a token', 502);
    }

    this.cachedToken = token;
    this.cachedTokenExpiresAt = Date.now() + 50 * 60 * 1000;

    return token;
  }

  private readPaidState(data: Record<string, unknown> | null) {
    if (!data) {
      return false;
    }

    const boolValue =
      this.pickBoolean(data, ['success', 'paid', 'isPaid', 'is_paid']) ??
      false;
    if (boolValue) {
      return true;
    }

    const status = this
      .pickString(data, ['status', 'transactionStatus', 'transaction_status'])
      ?.toLowerCase();

    return status === 'success' || status === 'paid' || status === 'completed';
  }

  private extractObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private pickString(
    source: Record<string, unknown> | null,
    keys: string[]
  ): string | undefined {
    if (!source) {
      return undefined;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    return undefined;
  }

  private pickBoolean(
    source: Record<string, unknown> | null,
    keys: string[]
  ): boolean | undefined {
    if (!source) {
      return undefined;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') {
        return value;
      }
    }

    return undefined;
  }
}

export const bakongKhqrService = new BakongKhqrService();
