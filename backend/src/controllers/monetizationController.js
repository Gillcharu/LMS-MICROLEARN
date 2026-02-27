import { CreatorOffering, Purchase, User } from '../models/index.js';
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
