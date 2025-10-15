"use client"

import Link from "next/link"
import { 
  BarChart3, 
  Code2, 
  MessageSquare, 
  BookOpen, 
  CheckSquare,
  Bot,
  Presentation,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  GitBranch,
  LineChart,
  FileText,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import useProject from "~/hooks/use-project"

export default function FeaturesPage() {
  const { projectId } = useProject()

  const coreFeatures = [
    {
      icon: Bot,
      title: "AI Q&A",
      description: "Ask questions about your codebase and get instant, context-aware answers powered by AI.",
      color: "blue",
      gradient: "from-blue-500/10 to-blue-500/5",
      href: "/qa",
      badges: ["AI-Powered", "Real-time"]
    },
    {
      icon: Presentation,
      title: "Meeting Summaries",
      description: "Automatic transcription, summarization, and action item extraction from your team meetings.",
      color: "purple",
      gradient: "from-purple-500/10 to-purple-500/5",
      href: "/meetings",
      badges: ["Auto-Transcribe", "Action Items"]
    }
  ]

  const tier1Features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track developer productivity, team metrics, DORA scores, velocity trends, and code hotspots.",
      color: "blue",
      gradient: "from-blue-500/10 to-blue-500/5",
      href: `/dashboard/${projectId}/analytics`,
      badges: ["New", "DORA Metrics"],
      features: [
        "Developer & Team Metrics",
        "DORA Performance Ratings",
        "Velocity Trend Analysis",
        "Code Hotspot Detection",
        "Leaderboard & Rankings"
      ]
    },
    {
      icon: Code2,
      title: "AI Code Review",
      description: "Automated security scanning, performance analysis, and code quality scoring with AI suggestions.",
      color: "purple",
      gradient: "from-purple-500/10 to-purple-500/5",
      href: `/dashboard/${projectId}/code-review`,
      badges: ["AI-Powered", "Security"],
      features: [
        "Security Vulnerability Detection",
        "Performance Analysis",
        "Code Quality Scoring (0-100)",
        "AI-Powered Suggestions",
        "Best Practice Enforcement"
      ]
    },
    {
      icon: MessageSquare,
      title: "Team Collaboration",
      description: "Real-time chat with code context, annotations, @mentions, and threaded conversations.",
      color: "green",
      gradient: "from-green-500/10 to-green-500/5",
      href: `/dashboard/${projectId}/team-chat`,
      badges: ["Live", "Real-time"],
      features: [
        "Real-time Messaging",
        "Code Snippet Sharing",
        "File Annotations",
        "@Mentions & Reactions",
        "AI Context Injection"
      ]
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        icon: "text-blue-500",
        border: "border-blue-500/20",
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        shadow: "hover:shadow-blue-500/10"
      },
      purple: {
        icon: "text-purple-500",
        border: "border-purple-500/20",
        bg: "bg-purple-500/10",
        text: "text-purple-600",
        shadow: "hover:shadow-purple-500/10"
      },
      green: {
        icon: "text-green-500",
        border: "border-green-500/20",
        bg: "bg-green-500/10",
        text: "text-green-600",
        shadow: "hover:shadow-green-500/10"
      },
      orange: {
        icon: "text-orange-500",
        border: "border-orange-500/20",
        bg: "bg-orange-500/10",
        text: "text-orange-600",
        shadow: "hover:shadow-orange-500/10"
      },
      red: {
        icon: "text-red-500",
        border: "border-red-500/20",
        bg: "bg-red-500/10",
        text: "text-red-600",
        shadow: "hover:shadow-red-500/10"
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="container mx-auto p-6 space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Platform Features
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to build better software, faster. AI-powered tools for modern development teams.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Core Features</h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Available Now
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreFeatures.map((feature) => {
            const colors = getColorClasses(feature.color)
            const Icon = feature.icon
            
            return (
              <Card 
                key={feature.title} 
                className={`group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg ${colors.shadow} hover:-translate-y-1`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} ${colors.icon}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex gap-2">
                      {feature.badges.map(badge => (
                        <Badge key={badge} variant="outline" className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}>
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-4">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Link href={feature.href}>
                    <Button variant="ghost" className="w-full justify-between group/btn">
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Advanced Features</h2>
          <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Tier 1
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tier1Features.map((feature) => {
            const colors = getColorClasses(feature.color)
            const Icon = feature.icon
            const isComingSoon = feature.badges.includes("Coming Soon")
            
            return (
              <Card 
                key={feature.title} 
                className={`group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all ${!isComingSoon && `hover:shadow-lg ${colors.shadow} hover:-translate-y-1`} ${isComingSoon && 'opacity-75'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 ${!isComingSoon && 'group-hover:opacity-100'} transition-opacity`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} ${colors.icon}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {feature.badges.map(badge => (
                        <Badge key={badge} variant="outline" className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}>
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-4">{feature.title}</CardTitle>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <ul className="space-y-2 text-sm">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${colors.bg} ${colors.icon} mt-0.5`}>
                          <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        </div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isComingSoon ? (
                    <Link href={feature.href}>
                      <Button variant="ghost" className="w-full justify-between group/btn">
                        Explore
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/5 to-primary/0 p-12 text-center">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative space-y-4">
          <h2 className="text-3xl font-bold">Ready to boost your team&apos;s productivity?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started with GitWit today and transform the way your team builds software.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/create">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
