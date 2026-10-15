import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const input = await request.json() as {
      pnr?: string;
      passengerName?: string;
      phone?: string;
      email?: string;
      vehicleId?: string;
      route?: string;
      seats?: string;
      amount?: number;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
    if (!input.pnr || !input.passengerName || !input.vehicleId || !input.route || !input.seats || !input.amount || !input.razorpay_order_id || !input.razorpay_payment_id || !input.razorpay_signature) {
      return NextResponse.json({ error: 'Incomplete payment request.' }, { status: 400 });
    }
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest('hex');
    if (!/^[a-f\d]{64}$/i.test(input.razorpay_signature) || !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(input.razorpay_signature))) {
      return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
    }

    const amountInPaise = Math.round(input.amount * 100);
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.fetch(input.razorpay_order_id);
    if (order.receipt !== input.pnr || order.amount !== amountInPaise || order.currency !== 'INR') {
      return NextResponse.json({ error: 'Payment does not match this booking.' }, { status: 400 });
    }
    let payment = await razorpay.payments.fetch(input.razorpay_payment_id);
    if (payment.order_id !== input.razorpay_order_id || payment.amount !== amountInPaise || payment.currency !== 'INR') {
      return NextResponse.json({ error: 'Payment does not match this booking.' }, { status: 400 });
    }
    if (payment.status === 'authorized') payment = await razorpay.payments.capture(input.razorpay_payment_id, amountInPaise, 'INR');
    if (payment.status !== 'captured') return NextResponse.json({ error: 'Payment has not been captured.' }, { status: 402 });

    const bookingReference = `BOOK-${input.pnr}`;
    const verification = await prisma.paymentVerification.create({
      data: {
        pnr: input.pnr,
        paymentReference: input.razorpay_payment_id,
        utr: null,
        bookingReference,
        passengerName: input.passengerName,
        phone: input.phone,
        email: input.email || null,
        vehicleId: input.vehicleId,
        route: input.route,
        seats: input.seats,
        amount: input.amount,
        status: 'PAYMENT_CONFIRMED',
        method: 'RAZORPAY',
      },
    });
    return NextResponse.json({ bookingReference: verification.bookingReference, status: verification.status });
  } catch (error) {
    console.error('Payment verification failed', error);
    return NextResponse.json({ error: 'Unable to verify the payment.' }, { status: 500 });
  }
}