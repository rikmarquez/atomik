# ESPECIFICACION TECNICA - ATOMIC SYSTEMS APP (PARTE 2/3)

## AUTENTICACION Y SEGURIDAD

### JWT Configuration

```typescript
// JWT Payload Structure
interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    subscriptionStatus: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Authentication Service Interface
interface AuthService {
  register(data: RegisterData): Promise<AuthResult>;
  login(data: LoginData): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
  validateToken(token: string): Promise<{ userId: string; email: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

// Request Types
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  timezone?: string;
}
```

### Security Configuration

```typescript
// Security Headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
};

// Rate Limiting Strategy
const rateLimits = {
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later'
  },
  
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    message: 'Too many requests from this IP'
  },
  
  // Sensitive operations (password reset, account changes)
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: 'Rate limit exceeded for sensitive operations'
  },
  
  // Admin operations
  admin: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Higher limit for admin users
    message: 'Admin rate limit exceeded'
  }
};

// Password Requirements
const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for better UX
  
  // Common password validation
  bannedPasswords: [
    'password', '12345678', 'qwerty123', 'password123'
  ]
};
```

### Authentication Middleware

```typescript
// Authentication Middleware Types
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

// Subscription-based Access Control
const subscriptionLimits = {
  free: {
    lifeAreas: 1,
    systems: 2,
    historyDays: 30,
    exportData: false,
    advancedAnalytics: false
  },
  premium: {
    lifeAreas: -1, // unlimited
    systems: -1,   // unlimited
    historyDays: -1, // unlimited
    exportData: true,
    advancedAnalytics: true
  },
  courtesy: {
    // Same as premium
    lifeAreas: -1,
    systems: -1,
    historyDays: -1,
    exportData: true,
    advancedAnalytics: true
  }
};
```

## CONFIGURACION DE RAILWAY

### Multi-Service Railway Configuration

```json
// railway.json
{
  "version": "2",
  "build": {
    "builder": "nixpacks"
  },
  "services": {
    "frontend": {
      "source": "apps/frontend",
      "build": {
        "command": "npm ci && npm run build",
        "output": "dist"
      },
      "deploy": {
        "startCommand": "npx serve -s dist -l $PORT",
        "restartPolicyType": "never"
      }
    },
    "backend": {
      "source": "apps/backend",
      "build": {
        "command": "npm ci && npm run build"
      },
      "deploy": {
        "startCommand": "npm run db:deploy && npm start"
      }
    }
  }
}
```

### Frontend Railway Configuration

```toml
# apps/frontend/railway.toml
[build]
command = "npm ci && npm run build"
outputDir = "dist"

[deploy]
startCommand = "npx serve -s dist -l $PORT"

[env]
# API Configuration
VITE_API_URL = "${{backend.RAILWAY_PUBLIC_DOMAIN}}"
VITE_APP_ENV = "${{RAILWAY_ENVIRONMENT}}"
VITE_APP_VERSION = "1.0.0"

# Feature Flags (Phase 1 - Personal Use)
VITE_FEATURE_SUBSCRIPTION = "false"
VITE_FEATURE_ADMIN = "false"
VITE_FEATURE_EMAILS = "false"
VITE_FEATURE_ANALYTICS = "true"
VITE_FEATURE_SOCIAL = "false"

# Analytics (Optional)
VITE_MIXPANEL_TOKEN = "${{MIXPANEL_TOKEN}}"
VITE_GA_ID = "${{GOOGLE_ANALYTICS_ID}}"

# Branding
VITE_APP_NAME = "Atomic Systems"
VITE_SUPPORT_EMAIL = "support@atomic-systems.com"

[healthcheck]
path = "/"
port = "${{PORT}}"

[resources]
memory = "512Mi"
cpu = "0.25"

[variables]
NODE_OPTIONS = "--max-old-space-size=512"
```

### Backend Railway Configuration

