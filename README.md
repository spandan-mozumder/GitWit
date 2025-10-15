<div align="center">
  
# 🚀 GitWit

### AI-Powered Development Collaboration Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.6-2596be?style=for-the-badge&logo=trpc)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Transform your development workflow with AI-powered code reviews, real-time analytics, intelligent team chat, and automated meeting insights.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Usage Guide](#-usage-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**GitWit** is a comprehensive development collaboration platform that combines the power of AI with modern development tools. Built for teams who want to ship faster, collaborate smarter, and maintain code quality without sacrificing velocity.

### Why GitWit?

- 🤖 **AI-First Approach**: Leverages Google Gemini for intelligent code analysis and insights
- 📊 **Real-Time Analytics**: Live GitHub repository metrics and DORA metrics tracking
- 🔍 **Smart Code Reviews**: Automated security scanning and code quality analysis
- 💬 **Context-Aware Chat**: Team collaboration with code snippets and syntax highlighting
- 🎙️ **Meeting Intelligence**: AI-powered transcription and action item extraction
- ⚡ **Lightning Fast**: Built on Next.js 15 with Turbopack for instant HMR

---

## ✨ Features

### 🎯 Tier 1: Core Features

#### 📊 Advanced Analytics Dashboard
- **Real-time GitHub Integration**: Live commit, PR, and contributor stats
- **DORA Metrics**: Deployment frequency, lead time, MTTR, change failure rate
- **Code Hotspots**: Identify high-risk files based on change frequency
- **Developer Leaderboard**: Track team contributions and performance
- **Velocity Trends**: Visualize daily commit and code change patterns
- **Risk Scoring**: Automated calculation of code risk based on multiple factors

#### 🔍 AI-Powered Code Review
- **Static Code Analysis**: Real-time security vulnerability detection
- **Security Scanning**: 
  - `eval()` usage detection (Critical)
  - Hardcoded credentials detection (Critical)
  - API key exposure (High)
  - Console.log in production (Low)
- **Code Quality Checks**:
  - Large function detection
  - Missing error handling
  - TODO/FIXME tracking
- **Smart Suggestions**: AI-generated improvement recommendations
- **Score Tracking**: Security, performance, and maintainability scores
- **Detail Views**: Comprehensive analysis with severity grouping

#### 💬 Team Collaboration Chat
- **Real-Time Messaging**: 3-second polling for instant updates
- **Code Snippet Sharing**: 
  - 22+ language syntax highlighting
  - Theme-aware (VS Code Dark/Light)
  - Line numbers and language badges
- **File Attachments**: Images, PDFs, documents with preview
- **Emoji Support**: 64+ emojis with quick picker
- **Message Reactions**: Click reactions with count tracking
- **Thread Replies**: Organized conversation threads
- **AI Context Injection**: Intelligent code context for messages

### 🎯 Tier 2: Advanced Features

#### 🎙️ Meeting Management
- **AI Transcription**: AssemblyAI-powered meeting transcription
- **Action Item Extraction**: Automatic task detection from meetings
- **Summary Generation**: AI-created meeting summaries
- **Audio Processing**: Support for multiple audio formats
- **Meeting History**: Searchable archive of all meetings

#### 📚 Documentation Generation
- **AI-Powered Docs**: Auto-generate documentation from code
- **RAG Integration**: Langchain-based retrieval augmented generation
- **Code Embeddings**: Supabase vector storage for semantic search
- **Markdown Support**: Full markdown editing and preview
- **Version Control**: Track documentation changes

### 🎯 Tier 3: Productivity Features

#### ⌨️ Keyboard Shortcuts
- **Global Shortcuts**: `⌘K` (quick nav), `⌘/` (shortcuts help), `Esc` (close modals)
- **Team Chat**: `⌘⇧C` (code snippet), `⌘⇧U` (file upload)
- **Dashboard**: `⌘N` (new project)
- **Analytics**: `⌘R` (refresh), `⌘E` (export)
- **Code Review**: `⌘N` (new review), `⌘F` (filter)
- **Help Modal**: Comprehensive shortcuts guide with `?` or `⌘/`

