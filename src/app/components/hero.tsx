import Link from "next/link";
import {
  ArrowRight,
  Play,
  LineChart,
  Library,
  MessageSquareText,
} from "lucide-react";
import { Button } from "~/components/ui/button";
const caseStudies = [
  {
    icon: LineChart,
    title: "Engineering velocity increased",
    body: "Ship weekly releases without drowning in context switching or stale documentation.",
  },
  {
    icon: Library,
    title: "Every repository understood",
    body: "We digest architecture, tests, and tech debt so onboarding takes hours, not weeks.",
  },
  {
    icon: MessageSquareText,
    title: "Meetings become actionable",
    body: "Auto-transcribed conversations resolve into tasks, summaries, and next steps instantly.",
  },
];
export function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-24 md:px-6 md:py-32 lg:py-36">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,210,155,0.28),_transparent_55%)]" />
      <div className="absolute inset-y-12 left-1/2 -z-10 w-[70vw] -translate-x-1/2 rounded-full border border-dashed border-primary/20" />
      <div className="container mx-auto max-w-6xl lg:max-w-7xl">
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div className="flex flex-col gap-10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-xs font-semibold tracking-[0.35em] uppercase text-primary">
                Strategic AI Suite
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Trusted by high-velocity teams
              </span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Product engineering without guesswork.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                GitWit investigates your stack in real time, aligns every
                conversation with customer impact, and orchestrates delivery
                with meticulous precision. Less ceremony, more certainty.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-in" className="group">
                  Book a live session
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features" className="group">
                  <Play className="mr-2 h-4 w-4 group-hover:scale-105" />
                  Watch a 3-min walkthrough
                </Link>
              </Button>
            </div>
          </div>
          <aside className="relative isolate flex flex-col gap-5 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-2xl shadow-primary/5 backdrop-blur-sm lg:translate-y-2">
            <div className="absolute -top-12 left-12 -z-10 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
            <header className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Living operating manual
              </span>
              <p className="text-lg font-medium text-foreground">
                One place to brief leadership, unblock squads, and surface
                progress without assembling a deck.
              </p>
            </header>
            <div className="grid gap-4">
              {caseStudies.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="glass rounded-2xl p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer className="rounded-2xl border border-dashed border-border/80 p-5 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>gitwit.ai — version control brief</span>
              </div>
              <div className="mt-3 space-y-1">
                <p>sync repo --insights daily</p>
                <p>auto align stakeholders</p>
                <p>ship with accountability</p>
              </div>
            </footer>
          </aside>
        </div>
      </div>
    </section>
  );
}
