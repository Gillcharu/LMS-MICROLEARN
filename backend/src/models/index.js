import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('learner', 'creator', 'parent', 'admin'), defaultValue: 'learner' },
  bio: { type: DataTypes.TEXT },
  avatarUrl: { type: DataTypes.STRING },
  streakDays: { type: DataTypes.INTEGER, defaultValue: 0 },
  points: { type: DataTypes.INTEGER, defaultValue: 0 }
});

export const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
  contentType: { type: DataTypes.ENUM('text', 'video', 'mixed'), defaultValue: 'mixed' },
  contentBody: { type: DataTypes.TEXT },
  mediaUrl: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  published: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  indexes: [
    { fields: ['title'] },
    { fields: ['category'] },
    { fields: ['difficulty'] },
    { fields: ['creatorId'] }
  ]
});

export const QuizQuestion = sequelize.define('QuizQuestion', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  prompt: { type: DataTypes.TEXT, allowNull: false },
  optionA: { type: DataTypes.STRING, allowNull: false },
  optionB: { type: DataTypes.STRING, allowNull: false },
  optionC: { type: DataTypes.STRING, allowNull: false },
  optionD: { type: DataTypes.STRING, allowNull: false },
  correctOption: { type: DataTypes.ENUM('A', 'B', 'C', 'D'), allowNull: false },
  explanation: { type: DataTypes.TEXT }
});

export const LearningPath = sequelize.define('LearningPath', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  published: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export const PathLesson = sequelize.define('PathLesson', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pathId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  orderIndex: { type: DataTypes.INTEGER, allowNull: false }
});

export const Progress = sequelize.define('Progress', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('not_started', 'in_progress', 'completed'), defaultValue: 'not_started' },
  completionPercent: { type: DataTypes.INTEGER, defaultValue: 0 },
  quizScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  timeSpentSeconds: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastAccessedAt: { type: DataTypes.DATE }
});

export const PathEnrollment = sequelize.define('PathEnrollment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  pathId: { type: DataTypes.INTEGER, allowNull: false }
});

export const Badge = sequelize.define('Badge', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING }
});

export const UserBadge = sequelize.define('UserBadge', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  badgeId: { type: DataTypes.INTEGER, allowNull: false }
});

export const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false }
});

export const Like = sequelize.define('Like', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false }
});

export const Follow = sequelize.define('Follow', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  followerId: { type: DataTypes.INTEGER, allowNull: false },
  followingId: { type: DataTypes.INTEGER, allowNull: false }
});

export const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false }
});

export const StudyGroup = sequelize.define('StudyGroup', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  coverImage: { type: DataTypes.STRING },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const GroupMembership = sequelize.define('GroupMembership', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  groupId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('owner', 'member'), defaultValue: 'member' }
});

export const GroupPost = sequelize.define('GroupPost', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  groupId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  imageUrl: { type: DataTypes.STRING }
});

export const ParentChildLink = sequelize.define('ParentChildLink', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  parentId: { type: DataTypes.INTEGER, allowNull: false },
  childId: { type: DataTypes.INTEGER, allowNull: false }
});

export const AiHintLog = sequelize.define('AiHintLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  question: { type: DataTypes.TEXT, allowNull: false },
  hint: { type: DataTypes.TEXT, allowNull: false }
});

export const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export const LiveSession = sequelize.define('LiveSession', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  startsAt: { type: DataTypes.DATE, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
  meetingUrl: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER, defaultValue: 100 },
  status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'), defaultValue: 'scheduled' }
});

export const LiveSessionEnrollment = sequelize.define('LiveSessionEnrollment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sessionId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  attendanceStatus: { type: DataTypes.ENUM('enrolled', 'attended', 'missed'), defaultValue: 'enrolled' }
});

export const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  dueAt: { type: DataTypes.DATE },
  maxPoints: { type: DataTypes.INTEGER, defaultValue: 100 },
  published: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  assignmentId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  attachmentUrl: { type: DataTypes.STRING },
  score: { type: DataTypes.FLOAT },
  feedback: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('submitted', 'graded'), defaultValue: 'submitted' }
});

