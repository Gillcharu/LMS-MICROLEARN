const faqs = [
  ['How long is each lesson?', 'Each lesson is constrained to 5-15 minutes.'],
  ['How many quiz questions are in a lesson?', 'Each lesson includes 3-5 quiz questions.'],
  ['How do I become a creator?', 'Register as creator, then open Creator Studio from navigation.'],
  ['How is progress measured?', 'Progress combines completion, quiz score, and time spent.'],
  ['Can I upload media?', 'Use external media URLs; cloud-storage integration is supported via backend media service.']
];

export default function HelpPage() {
  return (
    <main className="container">
      <h2>Help Center</h2>
      <section className="grid two-col">
        <article className="card">
          <h3>Quick Start</h3>
          <ol>
            <li>Register or login.</li>
            <li>Choose a lesson and start a study session.</li>
            <li>Complete quiz and track results in dashboard.</li>
            <li>Enroll in or create a learning path.</li>
          </ol>
        </article>
        <article className="card">
          <h3>Troubleshooting</h3>
          <p>If login fails, confirm backend is running on port 4000 and seeded accounts exist.</p>
          <p>Run <code>npm run seed</code> in project root to regenerate demo users.</p>
        </article>
      </section>

      <section className="card">
        <h3>FAQs</h3>
        {faqs.map(([q, a]) => (
          <details key={q} className="faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