```toml
# apps/backend/railway.toml
[build]
command = "npm ci && npm run build"

[deploy]
startCommand = "npm run db:deploy && npm start"

[env]
# Database Configuration (Shared PostgreSQL initially)
DATABASE_URL = "${{shared-postgres.DATABASE_URL}}/atomic_systems?schema=atomic_systems"
DATABASE_DEDICATED = "false"
DATABASE_POOL_SIZE = "5"
REDIS_URL = "${{shared-redis.REDIS_URL}}"

# Application Configuration
NODE_ENV = "${{RAILWAY_ENVIRONMENT}}"
PORT = "${{PORT}}"
API_VERSION = "v1"

# CORS Configuration
CLIENT_URL = "${{frontend.RAILWAY_PUBLIC_DOMAIN}}"
CORS_ORIGINS = "${{frontend.RAILWAY_PUBLIC_DOMAIN}},http://localhost:3000,http://localhost:5173"

# Authentication Configuration
JWT_SECRET = "${{JWT_SECRET}}"
JWT_REFRESH_SECRET = "${{JWT_REFRESH_SECRET}}"
JWT_EXPIRES_IN = "24h"
JWT_REFRESH_EXPIRES_IN = "7d"
BCRYPT_SALT_ROUNDS = "12"

# Session Configuration
SESSION_SECRET = "${{SESSION_SECRET}}"
SESSION_MAX_AGE = "86400000"

# Feature Flags (Phase 1 Configuration)
FEATURE_SUBSCRIPTION = "false"
FEATURE_ADMIN = "false"
FEATURE_EMAILS = "false"
FEATURE_ANALYTICS = "true"
FEATURE_SOCIAL = "false"

# External Services (Optional initially)
STRIPE_SECRET_KEY = "${{STRIPE_SECRET_KEY}}"
STRIPE_WEBHOOK_SECRET = "${{STRIPE_WEBHOOK_SECRET}}"
STRIPE_WEBHOOK_ENDPOINT = "/api/v1/webhooks/stripe"

SENDGRID_API_KEY = "${{SENDGRID_API_KEY}}"
SENDGRID_FROM_EMAIL = "noreply@atomic-systems.com"
SENDGRID_FROM_NAME = "Atomic Systems"

MIXPANEL_TOKEN = "${{MIXPANEL_TOKEN}}"

# Performance & Logging
LOG_LEVEL = "info"
LOG_FORMAT = "json"
RATE_LIMIT_WINDOW = "900000"    # 15 minutes in ms
RATE_LIMIT_MAX_REQUESTS = "100"

# Email Configuration
SMTP_HOST = "${{SMTP_HOST}}"
SMTP_PORT = "587"
SMTP_USER = "${{SMTP_USER}}"
SMTP_PASS = "${{SMTP_PASS}}"

# File Upload (Future)
MAX_FILE_SIZE = "5242880"       # 5MB in bytes
ALLOWED_FILE_TYPES = "jpg,jpeg,png,pdf"

[healthcheck]
path = "/api/health"
port = "${{PORT}}"
interval = "30s"
timeout = "10s"

[resources]
memory = "1Gi"
cpu = "0.5"

[variables]
NODE_OPTIONS = "--max-old-space-size=1024"
```

## DESIGN SYSTEM COMPLETO

### Color System

```css
/* Design System - Color Palette */
:root {
  /* Primary Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Success Colors (System Completion) */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-200: #bbf7d0;
  --color-success-300: #86efac;
  --color-success-400: #4ade80;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;
  --color-success-800: #166534;
  --color-success-900: #14532d;

  /* Warning Colors (Streaks at Risk) */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-200: #fde68a;
  --color-warning-300: #fcd34d;
  --color-warning-400: #fbbf24;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;
  --color-warning-800: #92400e;
  --color-warning-900: #78350f;

  /* Danger Colors (Missed Systems) */
  --color-danger-50: #fef2f2;
  --color-danger-100: #fee2e2;
  --color-danger-200: #fecaca;
  --color-danger-300: #fca5a5;
  --color-danger-400: #f87171;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
  --color-danger-700: #b91c1c;
  --color-danger-800: #991b1b;
  --color-danger-900: #7f1d1d;

  /* Neutral Colors (UI Framework) */
  --color-gray-25: #fcfcfd;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Special Colors */
  --color-streak: #f59e0b;      /* Fire/Orange for streaks */
  --color-identity: #8b5cf6;    /* Purple for identity */
  --color-goal: #06b6d4;        /* Cyan for goals */
}
```

### Typography System

```css
/* Typography Configuration */
:root {
  /* Font Families */
  --font-sans: 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', sans-serif;
  --font-display: 'Cal Sans', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', 'Menlo', 'Monaco', monospace;

  /* Font Sizes (Mobile First) */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */

  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}

/* Typography Classes */
.text-display-2xl {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.text-display-xl {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

.text-heading-lg {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-heading-md {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}
```

### Component Spacing and Layout

```css
/* Spacing System */
:root {
  /* Spacing Scale (based on 4px grid) */
  --space-0: 0rem;
  --space-px: 0.0625rem;    /* 1px */
  --space-0-5: 0.125rem;    /* 2px */
  --space-1: 0.25rem;       /* 4px */
  --space-1-5: 0.375rem;    /* 6px */
  --space-2: 0.5rem;        /* 8px */
  --space-2-5: 0.625rem;    /* 10px */
  --space-3: 0.75rem;       /* 12px */
  --space-3-5: 0.875rem;    /* 14px */
  --space-4: 1rem;          /* 16px */
  --space-5: 1.25rem;       /* 20px */
  --space-6: 1.5rem;        /* 24px */
  --space-8: 2rem;          /* 32px */
  --space-10: 2.5rem;       /* 40px */
  --space-12: 3rem;         /* 48px */
  --space-16: 4rem;         /* 64px */
  --space-20: 5rem;         /* 80px */
  --space-24: 6rem;         /* 96px */

  /* Layout Containers */
  --container-xs: 20rem;     /* 320px */
  --container-sm: 24rem;     /* 384px */
  --container-md: 28rem;     /* 448px */
  --container-lg: 32rem;     /* 512px */
  --container-xl: 36rem;     /* 576px */
  --container-2xl: 42rem;    /* 672px */
  --container-3xl: 48rem;    /* 768px */
  --container-4xl: 56rem;    /* 896px */
  --container-5xl: 64rem;    /* 1024px */
  --container-6xl: 72rem;    /* 1152px */
  --container-7xl: 80rem;    /* 1280px */

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;     /* 2px */
  --radius-base: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;     /* 6px */
  --radius-lg: 0.5rem;       /* 8px */
  --radius-xl: 0.75rem;      /* 12px */
  --radius-2xl: 1rem;        /* 16px */
  --radius-3xl: 1.5rem;      /* 24px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
}
```

