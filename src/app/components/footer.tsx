import Link from "next/link"
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react"
import { Logo } from "./logo"

const footerLinks = [
  {
    heading: "Product",
    items: [
      { label: "Platform", href: "#features" },
      { label: "Operating Method", href: "#how-it-works" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Press", href: "#press" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "Documentation", href: "#" },
      { label: "Partner Program", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer id="footer" className="relative w-full border-t border-border/60 bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div className="space-y-6">
            <Link href="/" className="group flex items-center gap-3">
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                <Logo />
              </span>
              <span className="text-lg font-semibold tracking-[0.32em] uppercase text-foreground">GitWit</span>
            </Link>
            <p className="max-w-md text-sm text-muted-foreground">
              GitWit is the trusted operating system for product engineering. We blend your rituals, data, and
              conversations into a single flow so every team ships with confidence.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <a className="inline-flex items-center gap-2" href="mailto:founders@gitwit.ai">
                <Mail className="h-4 w-4" /> founders@gitwit.ai
              </a>
              <Link href="https://github.com/paras-verma7454/GitWit" target="_blank" className="inline-flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub
              </Link>
              <Link href="https://www.linkedin.com/in/paras-vermaa" target="_blank" className="inline-flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {footerLinks.map(({ heading, items }) => (
              <div key={heading} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">{heading}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                      >
                        {item.label}
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Stay in rhythm</h3>
              <p className="text-sm text-muted-foreground">
                Monthly notes on building reliable product organizations, plus feature updates and invitations.
              </p>
              <form className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="work@email.com"
                  className="w-full rounded-full border border-border/70 bg-background px-4 py-2 text-sm outline-none transition-shadow focus:border-primary focus:shadow-[0_0_0_2px_rgba(240,182,112,0.35)]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Join
                </button>
              </form>
              <span className="block text-xs text-muted-foreground">
                We send one email a month—unsubscribe any time.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6">
          <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} GitWit Labs. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="#" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Responsible AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

