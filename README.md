# Base de Datos de Víctimas - Usina de Justicia

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ejairsud-3412s-projects/v0-image-analysis)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/GB1CM5Pa1VV)

## Overview

Sistema de gestión y seguimiento de casos de víctimas de inseguridad, desarrollado para Usina de Justicia.

## 🚀 Desarrollo Local

### Modo Mock (Usuario de Prueba)

Por defecto, la aplicación está configurada en **modo desarrollo** con autenticación simplificada para facilitar las pruebas.

**Usuario Mock Activo:**
- Email: `desarrollo@usinajusticia.org`
- Acceso directo sin necesidad de login real
- Indicador visual en el header (badge amarillo)

**Cómo desactivar el modo mock:**

En `components/auth/auth-guard.tsx`, cambia:
```typescript
const DEV_BYPASS_AUTH = true  // Cambiar a false para usar autenticación real
```

### Variables de Entorno Requeridas

Para usar autenticación real con Supabase, necesitas configurar las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Agrega estas variables en la sección **Vars** del sidebar en v0.app.

## 🔧 Características

- ✅ Gestión completa de casos de víctimas
- ✅ Dashboard con estadísticas y gráficos
- ✅ Filtros avanzados por fecha, provincia, estado
- ✅ Carga de documentos y archivos adjuntos
- ✅ Vista animada y vista de grilla
- ✅ Autenticación con Supabase (o modo mock para desarrollo)
- ✅ Integración con base de datos PostgreSQL

## 📦 Deployment

Your project is live at:

**[https://vercel.com/ejairsud-3412s-projects/v0-image-analysis](https://vercel.com/ejairsud-3412s-projects/v0-image-analysis)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/GB1CM5Pa1VV](https://v0.app/chat/projects/GB1CM5Pa1VV)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
