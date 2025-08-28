# 📋 ESPECIFICACIÓN TÉCNICA - ATOMIC SYSTEMS APP (PARTE 1/3)

## 🎯 RESUMEN EJECUTIVO

**Producto:** Atomic Systems - Personal Growth Management App  
**Filosofía:** Basada en "Atomic Habits" de James Clear - Sistemas sobre metas  
**Estrategia:** Desarrollo personal inicial → Escalado gradual → Producto comercial  
**Plataforma:** Web App responsiva (React + Node.js)  
**Hosting:** Railway con servicios separados  

### Diferenciadores Clave
- **Enfoque en sistemas, no metas**: Las metas dan dirección, los sistemas dan resultados
- **Identidad antes que resultados**: "No se trata de lo que quieres lograr, sino de quién quieres ser"
- **Mejora del 1% diario**: Pequeños cambios compuestos que generen grandes resultados
- **Escalabilidad desde día 1**: Arquitectura preparada para crecer de 1 a 1M+ usuarios

## 🏗️ ARQUITECTURA DEL SISTEMA

### Stack Tecnológico Completo

**Frontend:**
- **Framework:** React 18 con TypeScript
- **Build Tool:** Vite (rápido desarrollo y builds)
- **Styling:** Tailwind CSS con design system custom
- **State Management:** React hooks + Context API
- **Forms:** React Hook Form con validaciones
- **Charts:** Chart.js / Recharts para analytics
- **Icons:** Heroicons (consistente con Tailwind)
- **Testing:** Vitest + React Testing Library

**Backend:**
- **Runtime:** Node.js con TypeScript
- **Framework:** Express.js con middleware custom
- **ORM:** Prisma (type-safe database access)
- **Validation:** Zod para schemas de validación
- **Authentication:** JWT + bcrypt para passwords
- **File Upload:** Multer (para futuros avatares/exports)
- **Caching:** Redis para sesiones y cache
- **Email:** SendGrid para transaccional
- **Testing:** Jest + Supertest para API testing

**Infrastructure:**
- **Database:** PostgreSQL (compartido → dedicado)
- **Cache:** Redis (compartido → dedicado)
- **Hosting:** Railway multi-service
- **CDN:** Railway edge locations
- **Monitoring:** Railway logs + custom analytics
- **Payments:** Stripe (activado por feature flag)

### Arquitectura de Servicios

```
Production Architecture:
┌─────────────────────┐    ┌─────────────────────┐
│   Frontend Service  │    │   Backend Service   │
│   (React + Vite)    │────│  (Node.js + API)    │
│   Port: 3000        │    │   Port: 8000        │
└─────────────────────┘    └─────────────────────┘
           │                          │
           │                          │
           └─────────┬──────────────────┘
                     │
           ┌─────────▼──────────┐
           │  Shared Services   │
           │                    │
           │ ┌────────────────┐ │
           │ │  PostgreSQL    │ │
           │ │  (Initial)     │ │
           │ └────────────────┘ │
           │                    │
           │ ┌────────────────┐ │
           │ │     Redis      │ │
           │ │   (Sessions)   │ │
           │ └────────────────┘ │
           └────────────────────┘

Future Dedicated Architecture:
┌─────────────────────┐    ┌─────────────────────┐
│   Frontend Service  │    │   Backend Service   │
│   (React + Vite)    │────│  (Node.js + API)    │
└─────────────────────┘    └─────────────────────┘
           │                          │
           └─────────┬──────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │      Dedicated Services         │
    │                                 │
    │ ┌─────────────────────────────┐ │
    │ │    PostgreSQL Dedicated     │ │
    │ │   (Performance Optimized)   │ │
    │ └─────────────────────────────┘ │
    │                                 │
    │ ┌─────────────────────────────┐ │
    │ │      Redis Dedicated        │ │
    │ │    (Caching + Sessions)     │ │
    │ └─────────────────────────────┘ │
    └─────────────────────────────────┘
```

### Estructura del Proyecto (Simplificada)

