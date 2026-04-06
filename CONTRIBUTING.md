# 🤝 Hướng Dẫn Đóng Góp (CONTRIBUTING)

Cảm ơn bạn quan tâm đến dự án **AI CDSS BHYT**! 🙏

Tài liệu này cung cấp hướng dẫn về cách đóng góp cho dự án.

## 📋 Yêu Cầu Trước Khi Bắt Đầu

- Node.js ≥ 18.0
- Python ≥ 3.8
- Git
- GitHub account

## 🚀 Bắt Đầu Nhanh

### 1. Fork Repository

```bash
# Trên GitHub UI, click "Fork" button
# Hoặc dùng GitHub CLI
gh repo fork HttphinH28/ung-dung-cdss-bhyt --clone
```

### 2. Clone Fork Của Bạn

```bash
git clone https://github.com/YOUR_USERNAME/ung-dung-cdss-bhyt.git
cd ung_dung_cdss_bhyt
```

### 3. Tạo Branch Mới

```bash
git checkout -b feature/my-feature
# hoặc
git checkout -b fix/my-bug-fix
```

### 4. Setup Dev Environment

```bash
# Node.js
npm install --legacy-peer-deps

# Python
python -m venv venv
venv\Scripts\activate  # Windows
# hoặc: source venv/bin/activate  # Linux/Mac
pip install -r python_service/requirements.txt pip install pytest black pylint
```

### 5. Dev Container (Recommended)

Dùng VS Code Dev Containers để setup tự động:

1. Install VS Code
2. Install "Remote - Containers" extension
3. Open folder trong VS Code
4. Click "Reopen in Container"

## 💻 Development Workflow

### 1. Chạy Ứng Dụng Locally

**Terminal 1 - Express Server:**
```bash
npm start
# hoặc: node server.js
```

**Terminal 2 - Python API:**
```bash
venv\Scripts\activate
python -m uvicorn python_service.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Truy cập:** http://localhost:8080

### 2. Code Style & Linting

**Frontend (JavaScript/JSX):**
```bash
npm run lint
npx prettier --write src/
```

**Backend (Python):**
```bash
black python_service/
pylint python_service/
```

### 3. Testing

**Frontend:**
```bash
npm test
```

**Backend:**
```bash
pytest python_service/tests/ -v --cov
```

## 📝 Commit Messages

Tuân theo Conventional Commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` - Tính năng mới
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code formatting (không thay đổi logic)
- `refactor:` - Code restructure
- `test:` - Thêm/cập nhật tests
- `chore:` - Build, dependencies, etc

**Examples:**
```
feat(audit): add antibiotic case detection
fix(server): resolve port 8080 conflict on startup
docs(api): update endpoint documentation
refactor(rules): simplify validation logic
```

## 🔄 Pull Request Process

### 1. Commit & Push

```bash
git add .
git commit -m "feat(feature-name): description"
git push origin feature/my-feature
```

### 2. Create Pull Request

Trên GitHub:
1. Chọn "Compare & pull request"
2. Fill PR template
3. Click "Create pull request"

### 3. Wait for Review

- Requests changes? → Commit & push thêm
- Approved? → Ready to merge
- Conflicts? → Resolve & push

### 4. Merge

Maintainer sẽ merge PR sau khi:
- ✅ CI/CD tests pass
- ✅ Code review approved
- ✅ No conflicts with main

## 🧪 Testing Guidelines

### Coverage Targets
- **Frontend**: 70%+
- **Backend**: 80%+

### Test Structure
```python
# python_service/tests/test_audit.py
def test_audit_valid_case():
    """Test audit logic with valid case"""
    result = audit_function(valid_data)
    assert result['status'] == 'pass'

def test_audit_invalid_case():
    """Test audit logic with invalid case"""
    result = audit_function(invalid_data)
    assert result['status'] == 'fail'
```

## 📚 Documentation

Luôn update documentation khi:
- Thêm tính năng mới
- Thay đổi API
- Thay đổi quy trình

**Files cần update:**
- `README.md` - Project overview
- `tai_lieu/` - Knowledge base
- Code comments - Cho complex logic

## 🐛 Reporting Bugs

Dùng [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md):

1. Click "Issues" tab
2. Click "New Issue"
3. Chọn "Bug report"
4. Fill template completely

## 💡 Feature Requests

Dùng [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md):

1. Click "Issues" tab
2. Click "New Issue"
3. Chọn "Feature request"
4. Mô tả tính năng chi tiết

## 🎓 Development Tips

### Code Organization
```
ma_nguon/
├── tien_ich/          # UI components
│   ├── index.js
│   └── *.jsx
└── ...

python_service/
├── app/
│   ├── main.py        # Entry point
│   ├── models/        # Data models
│   ├── routes/        # API endpoints
│   └── services/      # Business logic
└── tests/
```

### Common Tasks

**Add new API endpoint:**
```python
# python_service/app/routes/new_route.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/new", tags=["new"])

@router.post("/endpoint")
async def new_endpoint(data: InputModel):
    """Endpoint description"""
    return {"result": "success"}
```

**Add new React component:**
```jsx
// ma_nguon/tien_ich/NewComponent.jsx
export default function NewComponent({props}) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## 🔐 Security

- **Never commit secrets** (.env, API keys, etc)
- Use `.env.example` for shared config
- Validate all user inputs
- Report security issues privately

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `npm install` fails | Use `--legacy-peer-deps` |
| Port 8080 in use | `set PORT=9000` then `npm start` |
| Python venv not working | Check activation command for your OS |
| Git conflicts | Merge main: `git pull origin main` |

## 📞 Support

- **Docs**: Check `tai_lieu/` folder
- **Issues**: Search GitHub issues first
- **Discussions**: Create GitHub discussion
- **Chat**: Mention maintainers in issues

## ✅ Checklist Trước Submit

- [ ] Code follows style guide
- [ ] Tests pass locally (`npm test` & `pytest`)
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No hardcoded secrets
- [ ] PR template filled
- [ ] Ready to merge?

## 🎉 Thank You!

Cảm ơn bạn đã đóng góp cho dự án! 🙌

---

**Happy coding!** 🚀
