# Los Premios — Gala de Amigos

Aplicación de votación informal para una ceremonia de premios entre amigos.

## Configuración local

### Requisitos
- Node.js 18+
- npm o pnpm

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de entorno
cp .env.example .env
# Edita .env si quieres cambiar la contraseña de admin

# 3. Crear la base de datos y aplicar migraciones
npx prisma migrate dev --name init

# 4. Poblar la base de datos con datos iniciales
npx tsx prisma/seed.ts

# 5. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Acceso

| Ruta | Descripción |
|------|-------------|
| `localhost:3000` | Página de votación (requiere código) |
| `localhost:3000/resultados` | Resultados públicos |
| `localhost:3000/admin` | Login de administrador |
| `localhost:3000/admin/dashboard` | Panel de administración |

- **Contraseña de admin:** `admin123` (configurable en `.env`)

## Códigos de prueba

Disponibles tras ejecutar el seed:

| Código | Etiqueta |
|--------|----------|
| `TEST01` | Test A |
| `TEST02` | Test B |
| `TEST03` | Test C |

Para reutilizarlos después de votar, ve al panel de admin → Resumen → "Resetear votos de prueba".

## Flujo de uso

1. El admin abre la votación desde el panel (Resumen → "Abrir votación")
2. Cada participante ingresa su código en la página principal
3. El participante vota en todas las categorías (3 posiciones por categoría)
4. Los resultados son visibles en `/resultados`

## Deploy en Railway

1. Crea un nuevo proyecto en [Railway](https://railway.app)
2. Conecta tu repositorio
3. Agrega un **disco persistente** montado en `/app/prisma` (o donde esté `dev.db`)
4. Configura las variables de entorno:
   - `DATABASE_URL=file:/app/prisma/prod.db`
   - `ADMIN_PASSWORD=tu_contraseña_segura`
5. El comando de build ejecutará `prisma generate` automáticamente (postinstall)
6. Ejecuta las migraciones manualmente o agrega un script de release:
   ```
   npx prisma migrate deploy && npx tsx prisma/seed.ts
   ```

## Comandos útiles

```bash
npm run db:migrate    # Crear nueva migración
npm run db:seed       # Poblar base de datos
npm run db:studio     # Abrir Prisma Studio (GUI)
npm run build         # Build de producción
npm run start         # Iniciar en modo producción
```
