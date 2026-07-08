# VM TechStore

Aplicacion web para la gestion de clientes, productos, inventario y ventas del Centro de Soluciones Tecnologicas e Informaticas VM.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: MySQL
- Seguridad: Helmet, CORS controlado, validacion con Joi, consultas parametrizadas con mysql2
- API REST externa: DummyJSON Products para sugerencias de productos tecnologicos

## Acceso

- Usuario: `admin`
- Clave: `admin123`

La clave se valida contra el usuario guardado en MySQL en la tabla `users`. En la base se almacena como hash bcrypt, no como texto plano.

## Instalacion

1. Crear la base de datos en MySQL:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

2. Configurar variables:

```bash
copy server\.env.example server\.env
```

3. Instalar dependencias:

```bash
npm.cmd install
npm.cmd run install:all
```

4. Ejecutar:

```bash
npm.cmd run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Pantallas principales

- Inicio publico con informacion general de productos y datos reales de VM.
- Login administrativo.
- Panel privado para CRUD de productos, clientes, ventas, inventario y consumo de API externa.
- Pedidos desde el catalogo publico con formulario obligatorio de cedula, nombres, celular, correo y direccion.
- Despacho/cancelacion de pedidos desde administracion; al despachar se descuenta inventario.
- Gestion de usuarios por rol: administrador y empleado. El empleado registra productos y ventas, pero no crea usuarios.
- Validacion de celulares ecuatorianos: 10 digitos numericos y prefijo 09.
- Las ventas realizadas no se eliminan para evitar descuadres de inventario.

## Repositorio GitHub

Para publicarlo:

```bash
git init
git add .
git commit -m "Proyecto VM TechStore"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/vm-techstore.git
git push -u origin main
```
