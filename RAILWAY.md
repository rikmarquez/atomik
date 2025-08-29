# 🚂 RAILWAY.md - Deployment Guide & Lessons Learned

> **Guía completa para deployments en Railway con lecciones aprendidas del proyecto Atomic Systems**

---

## 📋 RESUMEN EJECUTIVO

Railway es una plataforma de deployment moderna que soporta múltiples servicios desde GitHub. Durante el deployment de Atomic Systems (React + Node.js + PostgreSQL), identificamos patrones clave y soluciones para problemas comunes.

**Resultado Final:**
- ✅ Frontend desplegado exitosamente
- ✅ Backend en proceso (errores TypeScript resueltos)
- ✅ PostgreSQL configurado y conectado

---

## 🎯 CONFIGURACIÓN INICIAL DE RAILWAY

### 1. Estructura del Proyecto
```
project-root/
├── apps/
│   ├── frontend/          # Root directory: apps/frontend
│   │   ├── package.json
│   │   ├── railway.json   # Configuración específica
│   │   └── .env.example
│   └── backend/           # Root directory: apps/backend
│       ├── package.json
│       ├── railway.json   # Configuración específica
│       └── .env.example
```

### 2. Servicios Requeridos
- **Database Service:** PostgreSQL (configurar primero)
- **Backend Service:** Node.js API 
- **Frontend Service:** React SPA

---

## ⚙️ ARCHIVOS DE CONFIGURACIÓN

### Frontend - railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install --legacy-peer-deps && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s dist -p 3000",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 3
  }
}
```

### Backend - railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 3
  }
}
```

### Node.js Version Control
```bash
# .nvmrc (Frontend)
22.12.0

# package.json engines
"engines": {
  "node": ">=22.12.0"
}
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### 1. ❌ Monorepo Dependencies
**Problema:** `COPY ../../packages/shared` falla en Railway

**Solución:**
```bash
# En lugar de dependencias del monorepo:
"@atomic/shared": "file:../../packages/shared"

# Copiar tipos directamente:
src/
├── types/
│   ├── shared.ts      # Copiar tipos
│   ├── constants.ts   # Copiar constantes  
│   └── utils.ts       # Copiar utilidades
```

**Lección:** Railway no tiene acceso a directorios fuera del root directory del servicio.

### 2. ❌ Docker vs Nixpacks
**Problema:** Railway usa Dockerfile por defecto, causando errores de contexto

**Solución:**
```bash
# Eliminar Dockerfiles problemáticos
rm apps/frontend/Dockerfile
rm apps/backend/Dockerfile

# Railway usará Nixpacks automáticamente con railway.json
```

**Lección:** Nixpacks es más confiable para proyectos Node.js estándar.

### 3. ❌ TypeScript Strict Mode
**Problema:** `verbatimModuleSyntax: true` requiere importaciones explícitas

**Solución - Frontend tsconfig.app.json:**
```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

**Lección:** Railway tiene TypeScript más estricto que desarrollo local.

### 4. ❌ Express Request Type Conflicts
**Problema:** `AuthenticatedRequest extends Request` causa conflictos

**Solución:**
```typescript
// En lugar de tipos personalizados de Request:
export const handler = async (req: AuthenticatedRequest, res: Response)

// Usar any para evitar conflictos:
export const handler = async (req: any, res: Response)
```

**Lección:** Express tiene tipos internos que conflictúan con extensiones personalizadas.

### 5. ❌ Frontend API Configuration
**Problema:** URLs hardcodeadas no funcionan en producción

**Solución:**
```typescript
// config/env.ts
export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1',
}

// En Railway Variables:
VITE_API_URL=https://backend-production.up.railway.app/api/v1
```

### 6. ❌ Serve Dependency Missing
**Problema:** `npx serve` no está disponible en producción

**Solución:**
```json
{
  "dependencies": {
    "serve": "^14.2.1"
  }
}
```

**Lección:** Dependencias de deployment deben estar en dependencies, no devDependencies.

---

## 🔧 VARIABLES DE ENTORNO

### Backend Variables (CRÍTICAS)
```bash
# Database (de Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@host:port/db

# JWT (generar con crypto)
JWT_SECRET=crypto-secure-64-char-hex-string
JWT_REFRESH_SECRET=crypto-secure-64-char-hex-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3005
NODE_ENV=production
CORS_ORIGINS=https://frontend-url.up.railway.app

# Security
BCRYPT_ROUNDS=12
```