```
atomic-systems/
├── apps/
│   ├── frontend/                   # React application
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/         # UI components organizados por tipo
│   │   │   │   ├── ui/            # Componentes base
│   │   │   │   ├── forms/         # Formularios
│   │   │   │   ├── charts/        # Gráficos analytics
│   │   │   │   ├── systems/       # Componentes específicos de sistemas
│   │   │   │   └── layouts/       # Layouts de página
│   │   │   ├── pages/              # Componentes de rutas
│   │   │   │   ├── auth/          # Páginas autenticación
│   │   │   │   ├── app/           # Páginas principales app
│   │   │   │   ├── onboarding/    # Flujo onboarding
│   │   │   │   ├── admin/         # Panel admin (feature flagged)
│   │   │   │   └── marketing/     # Landing pages
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── services/           # Clientes API
│   │   │   ├── utils/              # Utilidades
│   │   │   ├── types/              # Tipos TypeScript
│   │   │   └── styles/             # Estilos globales
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── railway.toml
│   │
│   └── backend/                    # Node.js API
│       ├── src/
│       │   ├── controllers/        # Manejadores de rutas
│       │   ├── middleware/         # Middleware Express
│       │   ├── routes/             # Rutas API
│       │   ├── services/           # Lógica de negocio
│       │   ├── utils/              # Utilidades
│       │   ├── config/             # Configuración
│       │   ├── types/              # Tipos TypeScript
│       │   └── scripts/            # Scripts utilidad
│       ├── prisma/                 # Schema base de datos
│       ├── tests/                  # Archivos test
│       ├── package.json
│       └── railway.toml
│
├── packages/                       # Paquetes compartidos
│   └── shared/
│       ├── types/                  # Tipos compartidos
│       └── utils/                  # Utilidades compartidas
│
├── docs/                           # Documentación
├── package.json                    # Root workspace
├── railway.json                    # Configuración multi-service
└── turbo.json                      # Configuración monorepo
```

## 🗄️ MODELO DE DATOS COMPLETO

### Schema Principal de PostgreSQL