## FLUJOS DE USUARIO DETALLADOS

### Onboarding Flow (Primera vez)

```

Flujo Completo de Onboarding:

Paso 1: Pantalla de Bienvenida
+-- Hero: "Construye la vida que quieres, un sistema a la vez"
+-- Subtítulo: Explicación filosofía James Clear (30 seg video)
+-- Beneficios clave: Sistemas > Metas, 1% diario, Identidad
+-- CTA Principal: "Comenzar mi transformación"
+-- Tiempo estimado: "5 minutos para configurar"

Paso 2: Evaluación Wheel of Life
+-- Introducción: "Evaluemos dónde estás ahora"
+-- 8 Áreas interactivas con sliders (1-10):
¦   +-- ?? Salud Física
¦   +-- ?? Salud Mental  
¦   +-- ?? Carrera/Trabajo
¦   +-- ?? Finanzas
¦   +-- ?? Relaciones
¦   +-- ?? Crecimiento Personal
¦   +-- ?? Diversión/Ocio
¦   +-- ?? Contribución/Propósito
+-- Visualización en tiempo real (radar chart)
+-- Auto-identificación de áreas más bajas
+-- CTA: "Continuar con mis áreas prioritarias"

Paso 3: Definición de Identidad
+-- Área seleccionada: [Área con menor puntuación]
+-- Pregunta central: "¿Qué tipo de persona quieres ser en [área]?"
+-- Ejemplos inspiradores por área:
¦   +-- Salud: "Soy una persona atlética y energética"
¦   +-- Finanzas: "Soy alguien disciplinado con el dinero"
¦   +-- Carrera: "Soy un profesional en constante crecimiento"
+-- Campo de texto libre + sugerencias
+-- Pregunta opcional: "¿Cuál es tu dirección deseada?" (meta como brújula)
+-- Validación de identidad positiva y específica

Paso 4: Creación del Primer Sistema
+-- Contexto: "Ahora creemos el sistema que te convertirá en esa persona"
+-- Wizard guiado:
¦   +-- Sistema principal: "¿Qué harás consistentemente?"
¦   ¦   +-- Ejemplos: "Ejercitarme 20 min", "Leer 10 páginas"
¦   +-- Versión mínima: "¿Cuál es la versión de 2 minutos?"
¦   ¦   +-- Ejemplos: "2 flexiones", "1 página", "5 sentadillas"
¦   +-- Disparador: "¿Después de qué lo harás?"
¦   ¦   +-- Ejemplos: "Después del café", "Al despertar", "Antes de cenar"
¦   +-- Recompensa: "¿Cómo te celebrarás?"
¦   ¦   +-- Ejemplos: "Un café especial", "Ver un video", "Marcar en app"
¦   +-- Preparación: "¿Qué dejas listo la noche anterior?"
+-- Previsualización del sistema completo
+-- Confirmación: "¡Tu primer sistema está listo!"

Paso 5: Primer Ejecución
+-- Motivación: "¡Ejecutemos tu sistema ahora mismo!"
+-- Timer opcional para la actividad
+-- Recordatorio de versión mínima si es necesario
+-- Botón grande: "¡Lo hice!" con animación celebratoria
+-- Micro-celebración: Confetti, sonido, mensaje positivo
+-- Refuerzo de identidad: "¡Acabas de actuar como [identidad]!"
+-- Setup de recordatorio: "¿A qué hora te recordamos mañana?"

Paso 6: Configuración Final
+-- Personalización básica:
¦   +-- Hora de recordatorio diario
¦   +-- Timezone automático
¦   +-- Preferencias de notificación
+-- Explicación del dashboard
+-- Tour rápido de funciones principales
+-- Establecimiento de expectativas: "Los primeros 3 días son cruciales"
+-- CTA final: "¡Comencemos tu transformación!"

### Dayly flow (Uso Principal)

Flujo Diario Optimizado:

?? Al Abrir la App (Morning):
+-- Saludo personalizado: "Buenos días [Nombre]"
+-- Estado motivacional: "Día 12 construyendo tu nueva identidad"
+-- Dashboard principal:
¦   +-- Sistemas de hoy (máximo 3-4 visibles)
¦   ¦   +-- Sistema con streak: "?? 15 días"
¦   ¦   +-- Estado: Pendiente/Completado
¦   ¦   +-- Tiempo estimado: "20 min"
¦   ¦   +-- Quick action: "Marcar como hecho"
¦   +-- Progreso semanal: Barra circular "4/7 días"
¦   +-- Identidad del día: "Hoy actúas como [identidad]"
¦   +-- Preparación de ayer: Checklist si fue configurado
+-- Quick Actions:
¦   +-- ? Marcar sistema completado
¦   +-- ?? Agregar nota rápida
¦   +-- ? Posponer (con límite)
¦   +-- ?? Ver detalles del sistema
+-- Motivación contextual basada en racha actual

Durante el día:
+-- Notificación push inteligente (hora configurada)
+-- Check-in rápido disponible en cualquier momento
+-- Tracking de completado con timestamp automático
+-- Celebración inmediata al completar (animación + sonido)

?? Check-in Nocturno (Evening - 5 min máximo):
+-- Pregunta central: "¿Actué como quien quiero ser hoy?"
+-- Review de sistemas:
¦   +-- Marcar completados (si no se hizo durante día)
¦   +-- Notas opcionales por sistema
¦   +-- Rating rápido: Dificultad y Satisfacción (1-5)
¦   +-- Contexto: "¿Dónde lo hiciste? ¿Cómo te sentiste?"
+-- Reflexión rápida (máx 2 preguntas):
¦   +-- "¿Qué funcionó mejor hoy?"
¦   +-- "¿Qué ajustarías para mañana?"
¦   +-- (Opcional) "¿Qué obstáculo encontraste?"
+-- Preparación automática:
¦   +-- "¿Qué dejas listo para mañana?"
¦   +-- Reminder configuration para mañana
¦   +-- Quick setup de entorno si es necesario
+-- Celebration de logros:
¦   +-- Streaks mantenidos/logrados
¦   +-- Consistency score del día
¦   +-- Identity reinforcement message
+-- Gentle motivation para mañana



### Weekly Review (Automatico cada domingo)

Revisión Semanal (Auto-generada cada domingo):

Datos Recopilados Automáticamente:
+-- Completion rate por sistema (%)
+-- Días más/menos exitosos de la semana
+-- Promedio de mood y energy levels
+-- Patrones identificados (día, hora, contexto)
+-- Obstáculos más frecuentes
+-- Recompensas más efectivas

Dashboard de Revisión:
+-- ?? Resumen de la semana:
¦   +-- "Completaste 73% de tus sistemas esta semana"
¦   +-- "Tu mejor día fue martes (3/3 sistemas)"
¦   +-- "Área de mayor progreso: Salud"
¦   +-- "Racha más larga: 12 días en ejercicio"
+-- ?? Análisis por sistema:
¦   +-- ?? Sistemas sólidos (>80% completion):
¦   ¦   +-- "Ejercicio matutino - 6/7 días"
¦   ¦   +-- "¿Qué está funcionando bien?"
¦   ¦   +-- "Mantener sin cambios"
¦   +-- ?? Sistemas inconsistentes (50-80%):
¦   ¦   +-- "Lectura nocturna - 4/7 días"
¦   ¦   +-- "Análisis: Fallaste los viernes y sábados"
¦   ¦   +-- "Sugerencia: Cambiar trigger o simplificar"
¦   +-- ?? Sistemas en riesgo (<50%):
¦   ¦   +-- "Meditación - 2/7 días"
¦   ¦   +-- "Patrón: Nunca lo haces en la tarde"
¦   ¦   +-- "Acción: ¿Cambiar horario o pausar?"
+-- ?? Insights personalizados:
¦   +-- "Eres más consistente en las mañanas"
¦   +-- "Los lunes son tu día más fuerte"
¦   +-- "Cuando preparas el ambiente, tienes 2x más éxito"
¦   +-- "Tu energía promedio fue 4.2/5 - ¡excelente!"
+-- ?? Plan para próxima semana:
¦   +-- "Continuar con: [sistemas exitosos]"
¦   +-- "Ajustar: [sistemas problemáticos]"
¦   +-- "Experimentar: [nueva optimización]"
¦   +-- "Pausar: [si aplica]"
+-- ?? Celebración de progreso:
    +-- Identity reinforcement: "Esta semana actuaste como..."
    +-- Compound progress: "En 12 semanas habrás..."
    +-- Momentum message: "¡Sigues construyendo quien quieres ser!"

## MODELO DE SUSCRIPCION Y MONETIZACION

### Estructura de Planes

// Pricing Plans Configuration
interface PricingPlan {
  id: string;
  name: string;
  stripePriceId: string;
  price: number;
  interval: 'month' | 'year';
  currency: 'usd';
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
  badge?: string;
}

interface PlanLimits {
  lifeAreas: number;        // -1 = unlimited
  systems: number;          // -1 = unlimited  
  historyDays: number;      // -1 = unlimited
  exportData: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customReminders: boolean;
  teamFeatures: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    stripePriceId: '', // No Stripe for free tier
    price: 0,
    interval: 'month',
    currency: 'usd',
    features: [
      '1 área de vida activa',
      'Máximo 2 sistemas simultáneos',
      'Dashboard básico',
      '30 días de historial',
      'Tracking diario simple',
      'Revisiones semanales automáticas'
    ],
    limits: {
      lifeAreas: 1,
      systems: 2,
      historyDays: 30,
      exportData: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customReminders: false,
      teamFeatures: false
    }
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    stripePriceId: 'price_premium_monthly_499',
    price: 4.99,
    interval: 'month',
    currency: 'usd',
    popular: true,
    features: [
      'Áreas de vida ilimitadas',
      'Sistemas ilimitados',
      'Análisis avanzado y tendencias',
      'Historial completo',
      'Exportar datos (CSV, JSON)',
      'Revisiones mensuales detalladas',
      'Notificaciones personalizadas',
      'Soporte prioritario por email'
    ],
    limits: {
      lifeAreas: -1,
      systems: -1,
      historyDays: -1,
      exportData: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customReminders: true,
      teamFeatures: false
    }
  },
  {
    id: 'premium_annual',
    name: 'Premium Anual',
    stripePriceId: 'price_premium_annual_3999',
    price: 39.99,
    interval: 'year',
    currency: 'usd',
    badge: '33% OFF',
    features: [
      'Todo lo de Premium Mensual',
      '33% de descuento (ahorra $20/año)',
      'Acceso anticipado a nuevas funciones',
      'Sesión de onboarding personalizada',
      'Templates premium de sistemas',
      'Priority feature requests'
    ],
    limits: {
      lifeAreas: -1,
      systems: -1,
      historyDays: -1,
      exportData: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customReminders: true,
      teamFeatures: false
    }
  }
];

### Estrategia de Conversionn Freemium

// Conversion Funnel Strategy
interface ConversionStrategy {
  // Registration to Activation
  activation: {
    target: 'first_system_created';
    timeframe: '24_hours';
    targetRate: 85; // %
    tactics: [
      'Guided onboarding with progress indicators',
      'Interactive system creation wizard',
      'Immediate value demonstration',
      'Celebration of first completion'
    ];
  };

  // Activation to Engagement  
  engagement: {
    target: 'seven_day_active_usage';
    timeframe: '14_days';
    targetRate: 65; // %
    tactics: [
      'Daily reminder notifications',
      'Streak gamification',
      'Weekly progress emails',
      'Habit stacking suggestions'
    ];
  };

  // Engagement to Conversion
  conversion: {
    triggers: [
      'hit_system_limit',      // Try to create 3rd system
      'hit_area_limit',        // Try to create 2nd life area  
      'export_data_attempt',   // Try to export data
      'advanced_analytics_tease', // View premium analytics
      'history_limit_reached'  // Try to access >30 days
    ];
    targetRate: 12; // % of engaged users
    timing: 'after_engagement_achieved';
  };
}

// Paywall Implementation Strategy
interface PaywallStrategy {
  softGates: {
    // Show premium value without blocking
    advanced_analytics_preview: {
      description: 'Show 7-day preview of advanced charts';
      cta: 'Unlock full analytics history';
      placement: 'progress_page';
    };
    
    export_data_teaser: {
      description: 'Show export options but require upgrade';
      cta: 'Export your complete data';
      placement: 'settings_page';
    };
    
    monthly_review_preview: {
      description: 'Show summary but full review requires premium';
      cta: 'Unlock detailed monthly insights';
      placement: 'monthly_review_trigger';
    };
  };

  hardGates: {
    // Actual functionality blocks
    third_system_creation: {
      trigger: 'attempt_create_3rd_system';
      message: 'You\'ve reached the free limit of 2 systems. Upgrade to create unlimited systems!';
      cta: 'Upgrade to Premium';
      showFreeTrial: true;
    };
    
    second_life_area: {
      trigger: 'attempt_create_2nd_life_area';
      message: 'Focus on multiple life areas with Premium';
      cta: 'Upgrade Now';
      showValue: 'Track health, career, relationships and more';
    };
    
    history_access: {
      trigger: 'attempt_access_old_data';
      message: 'Premium users get unlimited history access';
      cta: 'See Your Complete Journey';
      showFreeTrial: true;
    };
  };

  timing: {
    noPaywallPeriod: 3; // days - let users get value first
    softPaywallStart: 7; // days - start showing premium value
    hardPaywallStart: 14; // days - start blocking features
    urgencyPhase: 21; // days - add urgency messaging
  };
}

### Stripe Integration

```typescript
// Stripe Service Configuration
interface StripeConfiguration {
  webhookEvents: [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.subscription.trial_will_end',
    'invoice.upcoming' // 3 days before renewal
  ];
  