#### 🎨 User Interface
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach, works on all devices
- **Sidebar Navigation**: Collapsible sidebar with quick access
- **Breadcrumb Navigation**: Clear page hierarchy
- **Quick Navigation**: Tab-based feature switcher
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Graceful error states with retry options

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15.5](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **State Management**: [TanStack Query](https://tanstack.com/query) - Async state management
- **Forms**: [React Hook Form](https://react-hook-form.com/) - Performant forms
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **Code Highlighting**: [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting

### Backend
- **API Layer**: [tRPC 11.6](https://trpc.io/) - End-to-end type-safe APIs
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) - Serverless Postgres
- **ORM**: [Prisma 6.17](https://www.prisma.io/) - Type-safe database client
- **Authentication**: [Clerk](https://clerk.com/) - User management and auth
- **File Storage**: [Supabase Storage](https://supabase.com/) - Object storage
- **Vector DB**: [Supabase Vector](https://supabase.com/vector) - Embeddings storage

### AI & Integrations
- **AI Models**: 
  - [Google Gemini](https://ai.google.dev/) - Code analysis and generation
  - [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration framework
- **Transcription**: [AssemblyAI](https://www.assemblyai.com/) - Speech-to-text
- **Version Control**: [Octokit](https://octokit.github.io/) - GitHub API client
- **RAG**: [LangChain](https://www.langchain.com/) - LLM orchestration
- **Embeddings**: [Google AI](https://ai.google.dev/) - Text embeddings

### DevOps
- **Build Tool**: [Turbopack](https://turbo.build/pack) - Fast bundler
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Linting**: [ESLint 9](https://eslint.org/) - Code quality
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm with `--legacy-peer-deps`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **PostgreSQL**: Database (or use Neon)
- **GitHub Account**: For repository integration
- **API Keys**: See [Environment Variables](#-environment-variables)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/spandan-mozumder/GitWit.git
cd GitWit
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your API keys (see [Environment Variables](#-environment-variables))

4. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

### Quick Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate  # Generate Prisma Client
```

---

## 📁 Project Structure

```
GitWit/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (protected)/          # Protected routes
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   │   ├── [projectId]/  # Project-specific pages
│   │   │   │   │   ├── analytics/        # Analytics dashboard
│   │   │   │   │   ├── code-review/     # Code review pages
│   │   │   │   │   ├── team-chat/       # Team chat
│   │   │   │   │   ├── meetings/        # Meeting management
│   │   │   │   │   └── qa/             # Q&A section
│   │   │   ├── billing/          # Billing pages
│   │   │   ├── create/           # Project creation
│   │   │   └── features/         # Feature showcase
│   │   ├── api/                  # API routes
│   │   │   ├── trpc/            # tRPC endpoint
│   │   │   ├── webhook/         # Webhook handlers
│   │   │   └── process-meeting/ # Meeting processing
│   │   ├── sign-in/             # Authentication pages
│   │   ├── sign-up/
│   │   └── components/          # Shared components
│   ├── components/              # React components
│   │   ├── ui/                  # UI primitives (shadcn/ui)
│   │   ├── keyboard-shortcuts-modal.tsx
│   │   ├── project-breadcrumb.tsx
│   │   ├── quick-nav.tsx
│   │   └── empty-project-state.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-keyboard-shortcuts.ts
│   │   ├── use-mobile.ts
│   │   ├── use-project.ts
│   │   └── use-refetch.ts
│   ├── lib/                     # Utility libraries
│   │   ├── assemblyAi.ts       # AssemblyAI client
│   │   ├── gemini.ts           # Gemini AI client
│   │   ├── github.ts           # GitHub integration
│   │   ├── github-analytics.ts # GitHub analytics
│   │   ├── github-loader.ts    # GitHub data loading
│   │   ├── code-analyzer.ts    # Code analysis engine
│   │   ├── stripe.ts           # Stripe integration
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Utility functions
│   ├── server/                  # Server-side code
│   │   ├── api/
│   │   │   ├── routers/        # tRPC routers
│   │   │   │   ├── analytics.ts       # Analytics endpoints
│   │   │   │   ├── codeReview.ts      # Code review endpoints
│   │   │   │   ├── teamChat.ts        # Chat endpoints
│   │   │   │   ├── meetingsEnhanced.ts # Meeting endpoints
│   │   │   │   ├── documentation.ts   # Docs endpoints
│   │   │   │   └── project.ts         # Project endpoints
│   │   │   ├── root.ts         # Root router
│   │   │   └── trpc.ts         # tRPC config
│   │   └── db.ts               # Database client
│   ├── trpc/                   # tRPC client setup
│   │   ├── query-client.ts
│   │   ├── react.tsx
│   │   └── server.ts
│   ├── env.js                  # Environment validation
│   └── middleware.ts           # Auth middleware
├── .env                        # Environment variables
├── .env.example                # Environment template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# GitHub Integration
GITHUB_ACCESS_TOKEN="ghp_..."

# Google AI (Gemini)
GEMINI_API_KEY="AIza..."

# AssemblyAI
ASSEMBLYAI_API_KEY="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Stripe (Optional - for billing)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Getting API Keys

1. **Database (Neon)**: https://neon.tech/
2. **Clerk**: https://clerk.com/
3. **GitHub**: https://github.com/settings/tokens
4. **Google AI**: https://ai.google.dev/
5. **AssemblyAI**: https://www.assemblyai.com/
6. **Supabase**: https://supabase.com/
7. **Stripe**: https://stripe.com/

---

## 🗄️ Database Setup

### Using Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy connection string to `DATABASE_URL`
4. Run migrations:
```bash
npx prisma migrate dev
```

### Local PostgreSQL

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE gitwit;
```
3. Update `DATABASE_URL` in `.env`
4. Run migrations:
```bash
npx prisma migrate dev
```

### Prisma Studio

Explore your database visually:
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

---

## 📖 Usage Guide

### Creating a Project

1. Sign in with Clerk authentication
2. Click "Create New Project"
3. Enter GitHub repository URL
4. Select project settings
5. Click "Create Project"

### Using Analytics

1. Navigate to **Dashboard > [Project] > Analytics**
2. View real-time metrics:
   - Productivity summary
   - Code hotspots
   - Developer leaderboard
   - Velocity trends
   - DORA metrics
3. Press `⌘R` to refresh data
4. Press `⌘E` to export report

### Running Code Reviews

1. Go to **Dashboard > [Project] > Code Review**
2. Click "New Review" or press `⌘N`
3. Select branch and commit
4. Wait for AI analysis
5. View findings by severity
6. Review suggestions
7. Click on a review to see full details

### Team Chat

1. Open **Dashboard > [Project] > Team Chat**
2. Send messages with:
   - **Text**: Type and press Enter
   - **Code**: Press `⌘⇧C`, select language, paste code
   - **Files**: Press `⌘⇧U` or click paperclip
   - **Emojis**: Click smile icon, select emoji
3. React to messages: Hover and click "React"
4. View code with syntax highlighting

### Processing Meetings

1. Navigate to **Dashboard > [Project] > Meetings**
2. Upload audio file (MP3, WAV, M4A)
3. Wait for AI transcription
4. Review transcript and action items
5. View AI-generated summary

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open quick navigation |
| `⌘/` / `Ctrl+/` | Show keyboard shortcuts help |
| `?` | Show shortcuts (alternative) |
| `Esc` | Close modals and dialogs |

### Team Chat

| Shortcut | Action |
|----------|--------|
| `⌘⇧C` / `Ctrl+Shift+C` | Open code snippet dialog |
| `⌘⇧U` / `Ctrl+Shift+U` | Upload file attachment |
| `Enter` | Send message |
| `Shift+Enter` | New line (in code mode) |

### Dashboard & Analytics

| Shortcut | Action |
|----------|--------|
| `⌘N` / `Ctrl+N` | Create new project/review |
| `⌘R` / `Ctrl+R` | Refresh analytics data |
| `⌘E` / `Ctrl+E` | Export analytics report |
| `⌘F` / `Ctrl+F` | Filter reviews |

**View all shortcuts**: Press `⌘/` or `?` anytime!

---

## 📚 API Documentation

### tRPC Routers

#### Analytics Router
```typescript
// Get productivity summary
trpc.analytics.getProductivitySummary.useQuery({ projectId })

// Get code hotspots
trpc.analytics.getCodeHotspots.useQuery({ projectId, daysBack: 90 })

// Get developer leaderboard
trpc.analytics.getDeveloperLeaderboard.useQuery({ projectId })

// Get velocity trends
trpc.analytics.getVelocityTrends.useQuery({ projectId, daysBack: 30 })

// Get DORA metrics
trpc.analytics.getDoraMetrics.useQuery({ projectId })
```

#### Code Review Router
```typescript
// Create code review
trpc.codeReview.createReview.useMutation()

// Get review by ID
trpc.codeReview.getReview.useQuery({ reviewId })

// Get project reviews
trpc.codeReview.getProjectReviews.useQuery({ projectId, limit: 20 })

// Apply suggestion
trpc.codeReview.applySuggestion.useMutation()
```

#### Team Chat Router
```typescript
// Send message
trpc.teamChat.sendMessage.useMutation()

// Get messages
trpc.teamChat.getMessages.useQuery({ chatId, limit: 50 })

// Add reaction
trpc.teamChat.addReaction.useMutation()

// Create annotation
trpc.teamChat.createAnnotation.useMutation()
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Make your changes**
4. **Run tests and linting**
```bash
npm run lint
npm run build
```
5. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```
6. **Push to your fork**
```bash
git push origin feature/amazing-feature
```
7. **Open a Pull Request**

### Coding Standards

- **TypeScript**: Use strict mode, proper types
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **Commits**: Conventional commits format

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization
- ⚡ Performance optimizations

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting and AI SDK
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://www.prisma.io/) for the ORM
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Google](https://ai.google.dev/) for Gemini AI
- [AssemblyAI](https://www.assemblyai.com/) for transcription
- Open source community for invaluable tools

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/spandan-mozumder/GitWit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/spandan-mozumder/GitWit/discussions)
- **Email**: support@gitwit.dev

---

## 🗺️ Roadmap

### Q4 2025
- [ ] Real-time WebSocket chat
- [ ] Custom code review templates
- [ ] Advanced analytics filters
- [ ] Team performance reports
- [ ] Mobile app (React Native)

### Q1 2026
- [ ] CI/CD integration (GitHub Actions, GitLab CI)
- [ ] Jira/Linear integration
- [ ] Slack/Discord notifications
- [ ] Custom AI model training
- [ ] Multi-repository support

### Q2 2026
- [ ] Self-hosted option
- [ ] Enterprise SSO
- [ ] Advanced security scanning
- [ ] Custom workflow automation
- [ ] API access for integrations

---

<div align="center">

### ⭐ Star us on GitHub!

If you find GitWit helpful, please consider giving us a star. It helps us reach more developers!

**Built with ❤️ by [Spandan Mozumder](https://github.com/spandan-mozumder)**

[⬆ Back to Top](#-gitwit)

</div>

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
