import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6">
        AudisAI
      </h1>
      <p className="max-w-[640px] text-lg text-muted-foreground sm:text-xl mb-8">
        Automated AI Compliance &amp; Static Analysis. Scan codebases for violations
        of EU AI Act, NIST, ISO 27001, and US State Laws.
      </p>
      <div className="flex gap-4 mb-16">
        <Link
          href="/docs/guide/introduction"
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:bg-primary/90"
        >
          Get Started
        </Link>
        <Link
          href="https://github.com/Nuulab/AudisAI"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground font-semibold text-sm transition-colors"
        >
          GitHub
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl w-full text-left">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-2">Privacy First</h3>
          <p className="text-sm text-muted-foreground">
            Zero-AI pattern matching. No LLMs required. Your code never leaves
            your machine.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-2">Multi-Framework</h3>
          <p className="text-sm text-muted-foreground">
            Support for 12+ policies including EU AI Act, NIST AI RMF, ISO
            27001, and more.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-2">CI/CD Ready</h3>
          <p className="text-sm text-muted-foreground">
            Integrate seamlessly into GitHub Actions or GitLab CI with native
            SARIF output.
          </p>
        </div>
      </div>
    </div>
  );
}
