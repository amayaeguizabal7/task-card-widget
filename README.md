# Task Card

**Versión:** 1.0.0

Widget de Figma que muestra una tarjeta de tarea editable con cabecera (nombre del proyecto, última actualización, link), bloques de Descripción, Fechas, Contactos, Recursos y Checklist, y un footer con avatar y badge de estado.

## Cómo usar

1. En Figma, inserta el widget **Task Card** en un frame.
2. Edita los textos directamente en la tarjeta (nombre del proyecto, descripción, fechas, contactos, recursos, tareas).
3. Usa el menú del widget (clic derecho o menú de propiedades) para cambiar el estado: WIP, REVIEW, APPROVED, BLOCKED, ARCHIVED, HANDOFF.
4. Los enlaces "Añadir contacto", "Añadir recurso" y "Añadir tarea" permiten añadir filas; la ✕ elimina filas (en recursos, la primera solo se puede eliminar si tiene texto o hay más de una fila).

## Desarrollo

A continuación los pasos para tener el widget en marcha. Más información en:

https://www.figma.com/widget-docs/setup-guide/

Este widget usa TypeScript y NPM.

1. Instala [Node.js](https://nodejs.org/en/download/) (incluye NPM).
2. En la raíz del proyecto, instala dependencias:

   ```bash
   npm install
   ```

3. Compila TypeScript a JavaScript:

   ```bash
   npm run build
   ```

   Para recompilar al guardar:

   ```bash
   npm run watch
   ```

4. En Figma: **Plugins > Development > Import plugin from manifest...** y selecciona el `manifest.json` de este proyecto.

El código fuente está en `widget-src/code.tsx`; la salida en `dist/code.js`.
