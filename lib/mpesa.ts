import axios from 'axios';

// Environment variables configuration with defaults for sandbox
const MONGODB_URI = process.env.MONGODB_URI;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const MPESA_MOCK_MODE = process.env.MPESA_MOCK_MODE === 'true' || !process.env.MPESA_CONSUMER_KEY;

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';

// Lipa Na M-Pesa Online Sandbox Shortcode and Passkey
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

// B2C Payout Shortcode Sandbox defaults
const MPESA_B2C_SHORTCODE = process.env.MPESA_B2C_SHORTCODE || '600999';
const MPESA_B2C_INITIATOR = process.env.MPESA_B2C_INITIATOR || 'testapi';
const MPESA_B2C_PASSWORD = process.env.MPESA_B2C_PASSWORD || 'Safaricom2016'; 

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || `${NEXTAUTH_URL}/api/payments/callback`;

// Daraja endpoints
const BASE_URLS = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

const DARAJA_BASE_URL = MPESA_ENV === 'production' ? BASE_URLS.production : BASE_URLS.sandbox;

/**
 * Normalizes phone numbers to Kenya format (2547XXXXXXXX or 2541XXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, ''); // remove non-digits
  
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  
  if (!/^254(7|1)\d{8}$/.test(cleaned)) {
    throw new Error(`Invalid M-Pesa phone number format: ${phone}. Must be a valid Kenyan mobile number.`);
  }
  
  return cleaned;
}

/**
 * M-Pesa client utility
 */
export class MpesaClient {
  /**
   * Check if mock mode is active
   */
  static isMockMode(): boolean {
    return MPESA_MOCK_MODE;
  }

