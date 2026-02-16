# 🚀 Guía Completa de Despliegue en Render

## ✅ Pre-requisitos Completados
- [x] Base de datos PostgreSQL creada en Render
- [x] Código subido a GitHub en rama `main`
- [x] Variables de entorno configuradas

---

## 📋 Paso 1: Verificar Variables de Entorno

Según tu captura, tienes estas variables configuradas:

```
DATABASE_URL = postgresql://powerfit_db_owner:qy7N4MjrjNHRNhiJZuhN4PBdRDny7jDdqmqp.dR618wdumZRs7SQqpqHg.a/powerfit_db
JWT_SECRET = powerfit_secret_key_2024_render_production_xyz789
NODE_ENV = production
PORT = 10000
VITE_API_URL = /api
```

### ⚠️ IMPORTANTE: Falta una variable crítica

Necesitas agregar:
```
SESSION_SECRET = tu-secret-super-seguro-para-sesiones-2024
```

**Cómo agregar SESSION_SECRET:**
1. En la página de Environment Variables de Render
2. Click en "Add Environment Variable"
3. Key: `SESSION_SECRET`
4. Value: `powerfit-session-secret-2024-render-xyz789` (o cualquier string largo y aleatorio)
5. Click "Save Changes"

### ✅ Variables Correctas

Las demás variables están bien configuradas:
- ✅ `DATABASE_URL` - Apunta a tu PostgreSQL de Render
- ✅ `NODE_ENV=production` - Modo producción
- ✅ `PORT=10000` - Puerto de Render
- ✅ `JWT_SECRET` - Para tokens de autenticación

### ❌ Variable Innecesaria

- `VITE_API_URL=/api` - Esta NO es necesaria (es para frontend con Vite, no aplica aquí)
- Puedes eliminarla o dejarla, no afecta

---

## 📋 Paso 2: Configurar Build & Start Commands

En la configuración de tu servicio en Render:

### Build Command:
```bash
cd backend && npm install && npm run build && npm run build:css
```

**Explicación:**
- `cd backend` - Entra a la carpeta backend
- `npm install` - Instala dependencias
- `npm run build` - Compila TypeScript a JavaScript
- `npm run build:css` - Genera CSS de Tailwind

### Start Command:
```bash
cd backend && npm start
```

**Explicación:**
- `cd backend` - Entra a la carpeta backend
- `npm start` - Ejecuta `node dist/server.js` en modo producción

---

## 📋 Paso 3: Configurar Root Directory

En la configuración de Render, asegúrate de:

**Root Directory:** (dejar vacío o poner `/`)

Esto es porque tus comandos ya incluyen `cd backend`, así que Render debe empezar desde la raíz del repositorio.

---

## 📋 Paso 4: Ejecutar Migraciones de Base de Datos

Una vez que el servicio esté desplegado, necesitas crear las tablas en la base de datos.

### Opción A: Desde Render Shell (Recomendado)

1. Ve a tu servicio en Render
2. Click en la pestaña "Shell"
3. Ejecuta estos comandos:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### Opción B: Desde tu computadora local

1. Copia el `DATABASE_URL` de Render
2. En tu terminal local:

```bash
cd backend
DATABASE_URL="postgresql://powerfit_db_owner:qy7N4MjrjNHRNhiJZuhN4PBdRDny7jDdqmqp.dR618wdumZRs7SQqpqHg.a/powerfit_db" npx prisma migrate deploy

DATABASE_URL="postgresql://powerfit_db_owner:qy7N4MjrjNHRNhiJZuhN4PBdRDny7jDdqmqp.dR618wdumZRs7SQqpqHg.a/powerfit_db" npx prisma db seed
```

**Esto creará:**
- ✅ Tabla `users`
- ✅ Tabla `products`
- ✅ Usuario admin (admin@powerfit.com / 1234567)
- ✅ 20 productos de ejemplo

---

## 📋 Paso 5: Verificar el Despliegue

### 1. Esperar a que termine el build
- En Render, verás los logs del build
- Debe decir "Build successful" o similar
- Luego dirá "Starting service..."

### 2. Verificar que el servidor inició
Busca en los logs algo como:
```
✅ Server running on port 10000
✅ Database connected successfully
```

### 3. Probar la URL
Tu aplicación estará en:
```
https://powerfit-[tu-id].onrender.com
```

### 4. Verificar endpoints clave:

**Homepage:**
```
https://powerfit-[tu-id].onrender.com/
```
Debe mostrar la página principal con productos

**Login Admin:**
```
https://powerfit-[tu-id].onrender.com/login
```
Prueba con:
- Email: `admin@powerfit.com`
- Password: `1234567`

