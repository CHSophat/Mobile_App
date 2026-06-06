import { apiClient } from './apiClient';
import { endpoints } from './endpoints';
import { Payment, PaymentMethod, BakongQR, PaymentBreakdown } from '@types/payment.types';
import * as QRCode from 'qrcode';

export class PaymentService {
  public async getPayments(limit: number = 20, offset: number = 0): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(
      `${endpoints.payments.list}?limit=${limit}&offset=${offset}`
    );
    return response.data || [];
  }

  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<PaymentMethod[]>(
      endpoints.payments.methods
    );
    return response.data || [];
  }

  public async createPayment(paymentData: any): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      endpoints.payments.create,
      paymentData
    );
    return response.data!;
  }

  public async generateBakongQR(
    amount: number,
    transactionId: string,
    description?: string
  ): Promise<BakongQR> {
    try {
      const merchantId = process.env.EXPO_PUBLIC_BAKONG_MERCHANT_ID;

      // Bakong QR format: bakong:// prefix followed by merchant and transaction data
      const bakongData = {
        merchantId,
        amount: Math.round(amount * 100), // Convert to cents
        transactionId,
        description: description || 'Payment',
        currency: 'KHR',
      };

      // Generate QR code
      const qrCodeData = JSON.stringify(bakongData);
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

      // Generate Bakong deep link
      const deepLink = `bakong://pay/${merchantId}/${transactionId}/${Math.round(
        amount * 100
      )}`;

      return {
        merchantId: merchantId || '',
        amount,
        currency: 'KHR',
        transactionId,
        qrCodeData,
        qrCodeUrl,
        deepLink,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      };
    } catch (error) {
      throw new Error('Failed to generate Bakong QR code');
    }
  }

  public async verifyBakongPayment(transactionId: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `${endpoints.payments.confirm(transactionId)}`,
      {}
    );
    return response.data!;
  }

  public async getPaymentHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ payments: Payment[]; total: number }> {
    const response = await apiClient.get<{
      payments: Payment[];
      total: number;
    }>(`${endpoints.payments.history}?limit=${limit}&offset=${offset}`);
    return response.data || { payments: [], total: 0 };
  }

  public async getPaymentBreakdown(unitId: string): Promise<PaymentBreakdown> {
    const response = await apiClient.get<PaymentBreakdown>(
      `/units/${unitId}/payment-breakdown`
    );
    return (
      response.data || {
        rentAmount: 0,
        utilitiesAmount: 0,
        depositsAmount: 0,
        otherAmount: 0,
        totalAmount: 0,
        currency: 'KHR',
      }
    );
  }
}

export const paymentService = new PaymentService();
