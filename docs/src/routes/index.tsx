import { baseOptions } from '@/lib/layout.shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col flex-1 items-center justify-center px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6">
          AudisAI
        </h1>
        <p className="max-w-[640px] text-lg text-muted-foreground sm:text-xl mb-8">
          Automated AI Compliance & Static Analysis.
          Scan codebases for violations of EU AI Act, NIST, ISO 27001, and US State Laws.
        </p>
        <div className="flex gap-4 mb-16">
          <Link
            to="/docs/$"
            params={{ _splat: 'guide/introduction' }}
            className="px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold text-sm transition-colors hover:bg-fd-primary/90"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/Nuulab/AudisAI"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-lg border border-fd-border bg-fd-background hover:bg-fd-accent hover:text-fd-accent-foreground font-semibold text-sm transition-colors"
          >
            GitHub
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl w-full text-left">
          <FeatureCard 
            title="Privacy First" 
            description="Zero-AI pattern matching. No LLMs required. Your code never leaves your machine." 
          />
          <FeatureCard 
            title="Multi-Framework" 
            description="Support for 12+ policies including EU AI Act, NIST AI RMF, ISO 27001, and more." 
          />
          <FeatureCard 
            title="CI/CD Ready" 
            description="Integrate seamlessly into GitHub Actions or GitLab CI with native SARIF output." 
          />
        </div>
      </div>
    </HomeLayout>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-card p-6 shadow-sm">
      <h3 className="font-semibold mb-2 text-fd-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