```sql
-- ATOMIC SYSTEMS DATABASE SCHEMA
-- Uses schema namespacing for shared PostgreSQL initially

CREATE SCHEMA IF NOT EXISTS atomic_systems;

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (Central entity)
CREATE TABLE atomic_systems.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en-US',
  
  -- Subscription Management
  subscription_status VARCHAR(20) DEFAULT 'free' 
    CHECK (subscription_status IN ('free', 'premium', 'courtesy', 'family', 'cancelled')),
  subscription_id VARCHAR(255),
  subscription_expiry TIMESTAMP,
  
  -- User Preferences
  language VARCHAR(5) DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00',
  week_starts_on INTEGER DEFAULT 1 CHECK (week_starts_on IN (0, 1)), -- 0=Sunday, 1=Monday
  
  -- Account Status
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for common queries
  INDEX idx_users_email (email),
  INDEX idx_users_subscription (subscription_status),
  INDEX idx_users_active (is_active, created_at)
);

-- Life Areas (Personal development categories)
CREATE TABLE atomic_systems.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Icon identifier for UI
  color VARCHAR(7),  -- Hex color for visualization
  
  -- Scoring and Goals
  current_score INTEGER CHECK (current_score >= 1 AND current_score <= 10),
  desired_identity TEXT,  -- "Soy una persona atlética y saludable"
  goal_direction TEXT,    -- "Estar en la mejor forma física de mi vida"
  
  -- Priority and Status
  priority INTEGER CHECK (priority >= 1 AND priority <= 10),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite indexes
  INDEX idx_life_areas_user_active (user_id, is_active),
  INDEX idx_life_areas_priority (user_id, priority, is_active)
);

-- Systems (Core habits/routines - heart of the application)
CREATE TABLE atomic_systems.systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  life_area_id UUID REFERENCES atomic_systems.life_areas(id) ON DELETE CASCADE,
  
  -- System Definition
  name VARCHAR(200) NOT NULL,
  description TEXT,
  identity TEXT,           -- "Soy alguien que se ejercita todos los días"
  minimum_version TEXT,    -- "2 flexiones al despertar"
  
  -- Execution Framework (James Clear's 4 Laws)
  trigger_text TEXT,       -- "Después de lavarme los dientes"
  routine_text TEXT,       -- "Hago 20 flexiones"
  reward TEXT,             -- "Me tomo un café especial"
  environment_cue TEXT,    -- "Ropa deportiva al lado de la cama"
  
  -- Scheduling and Timing
  time_of_day VARCHAR(20) CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  estimated_minutes INTEGER CHECK (estimated_minutes > 0),
  preferred_time TIME,     -- Specific time if user prefers
  
  -- Environment Design
  environment_notes TEXT,
  preparation_needed TEXT[], -- Array of preparation steps
  obstacles_anticipated TEXT[], -- Common obstacles and solutions
  
  -- System Status and Ratings
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  paused_until DATE,       -- Temporary pause
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  attractiveness INTEGER CHECK (attractiveness >= 1 AND attractiveness <= 5),
  obviousness INTEGER CHECK (obviousness >= 1 AND obviousness <= 5),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  
  -- Tracking and Analytics
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_executed DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_systems_user_active (user_id, is_active),
  INDEX idx_systems_area_active (life_area_id, is_active),
  INDEX idx_systems_execution (user_id, last_executed, current_streak)
);

-- Daily Executions (Core tracking mechanism)
CREATE TABLE atomic_systems.daily_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  system_id UUID REFERENCES atomic_systems.systems(id) ON DELETE CASCADE,
  execution_date DATE NOT NULL,
  
  -- Execution Details
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  actual_minutes INTEGER,
  notes TEXT,
  
  -- Context and Quality Metrics
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  difficulty_felt INTEGER CHECK (difficulty_felt >= 1 AND difficulty_felt <= 5),
  satisfaction_felt INTEGER CHECK (satisfaction_felt >= 1 AND satisfaction_felt <= 5),
  
  -- Environment and Circumstances
  location VARCHAR(100),   -- Where it was done
  weather VARCHAR(50),     -- Weather conditions (optional)
  circumstances TEXT,      -- Special circumstances
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint and indexes
  UNIQUE(system_id, execution_date),
  INDEX idx_daily_executions_user_date (user_id, execution_date),
  INDEX idx_daily_executions_system_date (system_id, execution_date),
  INDEX idx_daily_executions_completed (system_id, execution_date, completed) WHERE completed = true,
  INDEX idx_daily_executions_streak (system_id, execution_date DESC, completed)
);

-- Daily Check-ins (Overall reflection and planning)
CREATE TABLE atomic_systems.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  
  -- Overall Daily Assessment
  overall_mood INTEGER CHECK (overall_mood >= 1 AND overall_mood <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  productivity INTEGER CHECK (productivity >= 1 AND productivity <= 5),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  
  -- Reflection and Learning
  notes TEXT,
  challenges_faced TEXT,
  what_worked TEXT,
  what_didnt_work TEXT,
  lessons_learned TEXT,
  
  -- Planning and Preparation
  tomorrow_preparation TEXT,
  tomorrow_focus TEXT,
  obstacles_anticipated TEXT,
  
  -- Identity and Progress
  identity_reinforced TEXT[], -- Which identities were reinforced today
  wins TEXT[],                -- Daily wins and celebrations
  areas_for_improvement TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint and indexes
  UNIQUE(user_id, log_date),
  INDEX idx_daily_logs_user_date (user_id, log_date)
);

-- Monthly Reviews (Strategic evaluation and planning)
CREATE TABLE atomic_systems.monthly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  life_area_id UUID REFERENCES atomic_systems.life_areas(id) ON DELETE CASCADE,
  review_month INTEGER CHECK (review_month >= 1 AND review_month <= 12),
  review_year INTEGER CHECK (review_year >= 2024),
  
  -- Life Area Progression
  previous_score INTEGER CHECK (previous_score >= 1 AND previous_score <= 10),
  current_score INTEGER CHECK (current_score >= 1 AND current_score <= 10),
  score_change INTEGER, -- Calculated field
  
  -- Strategic Reflection
  what_worked TEXT NOT NULL,
  what_didnt_work TEXT NOT NULL,
  adjustments_needed TEXT NOT NULL,
  next_month_focus TEXT NOT NULL,
  
  -- System Evaluations (JSON structure for flexibility)
  systems_evaluation JSONB, -- Detailed evaluation of each system
  
  -- Identity and Goal Alignment
  identity_progress TEXT,
  goal_alignment_score INTEGER CHECK (goal_alignment_score >= 1 AND goal_alignment_score <= 10),
  
  -- Key Metrics Summary
  systems_completed INTEGER DEFAULT 0,
  avg_consistency DECIMAL(5,2), -- Average consistency percentage
  longest_streak_month INTEGER DEFAULT 0,
  
  -- Planning for Next Month
  new_systems_planned TEXT[],
  systems_to_modify TEXT[],
  systems_to_remove TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint and indexes
  UNIQUE(user_id, life_area_id, review_month, review_year),
  INDEX idx_monthly_reviews_user_period (user_id, review_year, review_month)
);

-- =============================================
-- SUBSCRIPTION & PAYMENTS TABLES (Feature Flagged)
-- =============================================

-- Subscriptions (Stripe integration)
CREATE TABLE atomic_systems.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  
  -- Stripe Integration
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  
  -- Subscription Details
  status VARCHAR(50) DEFAULT 'inactive' 
    CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'inactive', 'trialing')),
  plan VARCHAR(50) CHECK (plan IN ('monthly', 'annual', 'family')),
  
  -- Billing Periods
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  canceled_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_subscriptions_stripe_customer (stripe_customer_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_user_active (user_id, status)
);

-- Courtesy Accounts (Free premium access)
CREATE TABLE atomic_systems.courtesy_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  
  -- Courtesy Details
  type VARCHAR(20) CHECK (type IN ('full', 'temporal', 'conditional')),
  reason VARCHAR(255) NOT NULL, -- Why courtesy was granted
  duration_days INTEGER,        -- For temporal courtesies
  condition_text TEXT,          -- For conditional courtesies
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  
  -- Administrative
  granted_by_admin_id UUID, -- References admin_users(id)
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by_admin_id UUID,
  revoke_reason TEXT,
  
  -- Notes
  internal_notes TEXT,
  
  -- Indexes
  INDEX idx_courtesy_user_active (user_id, is_active),
  INDEX idx_courtesy_expiry (expires_at, is_active)
);

-- =============================================
-- ADMIN & ANALYTICS TABLES (Feature Flagged)
-- =============================================

-- Admin Users (Administrative access)
CREATE TABLE atomic_systems.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Role and Permissions
  role VARCHAR(50) DEFAULT 'admin' 
    CHECK (role IN ('super_admin', 'customer_success', 'finance', 'marketing', 'support')),
  permissions TEXT[], -- Array of permission strings
  
  -- Personal Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Activity Tracking
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_admin_users_email (email),
  INDEX idx_admin_users_role (role, is_active)
);

-- Audit Logs (Track administrative actions)
CREATE TABLE atomic_systems.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who performed the action
  admin_user_id UUID REFERENCES atomic_systems.admin_users(id),
  user_id UUID REFERENCES atomic_systems.users(id), -- Target user (if applicable)
  
  -- Action Details
  action VARCHAR(100) NOT NULL, -- 'user_created', 'subscription_updated', etc.
  resource VARCHAR(100) NOT NULL, -- 'user', 'subscription', 'system', etc.
  resource_id VARCHAR(255) NOT NULL, -- ID of the affected resource
  
  -- Change Tracking
  old_values JSONB, -- Previous state
  new_values JSONB, -- New state
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(255), -- For correlating related actions
  
  -- Additional Context
  notes TEXT,
  severity VARCHAR(20) DEFAULT 'info' 
    CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for querying
  INDEX idx_audit_logs_admin_user (admin_user_id, created_at),
  INDEX idx_audit_logs_resource (resource, resource_id, created_at),
  INDEX idx_audit_logs_action (action, created_at),
  INDEX idx_audit_logs_user (user_id, created_at),
  INDEX idx_audit_logs_severity (severity, created_at)
);

-- Analytics Events (User behavior tracking)
CREATE TABLE atomic_systems.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and Session
  user_id UUID REFERENCES atomic_systems.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  anonymous_id VARCHAR(255), -- For pre-registration tracking
  
  -- Event Details
  event_name VARCHAR(100) NOT NULL, -- 'system_completed', 'streak_achieved', etc.
  event_category VARCHAR(50), -- 'engagement', 'conversion', 'retention'
  
  -- Event Properties (flexible JSON structure)
  properties JSONB,
  
  -- Context
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Geographic Data
  country_code VARCHAR(2),
  city VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Device Information
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  operating_system VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for analytics queries
  INDEX idx_analytics_events_user_date (user_id, created_at),
  INDEX idx_analytics_events_name_date (event_name, created_at),
  INDEX idx_analytics_events_category_date (event_category, created_at),
  INDEX idx_analytics_events_session (session_id, created_at)
);

-- =============================================
-- PERFORMANCE AND MAINTENANCE INDEXES
-- =============================================

-- Additional composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_user_system_executions 
  ON atomic_systems.daily_executions(user_id, system_id, execution_date DESC);

CREATE INDEX CONCURRENTLY idx_streak_calculation 
  ON atomic_systems.daily_executions(system_id, execution_date DESC, completed) 
  WHERE completed = true;

CREATE INDEX CONCURRENTLY idx_analytics_user_period 
  ON atomic_systems.daily_executions(user_id, execution_date) 
  INCLUDE (system_id, completed, mood, difficulty_felt);

CREATE INDEX CONCURRENTLY idx_active_systems_user 
  ON atomic_systems.systems(user_id, is_active, created_at) 
  WHERE is_active = true;

-- Partial indexes for specific queries
CREATE INDEX CONCURRENTLY idx_recent_executions 
  ON atomic_systems.daily_executions(user_id, execution_date DESC) 
  WHERE execution_date >= CURRENT_DATE - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY idx_premium_users 
  ON atomic_systems.users(subscription_status, created_at) 
  WHERE subscription_status IN ('premium', 'courtesy');
```

