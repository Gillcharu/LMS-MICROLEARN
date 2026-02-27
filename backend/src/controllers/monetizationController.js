import crypto from 'crypto';
import { CreatorOffering, Purchase, User } from '../models/index.js';
import { env } from '../config/env.js';
import { createNotification } from '../services/notificationService.js';
import { httpError } from '../utils/httpError.js';

export async function createOffering(req, res, next) {
  const { title, description, priceCents, billingType = 'one_time' } = req.body;
  if (!title || !priceCents) return next(httpError(400, 'title and priceCents are required'));

  const row = await CreatorOffering.create({
    creatorId: req.user.id,
    title,
    description,
    priceCents,
    billingType,
    active: true
  });

  res.status(201).json(row);
}

export async function listMarketplace(req, res) {
  const rows = await CreatorOffering.findAll({
    where: { active: true },
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json(rows);
}

export async function purchaseOffering(req, res, next) {
  const offering = await CreatorOffering.findByPk(req.params.offeringId);
  if (!offering || !offering.active) return next(httpError(404, 'Offering not found'));

  const existing = await Purchase.findOne({
    where: { userId: req.user.id, offeringId: offering.id, status: 'paid' }
  });
  if (existing) {
    return res.json({ message: 'You already purchased this offering.', purchase: existing, alreadyOwned: true });
  }

  const row = await Purchase.create({
    userId: req.user.id,
    offeringId: offering.id,
    amountCents: offering.priceCents,
    status: 'paid'
  });

  res.status(201).json({ message: 'Purchase successful (simulation)', purchase: row });
}

function ensureStripeConfigured() {
  if (!env.stripeSecretKey) throw httpError(503, 'Stripe is not configured. Add STRIPE_SECRET_KEY in backend/.env');
}

async function stripeRequest(url, params) {
  const body = new URLSearchParams(params).toString();
  const response = await fetch(`https://api.stripe.com${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });
  const data = await response.json();
  if (!response.ok) {
    throw httpError(400, data?.error?.message || 'Stripe request failed');
  }
  return data;
}

export async function createCheckoutSession(req, res, next) {
  const offering = await CreatorOffering.findByPk(req.params.offeringId);
  if (!offering || !offering.active) return next(httpError(404, 'Offering not found'));

  const existing = await Purchase.findOne({
    where: { userId: req.user.id, offeringId: offering.id, status: 'paid' }
  });
  if (existing) return res.json({ alreadyOwned: true, message: 'Already purchased' });

  if (!env.stripeSecretKey) {
    return res.json({
      simulation: true,
      message: 'Stripe not configured. Falling back to simulated purchase.'
    });
  }

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${env.appBaseUrl}/sessions?purchase=success`);
  params.set('cancel_url', `${env.appBaseUrl}/sessions?purchase=cancelled`);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', 'usd');
  params.set('line_items[0][price_data][unit_amount]', String(offering.priceCents));
  params.set('line_items[0][price_data][product_data][name]', offering.title);
  params.set('line_items[0][price_data][product_data][description]', offering.description || 'MicroLearn premium content');
  params.set('metadata[userId]', String(req.user.id));
  params.set('metadata[offeringId]', String(offering.id));

  try {
    const session = await stripeRequest('/v1/checkout/sessions', params);
    res.status(201).json({ id: session.id, checkoutUrl: session.url });
  } catch (err) {
    return next(err);
  }
}

function verifyStripeSignature(payload, signatureHeader) {
  if (!env.stripeWebhookSecret || !signatureHeader) return false;
  const sigParts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [k, v] = part.split('=');
      return [k, v];
    })
  );
  const timestamp = sigParts.t;
  const expected = sigParts.v1;
  if (!timestamp || !expected) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const digest = crypto.createHmac('sha256', env.stripeWebhookSecret).update(signedPayload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function stripeWebhook(req, res, next) {
  const raw = req.rawBody || '';
  const signature = req.headers['stripe-signature'];
  if (!verifyStripeSignature(raw, signature)) return next(httpError(400, 'Invalid Stripe webhook signature'));

  const event = req.body || {};
  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object;
    const userId = Number(session?.metadata?.userId);
    const offeringId = Number(session?.metadata?.offeringId);
    if (userId && offeringId) {
      const offering = await CreatorOffering.findByPk(offeringId);
      if (offering) {
        await Purchase.findOrCreate({
          where: { userId, offeringId, status: 'paid' },
          defaults: { amountCents: offering.priceCents, status: 'paid' }
        });
        await createNotification({
          userId,
          type: 'payment',
          title: 'Payment successful',
          message: `Purchase completed for ${offering.title}.`
        });
      }
    }
  }
  res.json({ received: true });
}

export async function myPurchases(req, res) {
  const rows = await Purchase.findAll({
    where: { userId: req.user.id, status: 'paid' },
    include: [{ model: CreatorOffering, as: 'offering' }],
    order: [['createdAt', 'DESC']]
  });
  res.json(rows);
}

export async function creatorRevenue(req, res) {
  const offerings = await CreatorOffering.findAll({ where: { creatorId: req.user.id }, include: [{ model: Purchase, as: 'purchases' }] });
  let totalCents = 0;
  let purchases = 0;

  offerings.forEach((offering) => {
    (offering.purchases || []).forEach((p) => {
      if (p.status === 'paid') {
        totalCents += p.amountCents;
        purchases += 1;
      }
    });
  });

  res.json({ totalRevenueCents: totalCents, purchaseCount: purchases });
}
