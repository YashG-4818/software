import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function POST(request: Request) {
  try {
    const input = await request.json() as { pnr?: string; passengerName?: string; phone?: string; email?: string; vehicleId?: string; route?: string; seats?: string; amount?: number; paymentReference?: string };
    if (!input.pnr || !input.passengerName || !input.vehicleId || !input.route || !input.seats || !input.amount || !input.paymentReference) {
      return NextResponse.json({ error: 'Incomplete payment request.' }, { status: 400 });
    }
    const bookingReference = `PENDING-${Date.now().toString(36).toUpperCase()}`;
    const verification = await prisma.paymentVerification.create({
      data: {
        pnr: input.pnr,
        paymentReference: input.paymentReference,
        utr: null,
        bookingReference,
        passengerName: input.passengerName,
        phone: input.phone,
        email: input.email || null,
        vehicleId: input.vehicleId,
        route: input.route,
        seats: input.seats,
        amount: input.amount,
        status: 'PAYMENT_PENDING_MANUAL_REVIEW',
        method: 'PERSONAL_UPI_QR',
      },
    });
    return NextResponse.json({ bookingReference: verification.bookingReference, status: verification.status }, { status: 202 });
  } catch (error) {
    console.error('Personal UPI payment request failed', error);
    return NextResponse.json({ error: 'Unable to submit the payment request.' }, { status: 500 });
  }
}