## 🎛️ SISTEMA DE FEATURE FLAGS

### Configuración Backend

```typescript
// Feature Flags Configuration
interface FeatureFlags {
  // Core Features (Always enabled)
  CORE_SYSTEMS: boolean;
  DAILY_TRACKING: boolean;
  BASIC_ANALYTICS: boolean;
  
  // Gradual Rollout Features
  SUBSCRIPTION_SYSTEM: boolean;      // OFF initially
  ADMIN_PANEL: boolean;             // OFF initially  
  EMAIL_NOTIFICATIONS: boolean;     // OFF initially
  ADVANCED_ANALYTICS: boolean;      // OFF initially
  SOCIAL_FEATURES: boolean;         // Future feature
  
  // User-specific flags
  BETA_TESTER: boolean;
  EARLY_ACCESS: boolean;
}

// Environment-based Feature Control
const getFeatureFlags = (): FeatureFlags => {
  const env = process.env.NODE_ENV;
  const isDev = env === 'development';
  
  return {
    // Core features (always enabled)
    CORE_SYSTEMS: true,
    DAILY_TRACKING: true,
    BASIC_ANALYTICS: true,
    
    // Environment controlled features
    SUBSCRIPTION_SYSTEM: process.env.FEATURE_SUBSCRIPTION === 'true',
    ADMIN_PANEL: process.env.FEATURE_ADMIN === 'true',
    EMAIL_NOTIFICATIONS: process.env.FEATURE_EMAILS === 'true',
    ADVANCED_ANALYTICS: process.env.FEATURE_ANALYTICS === 'true',
    SOCIAL_FEATURES: process.env.FEATURE_SOCIAL === 'true',
    
    // Development flags
    BETA_TESTER: isDev || process.env.BETA_USER === 'true',
    EARLY_ACCESS: isDev || process.env.EARLY_ACCESS === 'true',
  };
};

// Feature Flag Middleware
const featureFlag = (flag: keyof FeatureFlags) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const flags = getFeatureFlags();
    
    if (!flags[flag]) {
      return res.status(404).json({ 
        error: 'Feature not available',
        code: 'FEATURE_DISABLED'
      });
    }
    
    next();
  };
};
```

