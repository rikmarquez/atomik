# 🤖 CLAUDE.md - Contexto Crítico del Proyecto

> **INSTRUCCIONES PARA CLAUDE:** Lee este archivo al inicio de cada sesión para mantener contexto completo del proyecto Atomic Systems.

---

## 📋 INFORMACIÓN CRÍTICA

### Proyecto: **ATOMIC SYSTEMS**
- **Tipo:** Aplicación web de desarrollo personal basada en "Atomic Habits" de James Clear
- **Filosofía:** Sistemas > Metas, Identidad > Comportamiento, 1% diario
- **Objetivo:** $10K+ MRR en 12 meses, >1000 usuarios activos
- **Stack:** React + Node.js + TypeScript + PostgreSQL + Railway
- **Modelo:** Freemium (Free → $4.99/mes → $39.99/año)

### Estado Actual del Proyecto
- **Fase:** Pre-Desarrollo (preparación inicial completada)
- **Fecha de inicio:** 28 de Agosto 2025
- **Próximo paso:** Sprint 1 - Fundación Técnica

---

## 📚 ARCHIVOS CLAVE QUE DEBES LEER

### SIEMPRE leer al inicio de sesión:
1. **STATUS.md** - Estado actual, progreso, decisiones recientes
2. **PLAN.md** - Plan completo de desarrollo por fases
3. **ESP01.md, ESP02.md, ESP03.md** - Especificaciones técnicas detalladas

### Consultar según necesidad:
- **package.json** (cuando exista) - Dependencias y scripts
- **README.md** (cuando exista) - Setup e instrucciones
- **.env.example** (cuando exista) - Variables de entorno
- **prisma/schema.prisma** (cuando exista) - Esquema de base de datos

---

## 🎯 CONTEXTO DEL NEGOCIO

### Problema que Resolvemos
- Las metas fallan porque se enfocan en resultados, no en sistemas
- Las apps de hábitos existentes son complejas y no se enfocan en identidad
- Falta un enfoque científico y sostenible para el cambio de comportamiento

### Solución Única
- **Enfoque en identidad:** "Soy alguien que..." vs "Quiero hacer..."
- **Sistemas simples:** Máximo 2-3 sistemas activos para usuarios free
- **Filosofía James Clear:** 4 Leyes de los Hábitos integradas
- **Tracking de identidad:** Cada acción refuerza "quién estoy siendo"

### Diferenciadores Clave
1. **Identidad sobre comportamiento**
2. **Simplicidad extrema** (anti-complexity)
3. **Enfoque en sistemas** no metas
4. **Escalabilidad técnica** desde día 1

---

## ⚙️ DECISIONES TÉCNICAS CRÍTICAS

### Arquitectura
- **Monorepo:** apps/frontend + apps/backend + packages/shared
- **Hosting:** Railway multi-service (escalable)
- **Database:** PostgreSQL compartido → dedicado cuando sea necesario
- **Feature Flags:** Rollout controlado por fases

### Stack Justificaciones
- **React:** Ecosystem maduro, hiring, escalabilidad
- **Node.js:** JavaScript fullstack, familiaridad, performance
- **TypeScript:** Type safety, mejor DX, menos bugs
- **Prisma:** Type-safe ORM, migraciones, developer experience
- **Railway:** Simplicidad deployment, escalabilidad, pricing

### Patrones de Desarrollo
- **API Design:** RESTful con versionado (/api/v1/)
- **Authentication:** JWT + refresh tokens
- **State Management:** React Context + hooks inicialmente
- **Database:** Normalized schema con optimizaciones de performance
- **Testing:** Unit tests >85% coverage, E2E para flows críticos

---

## 📊 MÉTRICAS Y KPIs CRÍTICOS

### Por Fase de Desarrollo
- **Fase 1:** 30 días uso personal, 0 bugs críticos
- **Fase 2:** >8/10 beta testers satisfechos, >4.0/5 rating  
- **Fase 3:** $1000+ MRR, >100 usuarios, >10% conversion
- **Fase 4:** $10K MRR, >1000 usuarios, >85% retención