export const ParentAlertPreference = sequelize.define('ParentAlertPreference', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  parentId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  weeklyDigest: { type: DataTypes.BOOLEAN, defaultValue: true },
  inactivityAlert: { type: DataTypes.BOOLEAN, defaultValue: true },
  milestoneAlert: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const CreatorOffering = sequelize.define('CreatorOffering', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  priceCents: { type: DataTypes.INTEGER, allowNull: false },
  billingType: { type: DataTypes.ENUM('one_time', 'monthly'), defaultValue: 'one_time' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const Purchase = sequelize.define('Purchase', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  offeringId: { type: DataTypes.INTEGER, allowNull: false },
  amountCents: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('paid', 'refunded'), defaultValue: 'paid' }
});

export const IntegrationConnection = sequelize.define('IntegrationConnection', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  provider: { type: DataTypes.ENUM('google_calendar', 'zoom', 'slack', 'discord', 's3', 'stripe'), allowNull: false },
  status: { type: DataTypes.ENUM('connected', 'disconnected'), defaultValue: 'connected' },
  accessToken: { type: DataTypes.STRING },
  lastSyncAt: { type: DataTypes.DATE }
});

export const ContentFlag = sequelize.define('ContentFlag', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  reporterId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('open', 'resolved'), defaultValue: 'open' }
});

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  readAt: { type: DataTypes.DATE }
});

export const QuizAttempt = sequelize.define('QuizAttempt', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  attemptNo: { type: DataTypes.INTEGER, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false, unique: true },
  questionOrder: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  answerMap: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  score: { type: DataTypes.FLOAT, defaultValue: 0 },
  startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  submittedAt: { type: DataTypes.DATE },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'submitted', 'expired'), defaultValue: 'active' }
});

export const LiveSessionRecording = sequelize.define('LiveSessionRecording', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sessionId: { type: DataTypes.INTEGER, allowNull: false },
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  videoUrl: { type: DataTypes.STRING, allowNull: false },
  thumbnailUrl: { type: DataTypes.STRING }
});

export const ModerationAudit = sequelize.define('ModerationAudit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  adminId: { type: DataTypes.INTEGER, allowNull: false },
  targetType: { type: DataTypes.STRING, allowNull: false },
  targetId: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  note: { type: DataTypes.TEXT }
});

