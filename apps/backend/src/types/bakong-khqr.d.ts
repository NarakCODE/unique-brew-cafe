declare module 'bakong-khqr' {
  export const khqrData: {
    currency: {
      khr: number;
      usd: number;
    };
  };

  export class MerchantInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      merchantID: string,
      acquiringBank: string,
      optional?: {
        amount?: number;
        currency?: number;
        billNumber?: string;
        storeLabel?: string;
        terminalLabel?: string;
        mobileNumber?: string;
        purposeOfTransaction?: string;
        expirationTimestamp?: number;
      }
    );
  }

  export class BakongKHQR {
    generateMerchant(merchantInfo: MerchantInfo): {
      status?: unknown;
      data?: {
        qr: string;
        md5: string;
      };
      errorCode?: unknown;
    };
  }
}
