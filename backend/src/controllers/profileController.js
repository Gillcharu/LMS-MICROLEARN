import { User } from '../models/index.js';

export async function updateProfile(req, res) {
  const { name, bio, avatarUrl } = req.body;
  await req.user.update({
    name: name ?? req.user.name,
    bio: bio ?? req.user.bio,
    avatarUrl: avatarUrl ?? req.user.avatarUrl
  });

  const user = await User.findByPk(req.user.id);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, bio: user.bio, avatarUrl: user.avatarUrl });
}