export const UserSuspension = sequelize.define('UserSuspension', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  reason: { type: DataTypes.STRING, allowNull: false },
  suspendedUntil: { type: DataTypes.DATE },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

User.hasMany(Lesson, { foreignKey: 'creatorId', as: 'lessons' });
Lesson.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Lesson.hasMany(QuizQuestion, { foreignKey: 'lessonId', as: 'quizQuestions', onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(Progress, { foreignKey: 'userId' });
Progress.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(Progress, { foreignKey: 'lessonId' });
Progress.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(LearningPath, { foreignKey: 'creatorId', as: 'paths' });
LearningPath.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
LearningPath.belongsToMany(Lesson, { through: PathLesson, foreignKey: 'pathId', otherKey: 'lessonId', as: 'lessons' });
Lesson.belongsToMany(LearningPath, { through: PathLesson, foreignKey: 'lessonId', otherKey: 'pathId', as: 'paths' });

User.belongsToMany(LearningPath, { through: PathEnrollment, foreignKey: 'userId', otherKey: 'pathId', as: 'enrolledPaths' });
LearningPath.belongsToMany(User, { through: PathEnrollment, foreignKey: 'pathId', otherKey: 'userId', as: 'learners' });

User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'userId', otherKey: 'badgeId', as: 'badges' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badgeId', otherKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(Comment, { foreignKey: 'lessonId' });
Comment.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(Like, { foreignKey: 'lessonId' });
Like.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});
User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

User.hasMany(Activity, { foreignKey: 'userId' });
Activity.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(StudyGroup, { foreignKey: 'creatorId', as: 'createdGroups' });
StudyGroup.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
StudyGroup.belongsToMany(User, { through: GroupMembership, foreignKey: 'groupId', otherKey: 'userId', as: 'members' });
User.belongsToMany(StudyGroup, { through: GroupMembership, foreignKey: 'userId', otherKey: 'groupId', as: 'groups' });
StudyGroup.hasMany(GroupPost, { foreignKey: 'groupId', as: 'posts' });
GroupPost.belongsTo(StudyGroup, { foreignKey: 'groupId' });
User.hasMany(GroupPost, { foreignKey: 'userId' });
GroupPost.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(User, {
  through: ParentChildLink,
  as: 'children',
  foreignKey: 'parentId',
  otherKey: 'childId'
});
User.belongsToMany(User, {
  through: ParentChildLink,
  as: 'parents',
  foreignKey: 'childId',
  otherKey: 'parentId'
});

User.hasMany(AiHintLog, { foreignKey: 'userId' });
AiHintLog.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(AiHintLog, { foreignKey: 'lessonId' });
AiHintLog.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(Certificate, { foreignKey: 'userId' });
Certificate.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(Certificate, { foreignKey: 'lessonId' });
Certificate.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(LiveSession, { foreignKey: 'creatorId', as: 'liveSessions' });
LiveSession.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
LiveSession.belongsToMany(User, { through: LiveSessionEnrollment, foreignKey: 'sessionId', otherKey: 'userId', as: 'attendees' });
User.belongsToMany(LiveSession, { through: LiveSessionEnrollment, foreignKey: 'userId', otherKey: 'sessionId', as: 'enrolledSessions' });

User.hasMany(Assignment, { foreignKey: 'creatorId', as: 'assignments' });
Assignment.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
Lesson.hasMany(Assignment, { foreignKey: 'lessonId', as: 'assignments' });
Assignment.belongsTo(Lesson, { foreignKey: 'lessonId' });
Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId', as: 'submissions' });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId' });
User.hasMany(AssignmentSubmission, { foreignKey: 'userId', as: 'submissions' });
AssignmentSubmission.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(ParentAlertPreference, { foreignKey: 'parentId', as: 'alertPreference' });
ParentAlertPreference.belongsTo(User, { foreignKey: 'parentId' });

User.hasMany(CreatorOffering, { foreignKey: 'creatorId', as: 'offerings' });
CreatorOffering.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
CreatorOffering.hasMany(Purchase, { foreignKey: 'offeringId', as: 'purchases' });
Purchase.belongsTo(CreatorOffering, { foreignKey: 'offeringId', as: 'offering' });
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(IntegrationConnection, { foreignKey: 'userId', as: 'integrations' });
IntegrationConnection.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ContentFlag, { foreignKey: 'reporterId', as: 'contentFlags' });
ContentFlag.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Lesson.hasMany(ContentFlag, { foreignKey: 'lessonId', as: 'flags' });
ContentFlag.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(QuizAttempt, { foreignKey: 'lessonId', as: 'quizAttempts' });
QuizAttempt.belongsTo(Lesson, { foreignKey: 'lessonId' });

LiveSession.hasMany(LiveSessionRecording, { foreignKey: 'sessionId', as: 'recordings' });
LiveSessionRecording.belongsTo(LiveSession, { foreignKey: 'sessionId' });
User.hasMany(LiveSessionRecording, { foreignKey: 'creatorId', as: 'sessionRecordings' });
LiveSessionRecording.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

User.hasMany(ModerationAudit, { foreignKey: 'adminId', as: 'moderationActions' });
ModerationAudit.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

User.hasOne(UserSuspension, { foreignKey: 'userId', as: 'suspension' });
UserSuspension.belongsTo(User, { foreignKey: 'userId' });

export async function initDb() {
  await sequelize.sync();
}