  /**
   * Generates M-Pesa API Access Token
   */
  private static async getAccessToken(): Promise<string> {
    if (MPESA_MOCK_MODE) {
      return 'mock-access-token';
    }

    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
      throw new Error('M-Pesa Consumer Key or Secret is missing in environment variables');
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await axios.get(
        `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error: any) {
      console.error('Error generating M-Pesa access token:', error?.response?.data || error.message);
      throw new Error('Failed to authenticate with Safaricom Daraja API');
    }
  }

  /**
   * Initiates STK Push (Lipa Na M-Pesa Online)
   */
  static async initiateStkPush(params: {
    phoneNumber: string;
    amount: number;
    bookingId: string;
  }) {
    const { amount, bookingId } = params;
    const phone = normalizePhoneNumber(params.phoneNumber);
    
    // Format timestamp: YYYYMMDDHHMMSS
    const date = new Date();
    const timestamp = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');

    // Generate password: Base64(Shortcode + Passkey + Timestamp)
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    if (MPESA_MOCK_MODE) {
      const checkoutRequestID = 'ws_CO_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
      const merchantRequestID = 'mock_MR_' + Math.random().toString(36).substring(2, 10);
      
      console.log(`[M-PESA MOCK] Initiated STK Push for Booking: ${bookingId}, Phone: ${phone}, Amount: KES ${amount}`);
      console.log(`[M-PESA MOCK] CheckoutRequestID: ${checkoutRequestID}`);

      // Proactively simulate a successful transaction after 4 seconds
      setTimeout(async () => {
        try {
          const callbackUrl = `${NEXTAUTH_URL}/api/payments/callback`;
          console.log(`[M-PESA MOCK] Sending simulated success webhook to ${callbackUrl}...`);
          
          await axios.post(callbackUrl, {
            Body: {
              stkCallback: {
                MerchantRequestID: merchantRequestID,
                CheckoutRequestID: checkoutRequestID,
                ResultCode: 0,
                ResultDesc: 'The service request is processed successfully.',
                CallbackMetadata: {
                  Item: [
                    { Name: 'Amount', Value: amount },
                    { Name: 'MpesaReceiptNumber', Value: 'NLK' + Math.random().toString(36).substring(2, 9).toUpperCase() },
                    { Name: 'Balance', Value: 0 },
                    { Name: 'TransactionDate', Value: Date.now() },
                    { Name: 'PhoneNumber', Value: Number(phone) }
                  ]
                }
              }
            }
          });
          console.log(`[M-PESA MOCK] Simulated callback sent successfully for checkout: ${checkoutRequestID}`);
        } catch (simError: any) {
          console.error('[M-PESA MOCK ERROR] Failed to send simulated callback:', simError.message);
        }
      }, 4000);

      return {
        success: true,
        checkoutRequestID,
        customerMessage: 'Mock STK push initiated successfully. In 4 seconds, your payment will be simulated as successful.',
        mock: true,
      };
    }

    const token = await this.getAccessToken();

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // must be integer in KES
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `Booking-${bookingId.substring(18)}`,
      TransactionDesc: `Escrow Booking Payment`,
    };

    try {
      const response = await axios.post(
        `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        customerMessage: response.data.CustomerMessage || 'STK Push initiated successfully',
        mock: false,
      };
    } catch (error: any) {
      console.error('M-Pesa STK Push error:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data?.errorMessage || 'Failed to initiate M-Pesa STK Push',
      };
    }
  }

  /**
   * Initiates B2C Payout to Fundi
   */
  static async initiatePayout(params: {
    phoneNumber: string;
    amount: number;
    bookingId: string;
  }) {
    const { amount, bookingId } = params;
    const phone = normalizePhoneNumber(params.phoneNumber);

    if (MPESA_MOCK_MODE) {
      const receiptNumber = 'NLK' + Math.random().toString(36).substring(2, 9).toUpperCase();
      console.log(`[M-PESA MOCK] Initiating disbursement/payout of KES ${amount} to Fundi phone: ${phone}`);
      
      return {
        success: true,
        receipt: receiptNumber,
        message: 'Disbursement simulated successfully.',
        mock: true,
      };
    }

    // In a real sandbox/production app, we would make a B2C API request
    // Since B2C credentials require a security credential generated from standard public keys (which needs a PKI certificate),
    // we provide the implementation but fall back to a mock output if the keys are sandbox keys or if B2C credentials are empty.
    
    if (!process.env.MPESA_B2C_INITIATOR || process.env.MPESA_B2C_INITIATOR === 'testapi') {
      console.log('[M-PESA B2C] Sandbox mode, defaulting to simulated payout response for ease of testing.');
      const receiptNumber = 'B2C' + Math.random().toString(36).substring(2, 9).toUpperCase();
      return {
        success: true,
        receipt: receiptNumber,
        message: 'Sandbox Simulated Payout success.',
        mock: true,
      };
    }

    try {
      const token = await this.getAccessToken();
      
      const payload = {
        InitiatorName: MPESA_B2C_INITIATOR,
        SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL, // pre-encrypted credential
        CommandID: 'BusinessPayment',
        Amount: Math.round(amount),
        PartyA: MPESA_B2C_SHORTCODE,
        PartyB: phone,
        Remarks: `Escrow payout for booking ${bookingId}`,
        QueueTimeOutURL: `${NEXTAUTH_URL}/api/payments/payout-timeout`,
        ResultURL: `${NEXTAUTH_URL}/api/payments/payout-result`,
        Occasion: 'Escrow Release',
      };

      const response = await axios.post(
        `${DARAJA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // M-Pesa B2C is asynchronous; Safaricom responds with an acknowledgement, 
      // then hits ResultURL. In sandbox, we acknowledge success for now.
      return {
        success: true,
        conversationId: response.data.ConversationID,
        originatorConversationId: response.data.OriginatorConversationID,
        message: 'Disbursement request submitted to Safaricom',
        mock: false,
      };
    } catch (error: any) {
      console.error('M-Pesa B2C error:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data?.errorMessage || 'Failed to initiate M-Pesa B2C payout',
      };
    }
  }
}
