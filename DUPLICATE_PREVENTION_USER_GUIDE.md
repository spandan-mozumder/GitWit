# Duplicate Project Prevention - User Guide

## What This Feature Does

This feature prevents you from accidentally creating duplicate projects with the same name or connecting to the same GitHub repository multiple times.

## When You'll See These Messages

### ❌ Duplicate Project Name

**When it happens:**
You try to create a new project using a name that you've already used for another project.

**What you'll see:**
```
🔴 Project name already exists

A project with the name "My Awesome Project" already exists. 
Please choose a different name.
```

**What to do:**
Choose a different, unique name for your new project.

---

### ❌ Repository Already Connected

**When it happens:**
You try to connect a GitHub repository that's already connected to one of your existing projects.

**What you'll see:**
```
🔴 Repository already connected

A project accessing this repository already exists. 
Repository: https://github.com/yourname/your-repo
```

**What to do:**
- Use your existing project that's already connected to this repository, OR
- Connect a different GitHub repository for this new project

---

### ✅ Successful Project Creation

**When it happens:**
You create a project with a unique name and repository URL.

**What you'll see:**
```
✓ Workspace launched successfully!

Your project is ready. Redirecting to dashboard...
```

**What happens next:**
You'll be automatically redirected to your dashboard where you can start working with your new project.

---

## Examples

### Example 1: Trying to Reuse a Project Name

**Existing Projects:**
- "E-Commerce Platform" → https://github.com/user/ecommerce
- "Marketing Website" → https://github.com/user/marketing

**New Project Attempt:**
- Name: "E-Commerce Platform" ← ❌ Already exists!
- Repo: https://github.com/user/new-project

**Result:** Error message about duplicate name

**Solution:** Use a different name like "E-Commerce Platform V2" or "New E-Commerce Site"

---

### Example 2: Trying to Reconnect the Same Repository

**Existing Projects:**
- "Main App" → https://github.com/user/awesome-repo

**New Project Attempt:**
- Name: "Secondary App"
- Repo: https://github.com/user/awesome-repo ← ❌ Already connected!

**Result:** Error message about repository already connected

**Solution:** Either:
1. Use the existing "Main App" project
2. Connect a different repository

---

## Tips

💡 **Use Descriptive Names**
Make your project names descriptive and unique to avoid confusion:
- ✅ "Customer Portal 2025"
- ✅ "Blog Platform - React Version"
- ❌ "Project" (too generic)
- ❌ "Test" (likely to be reused)

💡 **One Repository Per Project**
Each GitHub repository should only be connected to one GitWit project. This ensures clean data and prevents confusion.

💡 **Deleted Projects**
If you've deleted a project, you can reuse both its name and repository URL for a new project.

---

## Technical Details

- **Validation happens:** When you click "Launch workspace"
- **Check is instant:** Done before any heavy processing starts
- **User-specific:** Other users' projects don't affect your naming
- **Case-sensitive:** "MyProject" and "myproject" are considered different names

---

## FAQ

**Q: Can I have two projects with similar names?**
A: Yes, as long as they're not identical. "Project A" and "Project A v2" are different.

**Q: What if someone else is using the same name?**
A: No problem! Each user's projects are separate. You can use the same name as another user.

**Q: Can I rename a project later?**
A: This feature depends on your application settings. Check your project settings page.

**Q: What if I deleted a project but want to use the same name again?**
A: Yes! Deleted projects don't count toward duplicates. You can reuse both the name and repository URL.

**Q: Why can't I connect the same repo to multiple projects?**
A: To maintain data integrity and prevent confusion. Each repository should have one source of truth in GitWit.

---

## Error Messages Reference

| Error Title | Cause | Solution |
|-------------|-------|----------|
| Project name already exists | You used a name that's already in use | Choose a different project name |
| Repository already connected | Repository is already linked to another project | Use the existing project or choose a different repository |
| Workspace creation failed | Other error (network, validation, etc.) | Check your input and try again |

---

## Support

If you encounter any issues with project creation:
1. Check that your GitHub URL is correctly formatted
2. Verify you're not reusing a name or repository
3. Contact support if problems persist

**Valid GitHub URL format:**
```
https://github.com/username/repository
```

**Invalid formats:**
- `github.com/username/repository` (missing https://)
- `https://github.com/username` (missing repository)
- `git@github.com:username/repository.git` (SSH format not supported in UI)
