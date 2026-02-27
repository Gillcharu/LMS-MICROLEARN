import { useState } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    title: 'Define Goal',
    body: 'Choose one learning target and select a short lesson that maps directly to that outcome.',
    note: 'Best practice: start with a single objective per session.',
    ctaLabel: 'Open Lessons',
    ctaHref: '/lessons'
  },
  {
    title: 'Run Session',
    body: 'Use the study timer and progress markers to stay focused without cognitive overload.',
    note: 'Best practice: pause and save progress between sprints.',
    ctaLabel: 'Go to Dashboard',
    ctaHref: '/dashboard'
  },
  {
    title: 'Validate Mastery',
    body: 'Complete the quiz, review missed answers, and reinforce concepts immediately.',
    note: 'Best practice: retake quickly when score is below target.',
    ctaLabel: 'Start Quiz Lesson',
    ctaHref: '/lessons'
  },
  {
    title: 'Scale Consistency',
    body: 'Follow paths, maintain streaks, and use social accountability for long-term growth.',
    note: 'Best practice: keep a daily 10-minute rhythm.',
    ctaLabel: 'View Progress',
    ctaHref: '/dashboard'
  }
];

export default function OnboardingTutorial() {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];

  return (
    <section className="card tutorial-elegant">
      <div className="row between wrap">
        <div>
          <p className="hero-kicker">Interactive Tutorial</p>
          <h3>First Session Walkthrough</h3>
        </div>
        <span className="pill">Step {idx + 1} / {steps.length}</span>
      </div>

      <div className="tutorial-layout">
        <aside className="tutorial-nav">
          {steps.map((s, i) => (
            <button
              type="button"
              key={s.title}
              className={i === idx ? 'tutorial-tab active' : 'tutorial-tab'}
              onClick={() => setIdx(i)}
            >
              {String(i + 1).padStart(2, '0')} {s.title}
            </button>
          ))}
        </aside>

        <article className="tutorial-panel">
          <h4>{step.title}</h4>
          <p>{step.body}</p>
          <p className="muted">{step.note}</p>

          <div className="row wrap">
            <button className="ghost-btn" disabled={idx === 0} onClick={() => setIdx((v) => v - 1)}>Previous</button>
            <button disabled={idx === steps.length - 1} onClick={() => setIdx((v) => v + 1)}>Next</button>
            <Link className="cta-btn" to={step.ctaHref}>{step.ctaLabel}</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