### Hook Frontend para Feature Flags

```typescript
// Frontend Feature Flags Hook
import { useState, useEffect } from 'react';

interface ClientFeatureFlags {
  CORE_SYSTEMS: boolean;
  DAILY_TRACKING: boolean;
  BASIC_ANALYTICS: boolean;
  SUBSCRIPTION_SYSTEM: boolean;
  ADMIN_PANEL: boolean;
  EMAIL_NOTIFICATIONS: boolean;
  ADVANCED_ANALYTICS: boolean;
  SOCIAL_FEATURES: boolean;
  BETA_TESTER: boolean;
  EARLY_ACCESS: boolean;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<ClientFeatureFlags>({
    // Default to environment variables
    CORE_SYSTEMS: true,
    DAILY_TRACKING: true,
    BASIC_ANALYTICS: true,
    SUBSCRIPTION_SYSTEM: import.meta.env.VITE_FEATURE_SUBSCRIPTION === 'true',
    ADMIN_PANEL: import.meta.env.VITE_FEATURE_ADMIN === 'true',
    EMAIL_NOTIFICATIONS: import.meta.env.VITE_FEATURE_EMAILS === 'true',
    ADVANCED_ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
    SOCIAL_FEATURES: import.meta.env.VITE_FEATURE_SOCIAL === 'true',
    BETA_TESTER: import.meta.env.DEV || import.meta.env.VITE_BETA_USER === 'true',
    EARLY_ACCESS: import.meta.env.DEV || import.meta.env.VITE_EARLY_ACCESS === 'true',
  });

  const hasFeature = (feature: keyof ClientFeatureFlags): boolean => {
    return flags[feature];
  };

  const isFeatureEnabled = (feature: keyof ClientFeatureFlags): boolean => {
    return flags[feature];
  };

  return { 
    flags, 
    hasFeature, 
    isFeatureEnabled 
  };
};

// Component wrapper for feature flags
interface FeatureWrapperProps {
  feature: keyof ClientFeatureFlags;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  feature,
  fallback = null,
  children
}) => {
  const { hasFeature } = useFeatureFlags();
  
  if (!hasFeature(feature)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

### Fases de Activación

```typescript
// Development Phases Configuration
const DEVELOPMENT_PHASES = {
  // Phase 1: Personal Use (Weeks 1-4)
  PHASE_1: {
    duration: '4 weeks',
    description: 'Solo uso personal para testing y refinamiento',
    activeFlags: {
      CORE_SYSTEMS: true,
      DAILY_TRACKING: true,
      BASIC_ANALYTICS: true,
      ADVANCED_ANALYTICS: true, // Para obtener insights personales
      SUBSCRIPTION_SYSTEM: false,
      ADMIN_PANEL: false,
      EMAIL_NOTIFICATIONS: false,
      SOCIAL_FEATURES: false
    },
    goals: [
      'Validar funcionalidad core',
      'Refinar UX basado en uso real',
      'Optimizar performance',
      'Debuggear edge cases'
    ]
  },

  // Phase 2: Beta Testing (Weeks 5-8)
  PHASE_2: {
    duration: '4 weeks', 
    description: 'Invitar 5-10 beta testers para feedback',
    activeFlags: {
      CORE_SYSTEMS: true,
      DAILY_TRACKING: true,
      BASIC_ANALYTICS: true,
      ADVANCED_ANALYTICS: true,
      EMAIL_NOTIFICATIONS: true, // Ahora útil para múltiples usuarios
      SUBSCRIPTION_SYSTEM: true, // Preparar monetización
      ADMIN_PANEL: false, // Aún no necesario
      SOCIAL_FEATURES: false
    },
    goals: [
      'Validar product-market fit inicial',
      'Optimizar onboarding',
      'Testear sistema de emails',
      'Preparar infraestructura de pagos'
    ]
  },

  // Phase 3: Soft Launch (Weeks 9-12)
  PHASE_3: {
    duration: '4 weeks',
    description: 'Lanzamiento controlado con monetización',
    activeFlags: {
      CORE_SYSTEMS: true,
      DAILY_TRACKING: true,
      BASIC_ANALYTICS: true,
      ADVANCED_ANALYTICS: true,
      EMAIL_NOTIFICATIONS: true,
      SUBSCRIPTION_SYSTEM: true,
      ADMIN_PANEL: true, // Ahora necesario para gestionar usuarios
      SOCIAL_FEATURES: false // Próxima fase
    },
    goals: [
      'Validar modelo de monetización',
      'Optimizar conversión free-to-paid',
      'Implementar customer success',
      'Preparar para marketing'
    ]
  },

  // Phase 4: Public Launch (Week 13+)
  PHASE_4: {
    duration: 'Ongoing',
    description: 'Lanzamiento público completo',
    activeFlags: {
      CORE_SYSTEMS: true,
      DAILY_TRACKING: true,
      BASIC_ANALYTICS: true,
      ADVANCED_ANALYTICS: true,
      EMAIL_NOTIFICATIONS: true,
      SUBSCRIPTION_SYSTEM: true,
      ADMIN_PANEL: true,
      SOCIAL_FEATURES: true // Features sociales para retención
    },
    goals: [
      'Escalar adquisición de usuarios',
      'Optimizar retención long-term',
      'Expandir features premium',
      'Construir comunidad'
    ]
  }
};
```

## 📱 ESTRUCTURA DE RUTAS COMPLETA

### Frontend Routes con Feature Gates

```typescript
// Route Configuration with Feature Flags
interface RouteConfig {
  path: string;
  component: React.ComponentType;
  public?: boolean;
  protected?: boolean;
  requiresFeature?: keyof ClientFeatureFlags;
  requiresSubscription?: boolean;
  requiresRole?: 'admin' | 'user';
  redirect?: string;
}