### Frontend Variables
```bash
# API Connection
VITE_API_URL=https://backend-url.up.railway.app/api/v1
```

### Generar JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📋 CHECKLIST DE DEPLOYMENT

### Pre-Deployment
- [ ] Eliminar dependencias de monorepo
- [ ] Copiar tipos compartidos localmente
- [ ] Configurar railway.json en cada servicio
- [ ] Verificar engines en package.json
- [ ] Eliminar Dockerfiles si existen
- [ ] Configurar variables de entorno locales (.env.example)

### Deployment Steps
1. [ ] **Database Service:** Crear PostgreSQL, obtener CONNECTION_STRING
2. [ ] **Backend Service:** 
   - Deploy from GitHub → Root: `apps/backend`
   - Configurar variables de entorno
   - Obtener URL del backend
3. [ ] **Frontend Service:**
   - Deploy from GitHub → Root: `apps/frontend`  
   - Configurar VITE_API_URL con backend URL
   - Configurar dominio (puerto 3000)

### Post-Deployment
- [ ] Verificar /health endpoint del backend
- [ ] Probar login/register en frontend
- [ ] Validar conexión frontend ↔ backend
- [ ] Configurar dominios personalizados (opcional)

---

## 🔍 DEBUGGING COMMANDS

### Logs en Railway
```bash
# Railway CLI
railway logs --service backend
railway logs --service frontend
```

### Testing Local
```bash
# Backend
cd apps/backend
npm run build
npm run start

# Frontend  
cd apps/frontend
npm run build
npm run preview
```

### Database Testing
```bash
# Prisma Studio
cd apps/backend
npx prisma studio

# Check Connection
npx prisma db pull
```

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### Build Optimizations
```json
// Frontend package.json
"build": "tsc -b && vite build --minify=true",

// Backend package.json  
"build": "tsc --skipLibCheck"
```

### Railway Configuration
```json
{
  "deploy": {
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 60,
    "restartPolicyMaxRetries": 3
  }
}
```

---

## 🚀 BEST PRACTICES

### 1. Estructura de Archivos
- Mantener servicios independientes
- railway.json específico por servicio
- .env.example documentado

### 2. Type Safety  
- Copiar tipos compartidos en lugar de referencias
- Usar configuración TypeScript relajada para deployment
- Evitar tipos personalizados de Express Request

### 3. Environment Management
- Variables críticas en Railway dashboard
- Fallbacks en código para desarrollo local
- Documentar todas las variables en .env.example

### 4. Error Handling
- Health check endpoints implementados
- Restart policies configuradas
- Logging estructurado para debugging

---

## 📊 MONITORING Y MAINTENANCE

### Health Checks
```typescript
// Backend: /api/v1/health
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    })
  }
})
```

### Metrics to Monitor
- Response time (<2s)
- Error rate (<0.1%)
- Database connection status
- Memory usage
- Build times

---

## 🔗 RECURSOS ÚTILES

### Documentación
- [Railway Docs](https://docs.railway.app/)
- [Nixpacks Docs](https://nixpacks.com/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

### Herramientas
- Railway CLI: `npm install -g @railway/cli`
- Railway Dashboard: https://railway.app/dashboard
- Prisma Studio: `npx prisma studio`

---

## 📝 LECCIONES APRENDIDAS ESPECÍFICAS

### Atomic Systems Project
1. **Monorepo Complexity:** Railway no maneja bien dependencias entre servicios
2. **TypeScript Strictness:** Configuración más estricta en producción
3. **Express Types:** Conflictos con tipos personalizados de Request
4. **Node Versions:** Vite/React requieren versiones específicas
5. **Serve Static:** Necesario como dependencia, no devDependency

### Tiempo de Resolution
- **Problemas de dependencias:** ~2 horas
- **Errores de TypeScript:** ~1 hora  
- **Configuración de servicios:** ~30 minutos
- **Variables de entorno:** ~15 minutos

### Recomendaciones Futuras
1. Evitar monorepos complejos para Railway
2. Usar estructura de servicios independientes
3. Configurar TypeScript para deployment desde el inicio
4. Probar build localmente antes de deploy
5. Documentar todas las variables de entorno

---

**🎉 Con esta guía, futuros deployments en Railway deberían ser mucho más fluidos y eficientes.**