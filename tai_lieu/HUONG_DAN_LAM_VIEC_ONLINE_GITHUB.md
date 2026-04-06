# 🌐 Hướng Dẫn Làm Việc Nhóm Online với GitHub

**Ngày tạo:** 06/04/2026
**Version:** 1.0

---

## 📌 Tổng Quan

Dự án AI CDSS BHYT bây giờ hỗ trợ **làm việc nhóm hoàn toàn online** thông qua:

- ✅ GitHub version control
- ✅ GitHub Actions CI/CD
- ✅ GitHub Issues & Discussions
- ✅ Pull Requests review
- ✅ Development Containers (Dev Containers)
- ✅ Live collaboration workspace

---

## 🚀 Setup Nhanh (5 phút)

### **Bước 1: Fork & Clone**

```bash
# 1. Vào https://github.com/htthinh28/ung-dung-cdss-bhyt
# 2. Click "Fork" button
# 3. Clone fork của bạn
git clone https://github.com/YOUR_USERNAME/ung-dung-cdss-bhyt.git
cd ung_dung_cdss_bhyt
```

### **Bước 2: Setup Dev Environment (Chọn 1 cách)**

**Cách A: VS Code Dev Container (Recommended)**
```
1. Cài đặt VS Code
2. Cài đặt extension: "Dev Containers"
3. Mở folder này trong VS Code
4. Click "Reopen in Container"
5. Chờ setup tự động (~5 phút)
```

**Cách B: Manual Setup**
```bash
# Node
npm install --legacy-peer-deps

# Python
python -m venv venv
venv\Scripts\activate
pip install -r python_service/requirements.txt
```

### **Bước 3: Chạy Ứng Dụng**

```bash
# Terminal 1
npm start

# Terminal 2
python -m uvicorn python_service.app.main:app --reload
```

**Truy cập:** http://localhost:8080

---

## 👥 Quy Trình Làm Việc Nhóm

### **Scenario: Bạn muốn thêm tính năng mới**

#### 1️⃣ **Tạo Issue**
```
Vào: https://github.com/htthinh28/ung-dung-cdss-bhyt/issues
Click: "New Issue"
Chọn: "Feature request"
Mô tả: Tính năng bạn muốn làm
Label: enhancement
Assignee: Chính bạn
```

#### 2️⃣ **Tạo Branch**
```bash
git checkout -b feature/issue-123-feature-name
# Ví dụ: git checkout -b feature/123-add-new-audit-rule
```

#### 3️⃣ **Code & Commit**
```bash
# Cập nhật code
nano ma_nguon/new_file.jsx

# Commit (tuân theo Conventional Commits)
git add .
git commit -m "feat(audit): add new antibiotic detection rule"
```

#### 4️⃣ **Push & Tạo PR**
```bash
git push origin feature/123-add-new-audit-rule
```

Sau đó trên GitHub:
- Click "Compare & pull request"
- Fill PR template
- Link đến issue: `Fixes #123`
- Click "Create pull request"

#### 5️⃣ **Code Review**
```
Reviewers sẽ:
✓ Kiểm tra code
✓ Chạy CI/CD tests tự động
✓ Comment hoặc approve
✓ Merge sau khi approve
```

#### 6️⃣ **Tracking**
```
Trên GitHub Issues:
- Issue sẽ tự động close khi PR merge
- Assignees nhận notification
- Labels tự động update
```

---

## 🔄 GitHub Actions (CI/CD Tự Động)

Mọi khi bạn push, GitHub sẽ tự động:

### **Test & Build**
```yaml
✅ npm install
✅ npm lint
✅ Python tests
✅ Code quality scan
```

### **View Results**
```
Vào: GitHub repo → "Actions" tab
Xem: Workflow status
Check: Build logs
```

### **Deployment**
```
Khi merge vào main:
1. Chạy full test suite
2. Tạo release artifact
3. Comment trên commit
4. Ready để deploy
```

---

## 💬 Collaboration Features

### **Issues (Nhận việc)**

```
Vào Issues tab → Filter by:
- "good first issue" - Cho người mới
- "help wanted" - Cần assistance
- Assign to yourself
```

### **Discussions (Thảo luận)**

```
Vào Discussion tab → Create:
- Ideas: Ý tưởng mới
- Q&A: Hỏi đáp
- Announcements: Thông báo chính thức
```

### **Draft PRs (Nháp)**

```
Không ready merge?
1. Tạo PR như bình thường
2. Click "Convert to draft"
3. Sau khi ready: "Mark ready for review"
```