export const routes: RouteConfig[] = [
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: '/',
    component: LandingPage,
    public: true
  },
  {
    path: '/login',
    component: LoginPage,
    public: true
  },
  {
    path: '/register', 
    component: RegisterPage,
    public: true
  },
  {
    path: '/forgot-password',
    component: ForgotPasswordPage,
    public: true
  },
  {
    path: '/reset-password/:token',
    component: ResetPasswordPage,
    public: true
  },
  {
    path: '/pricing',
    component: PricingPage,
    public: true,
    requiresFeature: 'SUBSCRIPTION_SYSTEM'
  },
  {
    path: '/about',
    component: AboutPage,
    public: true
  },
  {
    path: '/privacy',
    component: PrivacyPolicyPage,
    public: true
  },
  {
    path: '/terms',
    component: TermsOfServicePage,
    public: true
  },

  // ==========================================
  // PROTECTED APP ROUTES
  // ==========================================
  
  // Dashboard and Core Features
  {
    path: '/app',
    redirect: '/app/today'
  },
  {
    path: '/app/today',
    component: DashboardPage,
    protected: true,
    requiresFeature: 'DAILY_TRACKING'
  },
  {
    path: '/app/systems',
    component: SystemsListPage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },
  {
    path: '/app/systems/new',
    component: SystemCreatePage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },
  {
    path: '/app/systems/:id',
    component: SystemDetailPage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },
  {
    path: '/app/systems/:id/edit',
    component: SystemEditPage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },

  // Progress and Analytics
  {
    path: '/app/progress',
    component: ProgressPage,
    protected: true,
    requiresFeature: 'BASIC_ANALYTICS'
  },
  {
    path: '/app/progress/advanced',
    component: AdvancedAnalyticsPage,
    protected: true,
    requiresFeature: 'ADVANCED_ANALYTICS',
    requiresSubscription: true
  },

  // Life Areas Management
  {
    path: '/app/areas',
    component: LifeAreasPage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },
  {
    path: '/app/areas/new',
    component: LifeAreaCreatePage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },
  {
    path: '/app/areas/:id',
    component: LifeAreaDetailPage,
    protected: true,
    requiresFeature: 'CORE_SYSTEMS'
  },
  {
    path: '/app/areas/:id/review',
    component: MonthlyReviewPage,
    protected: true,
    requiresFeature: 'ADVANCED_ANALYTICS'
  },

  // ==========================================
  // ONBOARDING FLOW
  // ==========================================
  {
    path: '/app/welcome',
    component: WelcomePage,
    protected: true
  },
  {
    path: '/app/setup/areas',
    component: AreasSetupPage,
    protected: true
  },
  {
    path: '/app/setup/identity',
    component: IdentitySetupPage,
    protected: true
  },
  {
    path: '/app/setup/systems',
    component: SystemsSetupPage,
    protected: true
  },
  {
    path: '/app/setup/complete',
    component: OnboardingCompletePage,
    protected: true
  },

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  {
    path: '/app/settings',
    component: UserSettingsPage,
    protected: true
  },
  {
    path: '/app/settings/account',
    component: AccountSettingsPage,
    protected: true
  },
  {
    path: '/app/settings/notifications',
    component: NotificationSettingsPage,
    protected: true,
    requiresFeature: 'EMAIL_NOTIFICATIONS'
  },
  {
    path: '/app/settings/data',
    component: DataExportPage,
    protected: true,
    requiresSubscription: true
  },

  // ==========================================
  // SUBSCRIPTION MANAGEMENT (Feature Gated)
  // ==========================================
  {
    path: '/app/billing',
    component: BillingPage,
    protected: true,
    requiresFeature: 'SUBSCRIPTION_SYSTEM'
  },
  {
    path: '/app/billing/success',
    component: BillingSuccessPage,
    protected: true,
    requiresFeature: 'SUBSCRIPTION_SYSTEM'
  },
  {
    path: '/app/billing/canceled',
    component: BillingCanceledPage,
    protected: true,
    requiresFeature: 'SUBSCRIPTION_SYSTEM'
  },
  {
    path: '/app/upgrade',
    component: UpgradePage,
    protected: true,
    requiresFeature: 'SUBSCRIPTION_SYSTEM'
  },

  // ==========================================
  // ADMIN PANEL (Feature Gated)
  // ==========================================
  {
    path: '/admin',
    component: AdminDashboardPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },
  {
    path: '/admin/users',
    component: AdminUsersPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },
  {
    path: '/admin/users/:id',
    component: AdminUserDetailPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },
  {
    path: '/admin/subscriptions',
    component: AdminSubscriptionsPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },
  {
    path: '/admin/analytics',
    component: AdminAnalyticsPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },
  {
    path: '/admin/support',
    component: AdminSupportPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },
  {
    path: '/admin/settings',
    component: AdminSettingsPage,
    protected: true,
    requiresFeature: 'ADMIN_PANEL',
    requiresRole: 'admin'
  },

  // ==========================================
  // ERROR PAGES
  // ==========================================
  {
    path: '/404',
    component: NotFoundPage,
    public: true
  },
  {
    path: '/403',
    component: ForbiddenPage,
    public: true
  },
  {
    path: '/500',
    component: ServerErrorPage,
    public: true
  },
  {
    path: '*',
    redirect: '/404'
  }
];
```

### Backend API Routes Structure

```
# ==========================================
# AUTHENTICATION ROUTES
# ==========================================
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/verify-email/:token
POST   /api/v1/auth/resend-verification
GET    /api/v1/auth/me

