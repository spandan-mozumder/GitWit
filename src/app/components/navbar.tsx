"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Logo } from "./logo"
import { ModeToggle } from "./ThemeToggle"

const links = [
  { href: "#features", label: "Platform" },
  { href: "#how-it-works", label: "Method" },
  { href: "#footer", label: "Library" },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
            <Logo />
          </span>
          <span className="text-lg font-semibold tracking-[0.32em] uppercase text-foreground">GitWit</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={() => router.push("/sign-in")} className="rounded-full">
            Request Access
          </Button>
          <Button size="sm" onClick={() => router.push("/sign-up")} className="rounded-full">
            Start now
          </Button>
        </nav>

        <button
          className="inline-flex items-center rounded-full border border-border/60 p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => {
                  router.push("/sign-in")
                  setIsMenuOpen(false)
                }}
              >
                Request Access
              </Button>
            </div>
            <Button
              onClick={() => {
                router.push("/sign-up")
                setIsMenuOpen(false)
              }}
            >
              Start now
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
