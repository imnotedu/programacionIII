# ✅ Solución: Error con @apply en Tailwind CSS v4

## Problema Identificado

```
Error: Cannot apply unknown utility class `border-border`
```

**Causa:** Tailwind CSS v4 cambió cómo funciona `@apply`. Ya no puedes usar clases personalizadas que referencian variables CSS directamente.

## Cambios en Tailwind v4

### ❌ Lo que ya NO funciona:

```css
@layer base {
  * {
    @apply border-border;  /* ❌ Error en v4 */
  }
}

.btn-primary {
  @apply bg-primary text-primary-foreground;  /* ❌ Error en v4 */
}
```

### ✅ Lo que SÍ funciona:

```css
@layer base {
  * {
    border-color: hsl(var(--border));  /* ✅ CSS directo */
  }
}

.btn-primary {
  background-color: hsl(var(--primary));  /* ✅ CSS directo */
  color: hsl(var(--primary-foreground));
}
```

## Solución Aplicada

Convertimos todas las clases que usaban `@apply` con variables CSS personalizadas a CSS estándar:

### Antes (Tailwind v3):
```css
.btn-primary {
  @apply bg-primary text-primary-foreground font-semibold px-6 py-3;
}
```

### Después (Tailwind v4):
```css
.btn-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  padding: 0.75rem 1.5rem;
}
```

## Archivo Modificado

**`backend/src/index.css`**

Cambios realizados:
- ✅ Removido `@apply border-border` → Cambiado a `border-color: hsl(var(--border))`
- ✅ Convertidas todas las clases de componentes de `@apply` a CSS estándar
- ✅ Mantenida toda la funcionalidad (hover, active, disabled, etc.)

## Regla General para Tailwind v4

**Cuándo usar `@apply`:**
- ✅ Con clases de utilidad de Tailwind: `@apply flex items-center`
- ✅ Con clases estándar: `@apply text-lg font-bold`

**Cuándo NO usar `@apply`:**
- ❌ Con clases que referencian variables CSS personalizadas: `bg-primary`, `text-foreground`
- ❌ Con clases personalizadas que definiste tú mismo

**Solución:** Usa CSS estándar con `hsl(var(--variable))` para variables personalizadas.

## Pasos para Desplegar

```bash
cd "suplementos eduardo/fitness-fuel-store"
git add backend/src/index.css SOLUCION-TAILWIND-V4-APPLY.md
git commit -m "fix: convertir @apply a CSS estándar para Tailwind v4"
git push origin main
```

## Estado Actual

✅ Errores de TypeScript resueltos
✅ Tailwind CSS v4 CLI configurado
✅ Sintaxis @apply actualizada para v4
⏳ Pendiente: commit y push
⏳ Pendiente: verificar build en Render

---

**Fecha:** Febrero 2026