  checkoutSessionConfig: {
    mode: 'subscription';
    allow_promotion_codes: true;
    billing_address_collection: 'auto';
    customer_update: {
      address: 'auto';
      name: 'auto';
    };
    tax_id_collection: {
      enabled: true;
    };
    
    // Success/Cancel URLs
    success_url: '{CLIENT_URL}/app/billing/success?session_id={CHECKOUT_SESSION_ID}';
    cancel_url: '{CLIENT_URL}/app/billing/canceled';
    
    // Subscription settings
    subscription_data: {
      trial_period_days: 14; // 14-day free trial
      metadata: {
        source: 'web_app';
        onboarding_completed: 'true';
      };
    };
  };

  customerPortalConfig: {
    business_profile: {
      headline: 'Manage your Atomic Systems subscription';
      privacy_policy_url: '{CLIENT_URL}/privacy';
      terms_of_service_url: '{CLIENT_URL}/terms';
    };
    features: {
      invoice_history: { enabled: true };
      payment_method_update: { enabled: true };
      subscription_cancel: { 
        enabled: true;
        cancellation_reason: {
          enabled: true;
          options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'];
        };
      };
      subscription_pause: { enabled: false }; // Not needed for our use case
      subscription_update: {
        enabled: true;
        default_allowed_updates: ['price'];
        proration_behavior: 'always_invoice';
      };
    };
  };
}