### Métricas Técnicas
- **Performance:** <2s load time, <500ms API response p95
- **Reliability:** 99.9% uptime, <0.1% error rate
- **Scalability:** 1000+ concurrent users sin degradación

---

## 🚨 RIESGOS Y MITIGACIONES

### Riesgos Técnicos
- **Escalabilidad:** Railway shared → Migrar a dedicado cuando sea necesario
- **Performance:** SPA con mucha data → Lazy loading, pagination, caching

### Riesgos de Producto  
- **Market fit:** Validación limitada → Fases de validación progresiva
- **Diferenciación:** Mercado competitivo → Focus en identidad vs comportamiento

### Riesgos de Negocio
- **Conversión:** Freemium baja conversión → Paywall strategy optimizada
- **Churn:** Habits apps alta churn → Community building, engagement features

---

## 🔄 METODOLOGÍA DE TRABAJO

### Approach de Desarrollo
- **Sprints:** 1 semana cada uno
- **Releases:** Cada sprint a staging, cada 2 sprints a producción  
- **Testing:** TDD cuando sea crítico, testing completo para releases
- **Documentation:** Actualizar STATUS.md después de cada sprint

### Principios de Código
- **Simplicidad:** Código legible y mantenible
- **Performance:** Optimizar desde el inicio
- **Security:** Security-first approach
- **Escalabilidad:** Pensar en el futuro sin sobre-engineerizar

---

## 📝 CONVENCIONES DEL PROYECTO

### Git Workflow
- **Branches:** main (production), develop (staging), feature/* (development)
- **Commits:** Conventional commits (feat:, fix:, docs:, etc.)
- **PRs:** Requeridos para main y develop

### Code Style
- **TypeScript strict mode**
- **ESLint + Prettier** configurados
- **Imports:** Absolute paths configurados
- **Naming:** camelCase (JS/TS), kebab-case (files), PascalCase (components)

### API Conventions
- **Endpoints:** RESTful con versionado (/api/v1/resource)
- **Status codes:** Usar correctamente (200, 201, 400, 401, 403, 404, 500)
- **Error format:** Consistente { error: string, code: string, details?: any }
- **Authentication:** Bearer token en headers

---

## 🎯 RECORDATORIOS PARA CLAUDE

### Al Inicio de Sesión
1. **Leer STATUS.md** para contexto actual
2. **Verificar fase actual** y objetivos del sprint
3. **Revisar últimos aprendizajes** y decisiones tomadas
4. **Identificar blockers** o dependencias pendientes

### Durante Desarrollo
1. **Actualizar STATUS.md** cuando completes tareas importantes
2. **Documentar decisiones** técnicas o de producto
3. **Registrar aprendizajes** y patterns que emergen
4. **Mantener focus** en objetivos de la fase actual

### Antes de Terminar Sesión
1. **Actualizar progreso** en STATUS.md
2. **Documentar próximos pasos** específicos
3. **Registrar cualquier blocker** o decisión pendiente
4. **Commit y push** cambios importantes

---

## 🔗 RECURSOS EXTERNOS CLAVE

### Documentación Técnica
- **Railway Docs:** https://docs.railway.app/
- **Prisma Docs:** https://www.prisma.io/docs/
- **React Docs:** https://react.dev/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

### Inspiración de Producto
- **Atomic Habits (James Clear):** Principios fundamentales
- **Tiny Habits (BJ Fogg):** Metodología de formación
- **The Power of Habit:** Neurociencia de hábitos

### Benchmarking
- **Habitify:** Competidor directo (complex)
- **Streaks:** iOS app (simple)  
- **Way of Life:** Android app (color-based)
- **Productive:** Habit tracker (premium)

---

**🚨 IMPORTANTE:** 
- Siempre consulta STATUS.md al inicio de cada sesión
- Mantén el foco en la fase actual del desarrollo
- Documenta decisiones y aprendizajes en STATUS.md
- Piensa en escalabilidad pero no sobre-engineriza
- El objetivo es construir un producto viable y escalable en 12 meses