**Panel Admin:**
```
https://powerfit-[tu-id].onrender.com/admin-products
```
Debe mostrar el panel de administración

---

## 🔧 Paso 6: Solución de Problemas Comunes

### Problema 1: "Application failed to respond"
**Causa:** El servidor no está escuchando en el puerto correcto
**Solución:** Verifica que `PORT=10000` esté en las variables de entorno

### Problema 2: "Database connection failed"
**Causa:** DATABASE_URL incorrecta o base de datos no accesible
**Solución:** 
1. Verifica que la base de datos PostgreSQL esté activa en Render
2. Copia el DATABASE_URL exacto desde la página de la base de datos
3. Actualiza la variable de entorno

### Problema 3: "Session secret required"
**Causa:** Falta SESSION_SECRET
**Solución:** Agrega la variable SESSION_SECRET como se indicó en el Paso 1

### Problema 4: "Cannot find module 'dist/server.js'"
**Causa:** El build no se completó correctamente
**Solución:** 
1. Verifica que el Build Command incluya `npm run build`
2. Revisa los logs del build para ver errores de TypeScript
3. Asegúrate de que `tsconfig.json` esté en la carpeta `backend`

### Problema 5: Estilos CSS no se cargan
**Causa:** El CSS de Tailwind no se generó
**Solución:** 
1. Verifica que el Build Command incluya `npm run build:css`
2. Asegúrate de que `tailwind.config.js` esté en la carpeta `backend`

### Problema 6: Imágenes de productos no se muestran
**Causa:** Las imágenes están en `/backend/public/uploads` localmente
**Solución:** 
- Las imágenes subidas localmente NO estarán en Render
- Necesitas subir nuevas imágenes desde el panel admin en producción
- O usar un servicio de almacenamiento como Cloudinary/AWS S3

---

## 📋 Paso 7: Configuración Adicional (Opcional)

### Auto-Deploy desde GitHub
1. En Render, ve a Settings
2. En "Auto-Deploy" selecciona "Yes"
3. Ahora cada push a `main` desplegará automáticamente

### Custom Domain (Opcional)
1. En Render, ve a Settings
2. En "Custom Domain" agrega tu dominio
3. Configura los DNS según las instrucciones

### Health Check Path
1. En Render, ve a Settings
2. En "Health Check Path" pon: `/`
3. Esto verificará que tu app esté funcionando

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Variables de entorno configuradas (incluyendo SESSION_SECRET)
- [ ] Build Command correcto
- [ ] Start Command correcto
- [ ] Base de datos PostgreSQL activa
- [ ] Migraciones ejecutadas (`prisma migrate deploy`)
- [ ] Seed ejecutado (`prisma db seed`)
- [ ] Homepage carga correctamente
- [ ] Login funciona
- [ ] Panel admin accesible
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] Checkout funciona

---

## 🎯 Resumen de Comandos

### Para configurar en Render:

**Build Command:**
```bash
cd backend && npm install && npm run build && npm run build:css
```

**Start Command:**
```bash
cd backend && npm start
```

### Para ejecutar migraciones (desde Render Shell):

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 📞 Credenciales de Acceso

Una vez desplegado, comparte estas credenciales con tu profesor:

**URL de la aplicación:**
```
https://powerfit-[tu-id].onrender.com
```

**Credenciales de Administrador:**
```
Email: admin@powerfit.com
Contraseña: 1234567
```

**Repositorio GitHub:**
```
https://github.com/[tu-usuario]/[tu-repo]
```

---

## 🚨 Notas Importantes

1. **Primera carga lenta:** Render pone los servicios gratuitos en "sleep" después de inactividad. La primera carga puede tardar 30-60 segundos.

2. **Imágenes:** Las imágenes subidas localmente NO estarán en producción. Necesitas subirlas nuevamente desde el panel admin en Render.

3. **Base de datos:** La base de datos PostgreSQL de Render (plan gratuito) tiene límites de almacenamiento. Suficiente para el proyecto académico.

4. **Logs:** Puedes ver los logs en tiempo real en la pestaña "Logs" de Render para debugging.

5. **Reiniciar:** Si algo falla, puedes hacer "Manual Deploy" para forzar un nuevo despliegue.

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, tu aplicación PowerFit debería estar funcionando en Render. 

**Próximos pasos:**
1. Prueba todas las funcionalidades
2. Sube algunas imágenes de productos desde el panel admin
3. Comparte la URL con tu profesor
4. ¡Disfruta de tu ecommerce en producción! 🚀

---

**Fecha de creación:** Febrero 2026
**Última actualización:** Febrero 2026