// Subscription Lifecycle Management
interface SubscriptionService {
  // Creation
  createCheckoutSession: (priceId: string, userId: string, couponId?: string) => Promise<string>;
  createCustomer: (user: User) => Promise<string>;
  
  // Management  
  updateSubscription: (subscriptionId: string, newPriceId: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<void>;
  pauseSubscription: (subscriptionId: string, resumeAt: Date) => Promise<void>;
  
  // Customer Portal
  createPortalSession: (customerId: string, returnUrl?: string) => Promise<string>;
  
  // Webhook Processing
  handleWebhook: (rawBody: string, signature: string) => Promise<void>;
  
  // Internal Operations
  syncSubscriptionStatus: (subscriptionId: string) => Promise<void>;
  handleFailedPayment: (customerId: string, attemptCount: number) => Promise<void>;
  processTrialEnding: (subscriptionId: string, daysLeft: number) => Promise<void>;
}
```

## SISTEMA DE NOTIFICACIONES

### Email Templates y Automation

// Email Template System
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  trigger: EmailTrigger;
  timing: EmailTiming;
  audience: EmailAudience;
  content: EmailContent;
  enabled: boolean;
}

type EmailTrigger = 
  | 'user_registered'
  | 'onboarding_completed'  
  | 'first_system_created'
  | 'first_streak_achieved'
  | 'system_streak_broken'
  | 'weekly_progress'
  | 'monthly_review_due'
  | 'trial_started'
  | 'trial_ending'
  | 'subscription_activated'
  | 'subscription_cancelled'
  | 'payment_failed'
  | 'user_inactive'
  | 'feature_announcement';

interface EmailTiming {
  delay?: number;        // Hours after trigger
  dayOfWeek?: number;    // 0-6, Sunday = 0
  timeOfDay?: string;    // HH:mm format
  timezone?: 'user' | 'utc';
  immediate?: boolean;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome_sequence_1',
    name: 'Welcome - Day 0',
    subject: '¡Bienvenido a Atomic Systems! Tu transformación comienza hoy ??',
    trigger: 'user_registered',
    timing: { immediate: true },
    audience: { segment: 'new_users', subscriptionStatus: 'all' },
    content: {
      preheader: 'Los sistemas son más poderosos que las metas',
      hero: {
        title: 'Bienvenido a tu nueva forma de lograr objetivos',
        subtitle: 'Estás a punto de descubrir por qué los sistemas superan a las metas',
        image: 'welcome_hero.png'
      },
      body: {
        introduction: 'Como dice James Clear: "No te elevas al nivel de tus objetivos, desciendes al nivel de tus sistemas." Tu éxito no depende de metas perfectas, sino de sistemas que ejecutes consistentemente.',
        
        sections: [
          {
            title: '¿Por qué Atomic Systems funciona?',
            content: 'Porque nos enfocamos en quien te conviertes, no en lo que logras. Cada sistema que ejecutas refuerza tu identidad deseada.',
            bullets: [
              'Sistemas diarios simples y sostenibles',
              'Enfoque en identidad antes que resultados', 
              'Mejora compuesta del 1% cada día',
              'Diseño de ambiente para el éxito automático'
            ]
          },
          {
            title: 'Tu próximo paso',
            content: 'Completa tu configuración inicial en los próximos 5 minutos. Cuanto antes empieces, antes verás resultados.'
          }
        ]
      },
      cta: {
        primary: {
          text: 'Completar mi configuración',
          url: '{CLIENT_URL}/app/onboarding/welcome'
        },
        secondary: {
          text: 'Ver ejemplos de sistemas exitosos',
          url: '{CLIENT_URL}/examples'
        }
      },
      footer: {
        unsubscribe: true,
        socialLinks: true,
        supportEmail: 'support@atomic-systems.com'
      }
    },
    enabled: true
  },

  {
    id: 'onboarding_day_3',
    name: 'Check-in Day 3',
    subject: '¿Cómo van tus primeros sistemas? (3 días construyendo tu nueva identidad)',
    trigger: 'user_registered',
    timing: { delay: 72, timezone: 'user' }, // 3 days later
    audience: { segment: 'new_users', hasCompletedOnboarding: true },
    content: {
      preheader: 'Los primeros días son los más importantes',
      hero: {
        title: '3 días construyendo tu nueva identidad',
        subtitle: 'Cada día que ejecutas tu sistema, refuerzas quien estás decidiendo ser',
        personalizedStats: true // Will show user's actual progress
      },
      body: {
        introduction: 'Los estudios muestran que los primeros 21 días son cruciales para la formación de hábitos. Estás en el momento más importante.',
        
        dynamicContent: {
          // Content varies based on user's progress
          highPerformer: {
            condition: 'completionRate >= 80%',
            message: '¡Increíble! Estás ejecutando tus sistemas con una consistencia del {completionRate}%. Mantén este momentum.'
          },
          strugglingUser: {
            condition: 'completionRate < 50%',
            message: 'Los comienzos pueden ser desafiantes. Recuerda: el objetivo no es la perfección, sino la consistencia. ¿Necesitas ajustar algo?'
          },
          averageUser: {
            condition: 'completionRate >= 50% && completionRate < 80%',
            message: 'Vas por buen camino con {completionRate}% de consistencia. Cada día cuenta para construir tu nueva identidad.'
          }
        },

        sections: [
          {
            title: 'Recordatorio: La regla de nunca fallar dos veces',
            content: 'Si ayer no ejecutaste tu sistema, hoy es crítico. Nunca permitas que una falla se convierta en dos. Una falla es un accidente, dos fallas es el inicio de un patrón.'
          },
          {
            title: '¿Necesitas ajustar algo?',
            content: 'Si algún sistema se siente muy difícil, es mejor simplificarlo que abandonarlo. La consistencia supera a la intensidad.',
            bullets: [
              '¿El disparador es suficientemente obvio?',
              '¿La recompensa es inmediata y satisfactoria?',
              '¿El ambiente está diseñado para el éxito?',
              '¿La versión mínima es realmente fácil?'
            ]
          }
        ]
      },
      cta: {
        primary: {
          text: 'Ver mi progreso',
          url: '{CLIENT_URL}/app/progress'
        },
        secondary: {
          text: 'Ajustar mis sistemas',
          url: '{CLIENT_URL}/app/systems'
        }
      }
    },
    enabled: true
  },

  {
    id: 'streak_celebration',
    name: 'Streak Achievement',
    subject: '?? ¡Increíble! Lograste {streakDays} días consecutivos',
    trigger: 'first_streak_achieved',
    timing: { immediate: true },
    audience: { subscriptionStatus: 'all' },
    content: {
      preheader: 'Este momentum es poderoso, mantengámoslo',
      hero: {
        title: '?? {streakDays} días consecutivos',
        subtitle: 'Cada día consecutivo incrementa exponencialmente tu identidad',
        celebration: true // Special visual treatment
      },
      body: {
        introduction: 'No es solo una racha. Cada día consecutivo que ejecutas tu sistema, estás enviando un mensaje poderoso a tu cerebro: "Soy el tipo de persona que hace esto."',
        
        sections: [
          {
            title: 'El poder compuesto de la consistencia',
            content: `En {streakDays} días has reforzado tu nueva identidad {streakDays} veces. Esto no es coincidencia, es evidencia de quien te estás convirtiendo.`
          },
          {
            title: 'Protege esta racha',
            content: 'Las rachas largas se vuelven parte de tu identidad. Mientras más larga, más resistente a las interrupciones. Algunos consejos para mantenerla:',
            bullets: [
              'Mantén tu versión mínima siempre disponible',
              'Si un día es difícil, haz al menos la versión de 2 minutos',
              'Recuerda: nunca fallar dos veces seguidas',
              'Celebra cada día como una victoria'
            ]
          }
        ]
      },
      cta: {
        primary: {
          text: 'Ver mi dashboard',
          url: '{CLIENT_URL}/app/today'
        }
      }
    },
    enabled: true
  },

  {
    id: 'trial_ending_reminder',
    name: 'Trial Ending - 3 Days Left',
    subject: 'Tu periodo de prueba termina en 3 días - ¿Continuamos tu transformación?',
    trigger: 'trial_ending',
    timing: { immediate: true },
    audience: { subscriptionStatus: 'trialing' },
    content: {
      preheader: 'Has logrado mucho en estos días, mantengamos el momentum',
      hero: {
        title: 'Tu transformación está en marcha',
        subtitle: 'En los últimos días has ejecutado {totalExecutions} sistemas y construido {totalStreaks} rachas',
        personalizedStats: true
      },
      body: {
        introduction: 'Los datos muestran el poder de lo que has construido. Veamos tu progreso:',
        
        personalizedProgress: {
          // Dynamic content based on user's trial performance
          systemsCreated: '{systemsCount} sistemas activos',
          totalExecutions: '{executionsCount} ejecuciones totales',
          consistencyRate: '{consistencyPercentage}% de consistencia',
          longestStreak: '{longestStreakDays} días de racha más larga',
          identityReinforcement: 'Has reforzado tu identidad {identityCount} veces'
        },

        sections: [
          {
            title: '¿Qué pierdes si paras ahora?',
            content: 'No es solo la app. Es el momentum, las rachas, la nueva identidad que estás construyendo. La investigación muestra que detener un hábito en formación requiere empezar desde cero.',
            bullets: [
              'Rachas construidas con esfuerzo se pierden',
              'El momentum psicológico se reinicia',
              'La identidad en formación se debilita',
              'Los sistemas diseñados se abandonan'
            ]
          },
          {
            title: 'Con Premium obtienes:',
            content: 'Todas las herramientas para que esta transformación sea permanente.',
            bullets: [
              'Sistemas ilimitados para todas tus áreas de vida',
              'Analytics avanzados para optimizar tu progreso',
              'Historial completo de tu transformación',
              'Exportar datos para guardar tu progreso',
              'Soporte prioritario cuando lo necesites'
            ]
          }
        ]
      },
      cta: {
        primary: {
          text: 'Continuar mi transformación - $4.99/mes',
          url: '{CLIENT_URL}/app/upgrade?plan=monthly'
        },
        secondary: {
          text: 'Ver todos los planes',
          url: '{CLIENT_URL}/pricing'
        }
      },
      urgency: {
        message: 'Solo 3 días restantes',
        countdownTimer: true
      }
    },
    enabled: true
  }
];

### Push Notifications System

// Push Notification Configuration
interface PushNotificationConfig {
  dailyReminders: {
    enabled: boolean;
    defaultTime: string; // HH:mm format
    userCustomizable: boolean;
    
    messages: {
      standard: 'Hora de construir quien quieres ser ??';
      withStreak: '?? Día {streakDay} de tu transformación te espera';
      encouragement: 'Pequeños pasos, grandes cambios. ¡Vamos!';
      identity: 'Las personas como tú hacen esto todos los días';
    };
    
    timing: {
      respect_timezone: true;
      avoid_sleep_hours: true; // 10 PM - 6 AM
      smart_delay: true; // Delay if user recently active
    };
  };

  contextualReminders: {
    streak_danger: {
      condition: 'streak >= 3 AND no_activity_today AND time > 6PM';
      message: '?? No rompas tu racha de {streak} días. Solo {systems} sistemas pendientes.';
      urgency: 'high';
    };
    
    missed_yesterday: {
      condition: 'missed_yesterday AND no_activity_today AND time > user_normal_time + 2h';
      message: 'Ayer no pudiste, pero hoy es un nuevo día. La regla: nunca fallar dos veces.';
      urgency: 'medium';
    };
    
    great_week: {
      condition: 'weekly_completion >= 85% AND day_of_week = Friday';
      message: '?? ¡Semana increíble! {completion}% de consistencia. ¿Terminamos fuerte?';
      urgency: 'low';
    };
  };

  milestone_celebrations: {
    first_completion: {
      trigger: 'first_system_completed';
      message: '?? ¡Tu primer sistema completado! Así se construye una nueva identidad.';
      immediate: true;
    };
    
    first_streak: {
      trigger: 'streak_achieved';
      days: [3, 7, 14, 21, 30, 60, 90, 180, 365];
      message: '?? ¡{days} días consecutivos! Tu nueva identidad se fortalece cada día.';
      immediate: true;
    };
    
    weekly_perfect: {
      trigger: 'weekly_completion_100%';
      message: '? ¡Semana perfecta! 7/7 días ejecutando tus sistemas. Eres imparable.';
      timing: 'sunday_evening';
    };
  };

  subscription_related: {
    trial_ending: {
      days_before: [7, 3, 1];
      message: 'Tu transformación está funcionando. ¿Continuamos? Prueba gratis termina en {days} días.';
    };
    
    feature_limit_reached: {
      trigger: 'hit_free_limit';
      message: '¡Estás listo para más! Desbloquea sistemas ilimitados con Premium.';
      action: 'open_upgrade_page';
    };
  };
}

// Smart Notification Delivery
interface NotificationDeliverySystem {
  user_behavior_analysis: {
    track_open_rates: boolean;
    track_action_rates: boolean;
    optimal_time_learning: boolean; // Learn user's best response times
    frequency_optimization: boolean; // Reduce frequency if user doesn't engage
  };

  delivery_rules: {
    max_per_day: 3;
    min_interval_hours: 4;
    respect_do_not_disturb: boolean;
    geofence_awareness: boolean; // Don't send workout reminders when at work
  };

  personalization: {
    tone_adaptation: boolean; // Formal vs casual based on user response
    content_preferences: boolean; // Identity-focused vs goal-focused messaging  
    success_pattern_recognition: boolean; // What messages work best for this user
  };
}