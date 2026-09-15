import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';

const orderSchema = z.object({
  amount: z.number().int().positive(),
  receipt: z.string().trim().min(6).max(40),
  notes: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local.' }, { status: 503 });

  try {
    const input = orderSchema.parse(await request.json());
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await (razorpay.orders.create({ amount: input.amount, currency: 'INR', receipt: input.receipt, notes: input.notes }) as unknown as Promise<{ id: string; amount: number; currency: string }>);
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid order details.' }, { status: 400 });
    console.error('Razorpay order creation failed', error);
    return NextResponse.json({ error: 'Unable to create the Razorpay order.' }, { status: 502 });
  }
}
