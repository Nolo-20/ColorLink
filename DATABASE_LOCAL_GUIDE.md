# Guía de Conexión a Base de Datos Local - COLORLINK S.A.S.

Esta aplicación ya cuenta con persistencia local automática en archivo estructurado (`/data/local_db.json`) y esquema SQL nativo listo para **PostgreSQL** y **SQLite** (`/src/db/schema.sql`).

---

## Opción 1: Base de Datos Local Actual (Sin configuración requerida)
El servidor ya almacena y recupera los usuarios registrados en tiempo real en:
```
data/local_db.json
```
Cualquier registro completado desde la interfaz o por correo electrónico se guarda inmediatamente en disco.

---

## Opción 2: Conectar con PostgreSQL Local

### 1. Iniciar tu base de datos PostgreSQL local
Si tienes PostgreSQL instalado localmente o con Docker:
```bash
# Con Docker:
docker run --name colorlink-postgres -e POSTGRES_PASSWORD=mi_password -e POSTGRES_DB=colorlink_db -p 5432:5432 -d postgres
```

### 2. Ejecutar el script DDL inicial
Ejecuta el archivo `/src/db/schema.sql` en tu base de datos:
```bash
psql -U postgres -d colorlink_db -f src/db/schema.sql
```

### 3. Configurar tu archivo `.env`
Agrega la variable de entorno:
```env
DATABASE_URL=postgresql://postgres:mi_password@localhost:5432/colorlink_db
```

---

## Opción 3: Conectar con SQLite Local (Archivo .sqlite)

Si prefieres un archivo local `.sqlite` embebido:
1. Instala el conector:
```bash
npm install better-sqlite3 @types/better-sqlite3
```
2. Define en `.env`:
```env
DATABASE_URL=file:./data/colorlink.sqlite
```

---

## Endpoints de Monitoreo de Base de Datos
- **Estado de la BD:** `GET /api/db/status`
- **Diagnóstico General:** `GET /api/database-status`
- **Lista de Usuarios Registrados:** `GET /api/auth/users`
