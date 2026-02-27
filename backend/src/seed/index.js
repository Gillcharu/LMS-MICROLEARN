import bcrypt from 'bcryptjs';
import {
  Assignment,
  initDb,
  CreatorOffering,
  Badge,
  GroupMembership,
  GroupPost,
  LiveSession,
  LearningPath,
  Lesson,
  ParentAlertPreference,
  ParentChildLink,
  PathLesson,
  Progress,
  QuizQuestion,
  StudyGroup,
  User
} from '../models/index.js';

async function seed() {
  await initDb();

  const passwordHash = await bcrypt.hash('password123', 10);
  async function ensureDemoUser({ name, email, role }) {
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: { name, role, passwordHash }
    });
    await user.update({ name, role, passwordHash });
    return user;
  }

  const creator = await ensureDemoUser({ name: 'Creator One', email: 'creator@microlearn.app', role: 'creator' });
  const learner = await ensureDemoUser({ name: 'Learner One', email: 'learner@microlearn.app', role: 'learner' });
  const parent = await ensureDemoUser({ name: 'Parent One', email: 'parent@microlearn.app', role: 'parent' });
  await ensureDemoUser({ name: 'Admin One', email: 'admin@microlearn.app', role: 'admin' });

  async function ensureLessonWithQuiz({ lessonData, quizData }) {
    const [row] = await Lesson.findOrCreate({
      where: { title: lessonData.title },
      defaults: lessonData
    });
    await row.update({ ...lessonData, published: true });

    const existingCount = await QuizQuestion.count({ where: { lessonId: row.id } });
    if (existingCount === 0) {
      await QuizQuestion.bulkCreate(quizData.map((q) => ({ ...q, lessonId: row.id })));
    }
    return row;
  }

  const foundationLesson = await ensureLessonWithQuiz({
    lessonData: {
      creatorId: creator.id,
      title: 'Intro to Productive Learning Sprints',
      description: 'Learn how to structure 10-minute focused study sessions.',
      category: 'Learning Science',
      durationMinutes: 10,
      contentType: 'text',
      contentBody: 'Microlearning breaks large topics into fast, goal-oriented sessions.',
      difficulty: 'beginner',
      published: true
    },
    quizData: [
      {
        prompt: 'What is the ideal micro-lesson duration?',
        optionA: '1-3 minutes',
        optionB: '5-15 minutes',
        optionC: '20-40 minutes',
        optionD: '60+ minutes',
        correctOption: 'B'
      },
      {
        prompt: 'Which approach improves retention?',
        optionA: 'Dense lectures',
        optionB: 'No review',
        optionC: 'Spaced repetition',
        optionD: 'Random multitasking',
        correctOption: 'C'
      },
      {
        prompt: 'A micro-lesson should focus on:',
        optionA: 'One clear objective',
        optionB: 'Entire textbook chapter',
        optionC: 'Multiple unrelated goals',
        optionD: 'No measurable outcome',
        correctOption: 'A'
      }
    ]
  });

  const sem4Lessons = [];
  sem4Lessons.push(await ensureLessonWithQuiz({
    lessonData: {
      creatorId: creator.id,
      title: 'DBMS: Normalization to 3NF',
      description: 'Quickly understand 1NF, 2NF, 3NF with practical dependency examples.',
      category: 'DBMS',
      durationMinutes: 12,
      contentType: 'text',
      contentBody: 'Start from functional dependencies, remove partial and transitive dependencies, then validate 3NF decomposition.',
      difficulty: 'intermediate',
      published: true
    },
    quizData: [
      { prompt: '2NF removes which dependency?', optionA: 'Transitive', optionB: 'Partial', optionC: 'Multivalued', optionD: 'Join', correctOption: 'B' },
      { prompt: '3NF primarily removes:', optionA: 'Partial dependency', optionB: 'No dependency', optionC: 'Transitive dependency', optionD: 'Candidate keys', correctOption: 'C' },
      { prompt: 'Normalization improves:', optionA: 'Redundancy control', optionB: 'Only UI speed', optionC: 'Compiler output', optionD: 'Network bandwidth only', correctOption: 'A' }
    ]
  }));
  sem4Lessons.push(await ensureLessonWithQuiz({
    lessonData: {
      creatorId: creator.id,
      title: 'Operating Systems: Deadlock Essentials',
      description: 'Understand deadlock conditions, detection, prevention, and avoidance in short form.',
      category: 'Operating Systems',
      durationMinutes: 11,
      contentType: 'text',
      contentBody: 'Mutual exclusion, hold-and-wait, no preemption, and circular wait are the four conditions required for deadlock.',
      difficulty: 'intermediate',
      published: true
    },
    quizData: [
      { prompt: 'How many Coffman conditions are required for deadlock?', optionA: '2', optionB: '3', optionC: '4', optionD: '5', correctOption: 'C' },
      { prompt: "Banker's algorithm is used for:", optionA: 'Deadlock avoidance', optionB: 'Deadlock detection only', optionC: 'Paging', optionD: 'CPU scheduling only', correctOption: 'A' },
      { prompt: 'Removing circular wait helps in:', optionA: 'Prevention strategy', optionB: 'Detection strategy', optionC: 'Swapping', optionD: 'Thrashing', correctOption: 'A' }
    ]
  }));
  sem4Lessons.push(await ensureLessonWithQuiz({
    lessonData: {
      creatorId: creator.id,
      title: 'Computer Networks: TCP vs UDP',
      description: 'Compare reliability, ordering, handshake, and practical protocol choices.',
      category: 'Computer Networks',
      durationMinutes: 9,
      contentType: 'text',
      contentBody: 'TCP is connection-oriented and reliable; UDP is connectionless and lower-latency with no delivery guarantee.',
      difficulty: 'beginner',
      published: true
    },
    quizData: [
      { prompt: 'Which protocol is connection-oriented?', optionA: 'UDP', optionB: 'TCP', optionC: 'IP', optionD: 'ARP', correctOption: 'B' },
      { prompt: 'Streaming that prioritizes latency often uses:', optionA: 'TCP', optionB: 'UDP', optionC: 'ICMP', optionD: 'SMTP', correctOption: 'B' },
      { prompt: 'Three-way handshake belongs to:', optionA: 'TCP setup', optionB: 'UDP setup', optionC: 'DNS lookup', optionD: 'ARP resolution', correctOption: 'A' }
    ]
  }));
  sem4Lessons.push(await ensureLessonWithQuiz({
    lessonData: {
      creatorId: creator.id,
      title: 'Theory of Computation: DFA Basics',
      description: 'Build intuition around deterministic finite automata and language acceptance.',
      category: 'Theory of Computation',
      durationMinutes: 10,
      contentType: 'text',
      contentBody: 'A DFA has a finite set of states, transition function, start state, and accepting states.',
      difficulty: 'beginner',
      published: true
    },
    quizData: [
      { prompt: 'In DFA, each input symbol leads to:', optionA: 'At most one next state', optionB: 'Exactly one next state', optionC: 'Two states always', optionD: 'No transition', correctOption: 'B' },
      { prompt: 'DFA is used to recognize:', optionA: 'Context-free languages', optionB: 'Recursive languages only', optionC: 'Regular languages', optionD: 'All languages', correctOption: 'C' },
      { prompt: 'Accepting states are also called:', optionA: 'Final states', optionB: 'Dead states', optionC: 'Initial states', optionD: 'Trap states only', correctOption: 'A' }
    ]
  }));
  sem4Lessons.push(await ensureLessonWithQuiz({
    lessonData: {
      creatorId: creator.id,
      title: 'Design & Analysis of Algorithms: Greedy Choice',
      description: 'Understand when greedy works and where it fails with short decision checkpoints.',
      category: 'Algorithms',
      durationMinutes: 13,
      contentType: 'text',
      contentBody: 'Greedy is valid when local optimal choices guarantee global optimality, often proven via exchange arguments.',
      difficulty: 'advanced',
      published: true
    },
    quizData: [
      { prompt: 'Greedy algorithms rely on:', optionA: 'Backtracking all options', optionB: 'Local optimal choice', optionC: 'Random picks', optionD: 'Dynamic tables only', correctOption: 'B' },
      { prompt: 'Activity selection is a classic:', optionA: 'Greedy problem', optionB: 'NP-complete problem', optionC: 'Graph coloring only', optionD: 'Compiler parsing', correctOption: 'A' },
      { prompt: 'Exchange argument is used to:', optionA: 'Measure memory', optionB: 'Prove correctness', optionC: 'Encrypt data', optionD: 'Compress files', correctOption: 'B' }
    ]
  }));

  const [path] = await LearningPath.findOrCreate({
    where: { title: 'Microlearning Foundations' },
    defaults: {
      creatorId: creator.id,
      description: 'Build your microlearning habit and strategy.',
      published: true
    }
  });

  await PathLesson.findOrCreate({ where: { pathId: path.id, lessonId: foundationLesson.id }, defaults: { orderIndex: 1 } });

  const [sem4Path] = await LearningPath.findOrCreate({
    where: { title: 'Semester 4 Engineering Sprint Path' },
    defaults: {
      creatorId: creator.id,
      description: 'Targeted micro-lessons for common Semester 4 engineering subjects.',
      published: true
    }
  });
  await sem4Path.update({ published: true });

  for (const [idx, semLesson] of sem4Lessons.entries()) {
    await PathLesson.findOrCreate({
      where: { pathId: sem4Path.id, lessonId: semLesson.id },
      defaults: { orderIndex: idx + 1 }
    });
  }
  await ParentChildLink.findOrCreate({ where: { parentId: parent.id, childId: learner.id } });
  await ParentAlertPreference.findOrCreate({ where: { parentId: parent.id } });

  await Progress.findOrCreate({
    where: { userId: learner.id, lessonId: foundationLesson.id },
    defaults: { status: 'completed', completionPercent: 100, quizScore: 85, timeSpentSeconds: 600, lastAccessedAt: new Date() }
  });

  const [group] = await StudyGroup.findOrCreate({
    where: { name: 'Daily Learning Sprint Group' },
    defaults: {
      topic: 'Productivity',
      description: 'Share quick wins from daily micro-lesson sessions.',
      creatorId: creator.id,
      coverImage: '/images/group-illustration.svg',
      isPublic: true
    }
  });

  await GroupMembership.findOrCreate({ where: { groupId: group.id, userId: creator.id }, defaults: { role: 'owner' } });
  await GroupMembership.findOrCreate({ where: { groupId: group.id, userId: learner.id }, defaults: { role: 'member' } });
  const postCount = await GroupPost.count({ where: { groupId: group.id } });
  if (postCount === 0) {
    await GroupPost.create({
      groupId: group.id,
      userId: creator.id,
      content: 'Welcome to the sprint group. Post one takeaway after each lesson.'
    });
  }

  await LiveSession.findOrCreate({
    where: { title: 'Live Office Hour: Learning Sprints' },
    defaults: {
      creatorId: creator.id,
      description: 'Weekly Q&A for learners to improve sprint study habits.',
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      meetingUrl: 'https://example.com/live-session',
      capacity: 200,
      status: 'scheduled'
    }
  });

  await Assignment.findOrCreate({
    where: { title: 'Sprint Reflection Journal', creatorId: creator.id },
    defaults: {
      creatorId: creator.id,
      lessonId: foundationLesson.id,
      description: 'Write a short reflection on how you applied focused study sessions this week.',
      dueAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      maxPoints: 100,
      published: true
    }
  });

  await CreatorOffering.findOrCreate({
    where: { title: 'Premium Sprint Coaching', creatorId: creator.id },
    defaults: {
      creatorId: creator.id,
      description: 'Access extended templates, weekly office hour priority, and premium learning guides.',
      priceCents: 999,
      billingType: 'monthly',
      active: true
    }
  });

  const badges = [
    ['FIRST_STEP', 'First Step', 'Complete your first lesson'],
    ['TEN_LESSONS', 'Tenacity', 'Complete ten lessons'],
    ['STREAK_7', 'Weekly Streak', 'Maintain a 7 day streak'],
    ['POINTS_500', 'Point Master', 'Earn 500 points']
  ];
  for (const [code, title, description] of badges) {
    await Badge.findOrCreate({ where: { code }, defaults: { title, description, icon: '🏅' } });
  }

  console.log('Seed complete.');
}

seed().then(() => process.exit(0));