# ==========================================
# USER MANAGEMENT ROUTES
# ==========================================
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
PUT    /api/v1/users/password
PUT    /api/v1/users/preferences
DELETE /api/v1/users/account
GET    /api/v1/users/export-data          # Requires premium

# ==========================================
# LIFE AREAS ROUTES
# ==========================================
GET    /api/v1/life-areas
POST   /api/v1/life-areas                 # Free: max 1, Premium: unlimited
GET    /api/v1/life-areas/:id
PUT    /api/v1/life-areas/:id
DELETE /api/v1/life-areas/:id
PUT    /api/v1/life-areas/:id/score

# ==========================================
# SYSTEMS ROUTES (Core Feature)
# ==========================================
GET    /api/v1/systems
POST   /api/v1/systems                    # Free: max 2, Premium: unlimited
GET    /api/v1/systems/:id
PUT    /api/v1/systems/:id
DELETE /api/v1/systems/:id
PUT    /api/v1/systems/:id/pause
PUT    /api/v1/systems/:id/reactivate
GET    /api/v1/systems/:id/analytics      # Premium only for advanced

# ==========================================
# DAILY EXECUTIONS ROUTES
# ==========================================
GET    /api/v1/executions/today
GET    /api/v1/executions/:date
POST   /api/v1/executions/complete/:systemId
DELETE /api/v1/executions/uncomplete/:systemId
PUT    /api/v1/executions/:id/notes
GET    /api/v1/executions/:systemId/history # Free: 30 days, Premium: unlimited

