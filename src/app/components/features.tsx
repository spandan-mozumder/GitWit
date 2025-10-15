import { BarChart3, Briefcase, Castle, Cog, Github, MessageSquare } from "lucide-react"

const capabilities = [
  {
    title: "Context Engine",
    subtitle: "Understand the entire stack in minutes",
    icon: Github,
    highlights: [
      "Map architectures, tech debt, and risk automatically",
      "Trace ownership, deploy cadence, and sequence diagrams",
      "Surface docs, tests, and RFCs without searching",
    ],
  },
  {
    title: "Orchestration",
    subtitle: "Align product, engineering, and GTM",
    icon: Briefcase,
    highlights: [
      "Clarify why each initiative matters with instant briefs",
      "Sync comments, blockers, and decisions across every tool",
      "Keep leadership in the loop with live status reporting",
    ],
  },
  {
    title: "Delivery Rooms",
    subtitle: "Keep execution disciplined",
    icon: Castle,
    highlights: [
      "Run async stand-ups that feed straight into roadmaps",
      "Turn meetings into tasks and documentation automatically",
      "Spot drift and scope risk before it hits production",
    ],
  },
  {
    title: "Advisor Copilot",
    subtitle: "Decisive answers from real context",
    icon: MessageSquare,
    highlights: [
      "Ask anything about strategy, code, or runway",
      "Reference every conversation, commit, or spec instantly",
      "Recommend next steps grounded in what actually shipped",
    ],
  },
  {
    title: "Reliable Infrastructure",
    subtitle: "Built to scale with your org",
    icon: Cog,
    highlights: [
      "SSO, audit logging, SOC2, and data residency included",
      "Granular roles for leadership, squads, vendors, and guests",
      "Private deployment options for regulated industries",
    ],
  },
  {
    title: "Executive Analytics",
    subtitle: "Quantify velocity and impact",
    icon: BarChart3,
    highlights: [
      "Forecast releases with signal, not optimism",
      "Tie customer impact back to effort by team",
      "See cycle times, focus areas, and emerging risk",
    ],
  },
]

export function Features() {
  return (
    <section id="features" className="relative w-full px-4 py-20 md:px-6 md:py-28">
      <div className="container mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mb-16 grid gap-6 text-left lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center rounded-full border border-border/60 bg-accent/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/70">
              Platform overview
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              A single operating surface for engineering leadership.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Every module is crafted to remove administrative drag and highlight what matters now. Use each
            capability individually or combine them into a live program that keeps product, engineering, and
            executives attuned to the same outcome.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {capabilities.map(({ title, subtitle, icon: Icon, highlights }) => (
            <article key={title} className="card-hover relative flex h-full flex-col justify-between rounded-3xl bg-card/80 p-6 shadow-primary/5 transition-colors hover:bg-card/90">
              <div className="absolute inset-0 rounded-3xl border border-border/60" aria-hidden />
              <div className="relative space-y-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                  <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{subtitle}</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-6 rounded-full bg-primary/50" aria-hidden />
                      <span className="leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

