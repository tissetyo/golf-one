/**
 * Xendit API Client
 * 
 * Client for interacting with Xendit payment gateway.
 * Handles invoice creation, status checks, and webhook verification.
 */

import Xendit from 'xendit-node';

// Initialize Xendit client
const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
});

// Get Invoice module
const { Invoice } = xenditClient;

/**
 * Invoice creation parameters
 */
export interface CreateInvoiceParams {
    externalId: string;
    amount: number;
    payerEmail: string;
    description: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    currency?: string;
    invoiceDuration?: number;
    customerName?: string;
    customerPhone?: string;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
        category?: string;
    }>;
}

/**
 * Invoice response from Xendit
 */
export interface XenditInvoice {
    id: string;
    external_id: string;
    user_id: string;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED';
    merchant_name: string;
    amount: number;
    payer_email: string;
    description: string;
    invoice_url: string;
    expiry_date: string;
    created: string;
    updated: string;
    paid_at?: string;
    payment_method?: string;
    payment_channel?: string;
}

/**
 * Create a new invoice for payment
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<XenditInvoice> {
    try {
        const invoice = await Invoice.createInvoice({
            data: {
                externalId: params.externalId,
                amount: params.amount,
                payerEmail: params.payerEmail,
                description: params.description,
                successRedirectUrl: params.successRedirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/booking/success`,
                failureRedirectUrl: params.failureRedirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/booking/failed`,
                currency: params.currency || 'IDR',
                invoiceDuration: params.invoiceDuration || 86400, // 24 hours default
                customer: {
                    givenNames: params.customerName,
                    email: params.payerEmail,
                    mobileNumber: params.customerPhone,
                },
                items: params.items as any,
                paymentMethods: ['CREDIT_CARD', 'BCA', 'BNI', 'BSI', 'BRI', 'MANDIRI', 'PERMATA', 'ALFAMART', 'INDOMARET', 'OVO', 'DANA', 'SHOPEEPAY', 'LINKAJA', 'JENIUSPAY', 'QRIS'],
            }
        });

        return invoice as unknown as XenditInvoice;
    } catch (error) {
        console.error('Xendit createInvoice error:', error);
        throw error;
    }
}

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<XenditInvoice> {
    try {
        const invoice = await Invoice.getInvoiceById({ invoiceId });
        return invoice as unknown as XenditInvoice;
    } catch (error) {
        console.error('Xendit getInvoice error:', error);
        throw error;
    }
}

/**
 * Expire an invoice manually
 */
export async function expireInvoice(invoiceId: string): Promise<XenditInvoice> {
    try {
        const invoice = await Invoice.expireInvoice({ invoiceId });
        return invoice as unknown as XenditInvoice;
    } catch (error) {
        console.error('Xendit expireInvoice error:', error);
        throw error;
    }
}

/**
 * Verify webhook callback token
 */
export function verifyWebhookToken(token: string): boolean {
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (!expectedToken) {
        console.warn('XENDIT_WEBHOOK_TOKEN not configured');
        return false;
    }
    return token === expectedToken;
}

/**
 * Parse webhook payload
 */
export interface WebhookPayload {
    id: string;
    external_id: string;
    user_id: string;
    is_high: boolean;
    status: 'PAID' | 'EXPIRED';
    merchant_name: string;
    amount: number;
    paid_amount?: number;
    payer_email: string;
    description: string;
    paid_at?: string;
    payment_method?: string;
    payment_channel?: string;
    payment_destination?: string;
    created: string;
    updated: string;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}
