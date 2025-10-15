# Quick Testing Guide: Duplicate Project Prevention

## 🧪 Test Scenarios

### Test 1: Duplicate Project Name ❌

**Steps:**
1. Go to `/create` page
2. Create first project:
   - Name: `My Test Project`
   - Repo: `https://github.com/user/repo-one`
   - Click "Launch workspace"
   - ✅ Should succeed

3. Go back to `/create` page
4. Try to create second project:
   - Name: `My Test Project` (same name)
   - Repo: `https://github.com/user/repo-two` (different repo)
   - Click "Launch workspace"
   - ❌ Should fail with error

**Expected Error:**
```
🔴 Project name already exists

A project with the name "My Test Project" already exists. 
Please choose a different name.
```

**Verify:**
- [ ] Error toast appears
- [ ] Loading toast is dismissed
- [ ] Error message is clear
- [ ] Error lasts 6 seconds
- [ ] User stays on create page

---

### Test 2: Duplicate Repository URL ❌

**Steps:**
1. Ensure you have a project with repo `https://github.com/user/my-repo`
2. Go to `/create` page
3. Try to create new project:
   - Name: `Different Name`
   - Repo: `https://github.com/user/my-repo` (same as existing)
   - Click "Launch workspace"
   - ❌ Should fail with error

**Expected Error:**
```
🔴 Repository already connected

A project accessing this repository already exists. 
Repository: https://github.com/user/my-repo
```

**Verify:**
- [ ] Error toast appears
- [ ] Loading toast is dismissed
- [ ] Error shows the duplicate repo URL
- [ ] Error lasts 6 seconds
- [ ] User stays on create page

---

### Test 3: Both Name AND Repo Duplicate ❌

**Steps:**
1. Ensure you have: "Project A" → `https://github.com/user/repo`
2. Try to create:
   - Name: `Project A` (duplicate)
   - Repo: `https://github.com/user/repo` (duplicate)
   - Click "Launch workspace"

**Expected Error:**
```
🔴 Project name already exists

A project with the name "Project A" already exists. 
Please choose a different name.
```

**Note:** Name check happens first, so you'll see the name error

**Verify:**
- [ ] Shows name duplicate error (not repo error)
- [ ] Only one error appears

---

### Test 4: Successful Creation ✅

**Steps:**
1. Go to `/create` page
2. Create project:
   - Name: `Unique Project Name`
   - Repo: `https://github.com/user/unique-repo`
   - Click "Launch workspace"

**Expected Success:**
```
✓ Workspace launched successfully!

Your project is ready. Redirecting to dashboard...
```

**Verify:**
- [ ] Loading toast appears
- [ ] Success toast appears
- [ ] Redirects to dashboard after 1 second
- [ ] New project appears in dashboard

---

### Test 5: Reusing Deleted Project Name/Repo ✅

**Steps:**
1. Create project "Temp Project" → `https://github.com/user/temp`
2. Delete the project from dashboard
3. Go back to `/create`
4. Create new project:
   - Name: `Temp Project` (same as deleted)
   - Repo: `https://github.com/user/temp` (same as deleted)
   - ✅ Should succeed

**Expected:** Success! Deleted projects don't count as duplicates

**Verify:**
- [ ] Project created successfully
- [ ] No duplicate errors
- [ ] Redirects to dashboard

---

### Test 6: Case Sensitivity 📝

**Current Behavior (Case Sensitive):**
1. Create "MyProject" → repo A
2. Create "myproject" → repo B
3. ✅ Both should succeed (different names)

**Verify:**
- [ ] "MyProject" and "myproject" are treated as different
- [ ] No duplicate error appears

**Note:** Case-insensitive checking is not implemented (future enhancement)

---

### Test 7: Invalid GitHub URL ❌

**Steps:**
1. Try to create project:
   - Name: `Test`
   - Repo: `github.com/user/repo` (missing https://)
   - Click "Launch workspace"

**Expected Error:**
```
🔴 Invalid GitHub URL

Please enter a valid GitHub repository URL 
(e.g., https://github.com/owner/repo)
```

**Verify:**
- [ ] Client-side validation catches it
- [ ] No server request made
- [ ] Clear error message

---

### Test 8: Multi-User Scenario ✅

**Steps:**
1. **User A** creates "Shared Name" → repo A
2. **User B** creates "Shared Name" → repo B
3. ✅ Both should succeed

**Expected:** Each user can use same name/repo independently

**Verify:**
- [ ] No cross-user validation
- [ ] Both projects exist separately
- [ ] Each user only sees their own project

---

## 🎯 Quick Validation Checklist

Before marking complete, verify all of these:

### Error Messages
- [ ] Duplicate name error shows correct project name
- [ ] Duplicate repo error shows correct repository URL
- [ ] Error toasts last 6 seconds
- [ ] Loading toast is dismissed before error shows
- [ ] Console logs errors for debugging

### Success Flow
- [ ] Success toast appears
- [ ] Redirects to dashboard after 1 second
- [ ] New project appears in project list
- [ ] All project data is correct

### Edge Cases
- [ ] Deleted projects don't block new creations
- [ ] Case sensitivity works as expected
- [ ] Invalid URLs caught before server request
- [ ] Network errors handled gracefully

### User Experience
- [ ] Error messages are clear and actionable
- [ ] No confusing technical jargon
- [ ] User stays on create page after error
- [ ] Form data is preserved after error

---

## 🐛 Common Issues & Solutions

### Issue: Error doesn't appear
**Check:**
- Is the loading toast being dismissed?
- Check browser console for errors
- Verify TRPC mutation is being called

### Issue: Wrong error message
**Check:**
- Backend error message format
- Error message parsing logic
- Console.log the raw error

### Issue: Page redirects on error
**Check:**
- Ensure error handler doesn't call router.push
- Verify onError block is executing

### Issue: Can create duplicate anyway
**Check:**
- Database connection
- Backend validation is running
- Check Prisma queries are correct

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Test 1: Duplicate Name
- Status: ✅ Pass / ❌ Fail
- Notes: 

### Test 2: Duplicate Repo  
- Status: ✅ Pass / ❌ Fail
- Notes:

### Test 3: Both Duplicates
- Status: ✅ Pass / ❌ Fail  
- Notes:

### Test 4: Success
- Status: ✅ Pass / ❌ Fail
- Notes:

### Test 5: Deleted Project Reuse
- Status: ✅ Pass / ❌ Fail
- Notes:

### Test 6: Case Sensitivity
- Status: ✅ Pass / ❌ Fail
- Notes:

### Test 7: Invalid URL
- Status: ✅ Pass / ❌ Fail
- Notes:

### Test 8: Multi-User
- Status: ✅ Pass / ❌ Fail
- Notes:

## Overall Result: ✅ All Pass / ❌ Issues Found

### Issues Found:
1. 
2. 
3. 

### Recommended Actions:
1. 
2. 
```

---

## 🚀 Ready to Test!

Start with Test 1 and work your way through. Take screenshots of error messages for documentation.