### **Code Reviews**

```
Khi review PR:
1. Click "Files changed"
2. Hover trên line cần comment
3. Click + icon → "Start review"
4. Click "Approve" hoặc "Request changes"
```

---

## 📊 Real-Time Collaboration

### **Sync Mới Nhất từ Main**

Trước khi push, lấy code mới nhất:

```bash
# Fetch updates
git fetch origin main

# Check differences
git diff main..HEAD

# Merge nếu cần
git pull origin main
```

---

### **Conflict Resolution**

Nếu merge conflict:

```bash
# Git sẽ đánh dấu conflict
git status

# Mở file, fix conflict, sau đó:
git add .
git commit -m "fix: resolve merge conflict"
git push origin branch-name
```

---

## 🎯 Best Practices

### ✅ DO:
- ✓ Tạo issues trước code
- ✓ 1 branch = 1 tính năng
- ✓ Commit messages rõ ràng
- ✓ Pull latest trước push
- ✓ Test trước push
- ✓ Cross-review code

### ❌ DON'T:
- ✗ Push trực tiếp vào main
- ✗ Commit secrets (.env, keys)
- ✗ Large files (>100MB)
- ✗ Merge conflict không resolve
- ✗ Skip tests
- ✗ Commit messy code

---

## 🔐 Permissions & Access

### **Read Access** (Có thể clone & PR)
```
Vào: Settings → Manage access
Click "Add people"
Role: "Contributor"
```

### **Write Access** (Có thể push & merge)
```
Người official team → cấp write access
Merge only thông qua approved PR
```

### **Admin Access** (Quản lý settings)
```
Project owner & core maintainers
```

---

## 📱 GitHub Mobile

Quản lý project từ điện thoại:

- Tải **GitHub Mobile app**
- Login với GitHub account
- View issues, PRs, notifications
- Comment & review on-the-go

---

## 🌍 Remote Development (Online IDE)

### **GitHub Codespaces** (Recommended)

```
1. Vào repo → Code button
2. Choose "Codespaces"
3. Click "Create codespace on main"
4. Wait ~2 min for setup
5. Full VS Code in browser!
```

**Lợi ích:**
- ✅ Dev environment không cần cài local
- ✅ Sync với repo tự động
- ✅ Access từ bất kỳ máy
- ✅ Powerful computing

### **Gitpod** (Alternative)

```
Prepend "gitpod.io/#/" vào URL:
https://gitpod.io/#/https://github.com/htthinh28/ung-dung-cdss-bhyt
```

---

## 📈 Project Board (Kanban)

Organize work với GitHub Projects:

```
Vào: Projects tab
Create new → "Kanban"
Add Issues as cards
Drag-drop stages:
  📝 Backlog
  🔨 In Progress
  👀 In Review
  ✅ Done
```

---

## 🔔 Notifications

### **Stay Updated:**

```
Vào: Settings (⚙️) → Notifications
Choose:
- Issues mention you
- PR review requested
- Merged PRs
- Workflow runs
```

### **Unsubscribe:**

```
PR/Issue > Unwatch
Email >Manage subscription
```

---

## 📝 Status Board Template

### **Weekly Standup (bạn có thể dùng)**

```markdown
## Week of 06/04/2026

### Completed ✅
- [ ] Task 1
- [ ] Task 2

### In Progress 🔨
- [ ] Task 3
- [ ] Task 4

### Blocked 🚫
- Issue: ...
- Needed: ...

### Next Week 📅
- [ ] Task 5
- [ ] Task 6
```

---

## 🎓 Resources

- **GitHub Docs**: https://docs.github.com
- **Conventional Commits**: https://www.conventionalcommits.org
- **Git Cheatsheet**: https://git-scm.com/cheatsheet
- **Dev Containers**: https://containers.dev

---

## 🆘 Help

Vấn đề? Click liên kết:

1. **GitHub Docs**: https://docs.github.com/en/issues
2. **Community**: Ask in Discussions tab
3. **Issues**: Create bug report
4. **Email**: Contact maintainers

---

## ✅ Checklist Ngày Đầu

- [ ] Fork & clone repo
- [ ] Setup dev environment
- [ ] Read CONTRIBUTING.md
- [ ] Test run locally
- [ ] Create first issue
- [ ] Create first branch
- [ ] Make first commit
- [ ] Create first PR
- [ ] Review & merge

---

**🎉 Chào mừng bạn vào team!**

Let's build **AI CDSS BHYT** together! 🚀
