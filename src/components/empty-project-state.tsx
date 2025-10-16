"use client"
import Link from "next/link"
import { 
  Plus, 
  Sparkles, 
  ArrowRight,
  BarChart3,
  Code2,
  MessageSquare,
  Bot
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
export function EmptyProjectState() {
  const features = [
    {
      icon: Bot,
      title: "AI Q&A",
      description: "Get instant answers about your codebase",
      color: "blue"
    },
    {
      icon: Code2,
      title: "Code Review",
      description: "AI-powered security & performance analysis",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track team metrics & DORA scores",
      color: "green"
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: "Real-time collaboration with context",
      color: "orange"
    }
  ]
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-fade-in p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
      </div>
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to GitWit
        </h1>
        <p className="text-xl text-muted-foreground">
          Create your first project to unlock powerful AI-driven insights for your codebase
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/create">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 h-12 px-8">
            <Plus className="h-5 w-5" />
            Create Your First Project
          </Button>
        </Link>
        <Link href="/features">
          <Button size="lg" variant="outline" className="gap-2 h-12 px-8">
            Explore Features
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl pt-8">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="border-border/70 bg-card/50 hover:bg-card transition-colors">
              <CardHeader className="space-y-3 flex flex-col items-center text-center">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-${feature.color}-500/10 text-${feature.color}-500`}>
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-border/50">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">AI-Powered</div>
          <div className="text-sm text-muted-foreground">Every Feature</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">Real-time</div>
          <div className="text-sm text-muted-foreground">Collaboration</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">100%</div>
          <div className="text-sm text-muted-foreground">Type-Safe</div>
        </div>
      </div>
    </div>
  )
}
