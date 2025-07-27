# 🔐 Environment Configuration Guide

## ⚠️ **IMPORTANT SECURITY NOTICE**

**NEVER commit `.env` files to Git!** These files contain sensitive information like:
- Database passwords
- JWT secrets
- API keys
- Session secrets

## 📁 Environment Files Structure

```
cloud-ide-editor/
├── 📄 .env.example                 # Root environment template
├── 📄 .env                         # Root environment (IGNORED by Git)
├── 📂 backend/
│   ├── 📄 .env.example             # Backend environment template
│   └── 📄 .env                     # Backend environment (IGNORED by Git)
└── 📂 frontend/
    ├── 📄 .env.example             # Frontend environment template
    └── 📄 .env                     # Frontend environment (IGNORED by Git)
```

## 🛡️ Git Ignore Configuration

The `.gitignore` file is configured to ignore all `.env` files:

```gitignore
# Environment variables - NEVER commit these files!
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local

# Backend environment files
backend/.env
backend/.env.*
!backend/.env.example

# Frontend environment files
frontend/.env
frontend/.env.*
!frontend/.env.example
```

## 🚀 Quick Setup

### 1. **Root Environment Setup**
```bash
# Copy the example file
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

### 2. **Backend Environment Setup**
```bash
# Copy the backend example file
cp backend/.env.example backend/.env

# Edit with your backend configuration
nano backend/.env
```

### 3. **Frontend Environment Setup**
```bash
# Copy the frontend example file
cp frontend/.env.example frontend/.env

# Edit with your frontend configuration
nano frontend/.env
```

## 🔧 Environment Variables

### **Root Configuration (.env)**
```bash
# =============================================================================
# GENERAL CONFIGURATION
# =============================================================================
NODE_ENV=development
DOMAIN=localhost

# =============================================================================
# APPLICATION PORTS
# =============================================================================
BACKEND_PORT=5000
FRONTEND_PORT=5173

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your-secure-password-here
MONGO_INITDB_DATABASE=cloudIDE

# =============================================================================
# SECURITY (CHANGE THESE IN PRODUCTION!)
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-change-this-in-production
```

### **Backend Configuration (backend/.env)**
```bash
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://admin:password123@mongo:27017/cloudIDE?authSource=admin

# Environment
NODE_ENV=development

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock

# Logging
LOG_LEVEL=debug

# Security
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### **Frontend Configuration (frontend/.env)**
```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Development
NODE_ENV=development

# App Information
VITE_APP_NAME=Cloud IDE
VITE_APP_VERSION=2.0.0
```

## 🔒 Security Best Practices

### **1. Strong Secrets**
```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong session secret
openssl rand -hex 32
```

### **2. Environment-Specific Configuration**
- **Development**: Use simple passwords for local development
- **Production**: Use strong, unique passwords and secrets
- **Testing**: Use separate test database and secrets

### **3. Secret Management**
- Never hardcode secrets in source code
- Use environment variables for all sensitive data
- Rotate secrets regularly in production
- Use secret management services in production (AWS Secrets Manager, Azure Key Vault, etc.)

## 🚨 If You Accidentally Commit Secrets

### **1. Remove from Git History**
```bash
# Remove file from Git tracking
git rm --cached backend/.env

# Remove from Git history (if already committed)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all
```

### **2. Change All Secrets**
- Generate new JWT secrets
- Change database passwords
- Update API keys
- Rotate all compromised credentials

### **3. Force Push (if necessary)**
```bash
# WARNING: This rewrites Git history
git push origin --force --all
git push origin --force --tags
```

## ✅ Verification Commands

### **Check Git Status**
```bash
# Verify .env files are not tracked
git status --porcelain | grep -E "\.env"

# Should only show .env.example files
git ls-files | grep -E "\.env"
```

### **Test Environment Loading**
```bash
# Backend environment test
cd backend && node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'LOADED' : 'MISSING')"

# Frontend environment test
cd frontend && npm run dev
```

## 🔄 Environment Synchronization

### **Team Development**
1. Update `.env.example` files when adding new variables
2. Notify team members to update their local `.env` files
3. Document new variables in this guide
4. Never share actual `.env` files via chat/email

### **Deployment**
1. Use CI/CD environment variables
2. Never deploy with development secrets
3. Use production-grade secret management
4. Monitor for secret leaks in logs

## 📞 Support

If you have questions about environment configuration:
1. Check the `.env.example` files for reference
2. Review this documentation
3. Ask team members (but never share actual secrets)
4. Use secure channels for sensitive discussions

---

**Remember: Security is everyone's responsibility! 🔐**
