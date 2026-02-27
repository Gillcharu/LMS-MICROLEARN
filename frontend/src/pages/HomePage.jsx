import { Link } from 'react-router-dom';
import OnboardingTutorial from '../components/OnboardingTutorial';

const highlights = [
  { icon: '✦', title: 'Focused Sessions', body: 'Curated 5-15 minute lessons designed for deep retention.' },
  { icon: '◎', title: 'Progress Intelligence', body: 'Quizzes, streaks, and paths turn consistency into measurable growth.' },
  { icon: '◈', title: 'Connected Learning', body: 'Study groups, creator guidance, and parent visibility in one platform.' }
];

export default function HomePage() {
  return (
    <main className="container home-clean">
      <section className="hero hero-elegant">
        <div className="hero-copy">
          <p className="hero-kicker">MicroLearn Platform</p>
          <h1>Focused Learning for Modern Schedules</h1>
          <p>Master key concepts in short, intentional sessions with a premium learning experience built for clarity.</p>

          <div className="row wrap hero-actions">
            <Link className="cta-btn" to="/lessons">Begin Learning</Link>
            <Link className="ghost-btn" to="/register">Create Account</Link>
          </div>

          <div className="hero-metrics">
            <p><strong>5-15 min</strong> lessons</p>
            <p><strong>3-5</strong> quiz checks</p>
            <p><strong>Role-based</strong> journeys</p>
          </div>
        </div>

        <div className="hero-visual-stack">
          <img src="/images/hero-learning.svg" alt="MicroLearn visual" className="hero-image" />
        </div>
      </section>

      <section className="grid highlight-grid">
        {highlights.map((item) => (
          <article className="card highlight-card" key={item.title}>
            <p className="highlight-icon">{item.icon}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <OnboardingTutorial />
    </main>
  );
}
