import { GroupMembership, GroupPost, StudyGroup, User } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function listGroups(req, res) {
  const groups = await StudyGroup.findAll({
    where: { isPublic: true },
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      { model: User, as: 'members', attributes: ['id'], through: { attributes: [] } }
    ],
    order: [['createdAt', 'DESC']]
  });

  const mapped = groups.map((g) => ({
    ...g.toJSON(),
    memberCount: g.members?.length || 0
  }));

  res.json(mapped);
}

export async function getGroup(req, res, next) {
  const group = await StudyGroup.findByPk(req.params.groupId, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'role'], through: { attributes: [] } },
      { model: GroupPost, as: 'posts', include: [{ model: User, attributes: ['id', 'name'] }], limit: 50, order: [['createdAt', 'DESC']] }
    ]
  });
  if (!group) return next(httpError(404, 'Study group not found'));
  res.json(group);
}

export async function createGroup(req, res, next) {
  const { name, topic, description, coverImage } = req.body;
  if (!name || !topic) return next(httpError(400, 'Group name and topic are required'));

  const group = await StudyGroup.create({
    name,
    topic,
    description,
    coverImage,
    creatorId: req.user.id,
    isPublic: true
  });

  await GroupMembership.create({ groupId: group.id, userId: req.user.id, role: 'owner' });
  res.status(201).json(group);
}

export async function joinGroup(req, res, next) {
  const group = await StudyGroup.findByPk(req.params.groupId);
  if (!group) return next(httpError(404, 'Study group not found'));

  await GroupMembership.findOrCreate({
    where: { groupId: group.id, userId: req.user.id },
    defaults: { role: 'member' }
  });
  res.json({ message: 'Joined group' });
}

export async function createPost(req, res, next) {
  const group = await StudyGroup.findByPk(req.params.groupId);
  if (!group) return next(httpError(404, 'Study group not found'));

  const membership = await GroupMembership.findOne({ where: { groupId: group.id, userId: req.user.id } });
  if (!membership) return next(httpError(403, 'Join group before posting'));

  const { content, imageUrl } = req.body;
  if (!content) return next(httpError(400, 'Post content is required'));

  const post = await GroupPost.create({
    groupId: group.id,
    userId: req.user.id,
    content,
    imageUrl
  });

  const row = await GroupPost.findByPk(post.id, { include: [{ model: User, attributes: ['id', 'name'] }] });
  res.status(201).json(row);
}