# ==========================================
# DAILY LOGS ROUTES
# ==========================================
GET    /api/v1/daily-log/:date
POST   /api/v1/daily-log
PUT    /api/v1/daily-log/:date
GET    /api/v1/daily-log/history          # Free: 30 days, Premium: unlimited

# ==========================================
# ANALYTICS ROUTES (Feature Gated)
# ==========================================
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/systems/:id
GET    /api/v1/analytics/weekly
GET    /api/v1/analytics/monthly          # Premium only
GET    /api/v1/analytics/streaks
GET    /api/v1/analytics/trends           # Premium only
GET    /api/v1/analytics/export           # Premium only

# ==========================================
# MONTHLY REVIEWS ROUTES
# ==========================================
GET    /api/v1/reviews/monthly/:year/:month
POST   /api/v1/reviews/monthly
PUT    /api/v1/reviews/:id
GET    /api/v1/reviews/due
GET    /api/v1/reviews/history            # Premium only

# ==========================================
# SUBSCRIPTION ROUTES (Feature Flagged: SUBSCRIPTION_SYSTEM)
# ==========================================
GET    /api/v1/subscriptions/plans
POST   /api/v1/subscriptions/checkout
GET    /api/v1/subscriptions/portal
PUT    /api/v1/subscriptions/upgrade
PUT    /api/v1/subscriptions/cancel
GET    /api/v1/subscriptions/status
POST   /api/v1/webhooks/stripe

# ==========================================
# ADMIN ROUTES (Feature Flagged: ADMIN_PANEL)
# ==========================================
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
POST   /api/v1/admin/users/:id/courtesy
DELETE /api/v1/admin/users/:id/courtesy
PUT    /api/v1/admin/users/:id/subscription

GET    /api/v1/admin/subscriptions
GET    /api/v1/admin/analytics
GET    /api/v1/admin/analytics/export

GET    /api/v1/admin/support/tickets
POST   /api/v1/admin/support/tickets/:id/reply

GET    /api/v1/admin/emails/templates
POST   /api/v1/admin/emails/send
GET    /api/v1/admin/emails/campaigns

GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/system/health

# ==========================================
# HEALTH AND MONITORING ROUTES
# ==========================================
GET    /api/health
GET    /api/health/detailed
GET    /api/version
```