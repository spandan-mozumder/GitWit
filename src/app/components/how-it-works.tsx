import { CalendarCheck2, ClipboardCheck, PlugZap, Sparkles } from "lucide-react"

const steps = [
  {
    title: "Connect your reality",
    description: "Hook in GitHub, calendars, and comms. GitWit ingests architecture, rituals, and priorities in a few clicks.",
    icon: PlugZap,
    detail: "SSO, audit logs, and granular permissions keep compliance simple.",
  },
  {
    title: "Calibrate the operating rhythm",
    description: "Select the cadences you already run—standups, planning, stakeholder briefs. We automate each with tailored prompts.",
    icon: CalendarCheck2,
    detail: "No new rituals required; just more clarity embedded in the ones you trust.",
  },
  {
    title: "Surface what matters",
    description: "Every conversation, commit, and meeting is distilled into context-rich summaries with accountable next steps.",
    icon: ClipboardCheck,
    detail: "Leaders see momentum instantly, teams get unblocked without another status meeting.",
  },
  {
    title: "Compound momentum",
    description: "Insights roll into dashboards, scorecards, and executive briefs. You operate from signal—not guesswork.",
    icon: Sparkles,
    detail: "Expect measurable lift in velocity, predictability, and trust within the first sprint.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full bg-sidebar px-4 py-20 md:px-6 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-12 space-y-4 text-left md:text-center">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Implementation
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Launch a disciplined AI program in days, not quarters.
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            We combine thoughtful onboarding with automation that adapts to your process. No sprawling playbooks, just
            a clear cadence that your teams adopt immediately.
          </p>
        </header>

        <div className="relative border-l border-border/70 pl-8 md:pl-12">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border/70 to-transparent" aria-hidden />
          <div className="space-y-10">
            {steps.map(({ title, description, detail, icon: Icon }, index) => (
              <article key={title} className="relative rounded-3xl bg-background/80 p-6 shadow-lg shadow-primary/5 md:p-8">
                <span className="absolute -left-8 top-8 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background font-mono text-sm text-foreground md:-left-11">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
                    <p className="text-sm font-medium text-foreground/80">{detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

