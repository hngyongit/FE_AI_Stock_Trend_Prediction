import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';

import { createApiClient } from '@/shared/services/api.service';

type CreatePaymentResponse = {
  success?: boolean;
  message?: string;
  data?: {
    amount?: number;
    checkoutUrl?: string;
    orderCode?: number;
    paymentLinkId?: string;
  };
};

export class SubscriptionRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'SubscriptionRequestError';
  }
}

export async function createSubscriptionPayment(accessToken: string) {
  try {
    const apiClient = createApiClient();
    const response = await apiClient.post(
      '/api/subscriptions/create-payment',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = response.data as CreatePaymentResponse;
    const checkoutUrl = payload.data?.checkoutUrl;

    if (
      response.status < 200 ||
      response.status >= 300 ||
      payload.success === false ||
      !checkoutUrl
    ) {
      throw new SubscriptionRequestError(
        payload.message || 'Unable to start the upgrade flow right now.',
        response.status,
      );
    }

    return {
      amount: payload.data?.amount,
      checkoutUrl,
      orderCode: payload.data?.orderCode,
      paymentLinkId: payload.data?.paymentLinkId,
    };
  } catch (error) {
    if (error instanceof SubscriptionRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new SubscriptionRequestError(
          'Unable to reach the payment service. Check your connection and try again.',
        );
      }

      const message =
        (error.response.data as { message?: string } | undefined)?.message ||
        'Unable to start the upgrade flow right now.';

      throw new SubscriptionRequestError(message, error.response.status);
    }

    throw new SubscriptionRequestError('Unable to start the upgrade flow right now.');
  }
}

export async function openSubscriptionCheckout(checkoutUrl: string) {
  return WebBrowser.openBrowserAsync(checkoutUrl, {
    controlsColor: '#3B82F6',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  });
}
