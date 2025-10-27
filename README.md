<div align="center">
  
# 🚀 GitWit

### AI-Powered Development Collaboration Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.6-2596be?style=for-the-badge&logo=trpc)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Transform your development workflow with AI-powered code reviews, real-time analytics, intelligent team chat, and automated meeting insights.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [License](#-license)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
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

##  License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
