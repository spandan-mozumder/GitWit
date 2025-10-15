# 🎯 Quick Start Guide - New Features

## Feature 1: 💡 Brainstorming

### Access:
- Sidebar → "Brainstorming" (with AI badge)
- Dashboard → "Feature Brainstorming" card

### How to Use:
1. **Generate Ideas**
   - Type what you want: "Add user authentication" or "Improve performance"
   - Click "Generate Ideas"
   - Wait 10-15 seconds
   - Get 5 detailed feature ideas

2. **Review Ideas**
   - Each idea shows:
     - Complexity (color-coded)
     - Time estimate
     - Tech stack needed
     - User stories
     - Implementation steps

3. **Manage Ideas**
   - Vote (thumbs up)
   - Change status (Idea → Planned → In Progress → Done)
   - Create GitHub Issue
   - Delete unwanted ideas

4. **Filter & Search**
   - Filter by status
   - Filter by category
   - Sort by votes/priority

---

## Feature 2: 🗂️ Code Browser

### Access:
- Sidebar → "Code Browser" (with New badge)
- Dashboard → "Code Browser" card

### How to Use:

#### Tab 1: File Explorer
1. **Browse Files**
   - Click folders to expand
   - Click files to view code
   - Search using search bar

2. **View Code**
   - Syntax highlighted
   - Line numbers
   - Scrollable
   - Multiple languages supported

#### Tab 2: Pull Requests
1. **Sync PRs**
   - Click "Sync Pull Requests"
   - Loads all open/closed/merged PRs

2. **Analyze PR**
   - Click "AI Analyze" on any PR
   - Get:
     - Quality score (0-100)
     - Risk level
     - AI summary
     - File-by-file analysis

3. **Review Changes**
   - Click PR to expand
   - See all changed files
   - View additions/deletions
   - Read AI insights per file

---

## Feature 3: 🔍 Enhanced Code Review

### Access:
- Sidebar → "Code Review"
- Dashboard → "AI Code Review" card

### What Changed:

#### Old Way:
```
Branch: [type "main"]
Commit: [type "abc123..."]
```

#### New Way:
```
Branch: [Select from dropdown ▼]
        ├─ main (Protected)
        ├─ develop
        └─ feature/new-api

Commits: [Visual picker with cards]
        ┌─────────────────────────┐
        │ ✓ Add new feature       │
        │   John Doe • 2h ago     │
        │   abc1234               │
        └─────────────────────────┘
```

### How to Use:
1. Click "Start New Review"
2. Select branch from dropdown
3. See commits load automatically
4. Search commits (by message/author)
5. Click commit card to select
6. Click "Start AI Review"
7. Get comprehensive analysis

---

## 🎨 UI Guide

### Color Coding:

**Complexity:**
- 🟢 Green = Easy
- 🟡 Yellow = Medium
- 🟠 Orange = Hard
- 🔴 Red = Very Hard

**Status:**
- 🟣 Purple = Idea
- 🔵 Blue = Planned
- 🟡 Yellow = In Progress
- 🟢 Green = Done
- 🔴 Red = Rejected

**Risk Level:**
- 🟢 Low
- 🟡 Medium
- 🟠 High
- 🔴 Critical

**PR Status:**
- 🟢 Open
- 🔴 Closed
- 🟣 Merged
- ⚪ Draft

---

## ⌨️ Keyboard Shortcuts (Coming Soon)

```
Feature Brainstorming:
- Cmd+K: Focus search
- N: New idea
- V: Vote on selected

Code Browser:
- Cmd+P: Quick file search
- Cmd+F: Search in file
- Esc: Close file

Code Review:
- Cmd+N: New review
- Enter: Select commit
```

---

## 💡 Pro Tips

### Brainstorming:
- Be specific in your request for better ideas
- Vote on ideas before creating GitHub issues
- Use tags for categorization
- Track status to see what's being worked on

### Code Browser:
- Sync PRs regularly to stay updated
- Run AI analysis on large PRs to save time
- Use search to find specific commits
- Check risk level before merging

### Code Review:
- Use branch selector instead of typing
- Search commits by author to find your work
- Review commit message before selecting
- Check commit date to ensure it's recent

---

## 🐛 Troubleshooting

### "No branches found"
- Check GitHub token permissions
- Verify repository URL is correct
- Make sure you're connected to internet

### "Failed to generate ideas"
- Check project has commit history
- Verify Gemini API key is set
- Try with simpler request first

### "PR sync failed"
- Ensure GitHub token has PR access
- Check repository exists
- Verify rate limits not exceeded

### Code not displaying
- Check file size (very large files may fail)
- Verify file is text (not binary)
- Try refreshing the page

---

## 📊 Analytics Dashboard

After using these features, check Analytics to see:
- Time saved on feature planning
- PR review efficiency
- Code review coverage
- Team collaboration metrics

---

## 🎓 Learning Path

### Week 1: Get Familiar
- Generate 5 feature ideas
- Browse your codebase
- Create 1 code review with new picker

### Week 2: Integrate Workflow
- Vote on team's ideas
- Create GitHub issues from ideas
- Analyze PRs before reviewing
- Use commit picker for all reviews

### Week 3: Advanced Usage
- Track feature status through lifecycle
- Compare PR quality scores
- Identify code hotspots
- Optimize team velocity

---

## 🚀 Next Steps

1. **Try Brainstorming First**
   - Most visual and impactful
   - Immediate value
   - Easy to understand

2. **Explore Code Browser**
   - Familiarize with repo structure
   - Try PR analysis on open PRs
   - See AI summaries in action

3. **Use Enhanced Review**
   - Next code review, use new picker
   - Compare with old manual method
   - Notice time saved

---

## 📈 Success Metrics to Track

- Ideas generated per week
- Ideas converted to GitHub issues
- PRs analyzed vs. manual reviews
- Time saved per code review
- Team voting participation

---

**Happy Coding! 🎉**

Questions? Check IMPLEMENTATION_SUMMARY.md for technical details.
