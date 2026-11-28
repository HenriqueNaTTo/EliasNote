import type { UpdatesContent } from "@/landing/i18n/types";

export const esUpdates: UpdatesContent = {
  header: {
    eyebrow: "Actualizaciones",
    title: "Todo lo que cambió, versión por versión.",
    description:
      "El historial público de EliasNote: cada función, corrección e hito de infraestructura que llegó a las versiones, desde la primera beta hasta el dibujo nativo y las notas con edición en vivo.",
  },
  current: "Versión actual",
  allReleases: "Ver todas en GitHub",
  releaseLink: "Abrir versión",
  changesLabel: "Qué cambió",
  kindLabels: {
    initial: "Beta inicial",
    feature: "Novedades",
    fix: "Corrección",
    infra: "Infraestructura",
  },
  releases: {
    "0.7.0": {
      title: "Dibujo nativo y notas con edición en vivo",
      summary: "Un motor de dibujo propio, edición de notas al estilo Obsidian y duplicación más clara.",
      changes: [
        "Editor de dibujo nativo con lápiz, formas, flechas, texto, zoom, historial y exportación PNG/SVG/PDF",
        "Notas con edición en vivo: el marcado solo aparece en la línea activa, con barra de formato inferior",
        "Duplicar selección en el canvas y dentro del dibujo nativo, con feedback y atajos",
      ],
    },
    "0.6.0": {
      title: "Notas en modal y un inspector más limpio",
      summary: "Las notas largas ahora se abren en un editor amplio, con título y Markdown en un solo lugar.",
      changes: [
        "Botón de expandir en la tarjeta de la nota, el inspector y el menú contextual",
        "Editor modal grande con título y Markdown, manteniendo autoguardado e historial",
        "Los títulos con HTML se muestran como texto limpio en el inspector y la búsqueda",
      ],
    },
    "0.5.0": {
      title: "Modo presentación",
      summary: "Presenta un tablero sin la interfaz de la app y recorre el workspace.",
      changes: [
        "Modo de solo lectura que oculta barra lateral, barra superior, inspector y controles",
        "Encuadre automático y navegación con flechas, PageUp/PageDown o botones",
        "Al salir restaura pestañas, pestaña activa y viewports; el filtro de etiquetas se conserva",
      ],
    },
    "0.4.0": {
      title: "Etiquetas editables y filtro por etiqueta",
      summary: "Organiza los elementos con etiquetas y mantén el foco en lo importante.",
      changes: [
        "Editor de etiquetas con chips, sugerencias del tablero y deduplicación",
        "Filtro por etiqueta en el canvas que mantiene las columnas de contexto",
        "Conectores, minimapa y selección respetan el filtro activo",
      ],
    },
    "0.3.0": {
      title: "Panel global de tareas",
      summary: "Fechas límite y prioridades de todos los tableros en una sola vista.",
      changes: [
        "Tareas de todos los workspaces con la ruta del tablero",
        "Grupos de atrasadas, hoy, próximos 7 días, después y sin fecha",
        "Completar y abrir en el canvas; atajo Ctrl/Cmd+Shift+P",
      ],
    },
    "0.2.6": {
      title: "Flechas centradas y pan sobre elementos",
      summary: "Conectores más precisos y una navegación de canvas más fluida.",
      changes: [
        "Las flechas conectadas apuntan al centro de los elementos",
        "Pan con espacio o botón central incluso sobre un elemento",
        "Tolerancia de 12 px al soltar un conector en el destino",
      ],
    },
    "0.2.5": {
      title: "Publicaciones más resistentes",
      summary: "El flujo de publicación ahora respeta el límite de la API de GitHub.",
      changes: [
        "Seguimiento del workflow con control de solicitudes",
        "Correcciones en el proceso de publicación y adjuntos",
        "Sin cambios en el formato de los datos",
      ],
    },
    "0.2.4": {
      title: "Texto libre con formato",
      summary: "Escribe directamente en el canvas con control tipográfico.",
      changes: [
        "Negrita, cursiva, subrayado, tachado y colores",
        "Tamaño, familia tipográfica y alineación por elemento",
        "Barra flotante, inspector y atajos de formato",
      ],
    },
    "0.2.3": {
      title: "Publicar con un comando",
      summary: "Comprobaciones, versión, etiqueta, push y sitio en un solo flujo.",
      changes: [
        "Script único de publicación con typecheck, pruebas y builds",
        "Sincronización de versión en manifiestos y Cargo.lock",
        "Seguimiento del workflow hasta los instaladores",
      ],
    },
    "0.2.2": {
      title: "Código, plantillas de juego y publicación",
      summary: "Más herramientas para game devs y una rutina de publicación.",
      changes: [
        "Nodo de código con resaltado para GDScript, C#, shaders, JSON y más",
        "Plantillas GDD, diseño de niveles, sistemas y sprint de juego",
        "Primera rutina de publicación y assets del proyecto",
      ],
    },
    "0.2.1": {
      title: "Inspector flexible y actualizaciones",
      summary: "Más espacio para editar y aviso cuando hay una nueva versión.",
      changes: [
        "Inspector redimensionable con ancho guardado",
        "Comprobación de la última versión en GitHub",
        "Botón Actualizar en la barra superior cuando hay una versión nueva",
      ],
    },
    "0.2.0": {
      title: "Primera beta pública",
      summary: "El canvas local-first y offline con Excalidraw nativo llega al público.",
      changes: [
        "Canvas infinito, tableros anidados y Excalidraw editable",
        "Notas, tareas, checklists, columnas, conectores, búsqueda y referencias",
        "Autoguardado en SQLite/IndexedDB, copias de seguridad e importación de Obsidian",
      ],
    },
  },
};
