/**
 * Card tokenization.
 *
 * IMPORTANT: For PCI compliance the raw PAN and CVV must NEVER leave the
 * device unencrypted, nor be persisted client-side. In production, replace
 * `tokenizeCard` with a call to your payment processor's SDK (Stripe.js
 * createToken, Bakong tokenizer, etc.) which returns a single-use token.
 *
 * This local implementation returns a deterministic fake token suitable for
 * development against Apartement_Service. The CVV is never returned or
 * persisted — it is consumed and discarded immediately.
 */

import * as Crypto from 'expo-crypto';

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'jcb'
  | 'unionpay'
  | 'unknown';

export interface CardTokenization {
  token: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  fingerprint: string;
}

export interface RawCardInput {
  number: string;
  cvv: string;
  expMonth: number;
  expYear: number;
  holderName: string;
}

export const detectBrand = (cardNumber: string): CardBrand => {
  const d = cardNumber.replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^6(011|5)/.test(d)) return 'discover';
  if (/^35/.test(d)) return 'jcb';
  if (/^62/.test(d)) return 'unionpay';
  return 'unknown';
};

export const luhnValid = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '').split('').reverse().map(Number);
  if (digits.length < 12) return false;
  const sum = digits.reduce((acc, n, i) => {
    if (i % 2 === 1) {
      const doubled = n * 2;
      return acc + (doubled > 9 ? doubled - 9 : doubled);
    }
    return acc + n;
  }, 0);
  return sum % 10 === 0;
};

const sha256Hex = async (input: string): Promise<string> => {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
};

export const tokenizeCard = async (
  raw: RawCardInput
): Promise<CardTokenization> => {
  const number = raw.number.replace(/\D/g, '');
  if (!luhnValid(number)) {
    throw new Error('Invalid card number');
  }
  if (!/^\d{3,4}$/.test(raw.cvv)) {
    throw new Error('Invalid CVV');
  }
  if (raw.expMonth < 1 || raw.expMonth > 12) {
    throw new Error('Invalid expiry month');
  }

  // Fingerprint of the PAN (not the CVV) — lets the backend dedupe cards
  // without ever seeing the raw number. In production this is the processor's
  // fingerprint, not a client-computed hash.
  const fingerprint = (await sha256Hex(number)).slice(0, 32);

  // Single-use opaque token. In production this is whatever the processor returns.
  const nonce = (
    await sha256Hex(`${number}|${raw.cvv}|${raw.expMonth}|${raw.expYear}|${Date.now()}`)
  ).slice(0, 40);
  const token = `tok_dev_${nonce}`;

  // Explicitly discard CVV reference
  raw.cvv = '';

  return {
    token,
    brand: detectBrand(number),
    last4: number.slice(-4),
    expMonth: raw.expMonth,
    expYear: raw.expYear,
    fingerprint,
  };
};
