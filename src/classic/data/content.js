// Todo el contenido de la web vive aquí. Edita este archivo y nada más.

// Versión 3D: es la otra vista de esta misma web (src/App.jsx). El botón «Ver versión 3D»
// cambia a ella sin recargar; el enlace directo es /?modo=3d.

// Contacto (sacado del CV). Si alguno queda vacío (''), su botón no se muestra.
export const contactEmail = '2002juanan@gmail.com'
export const linkedinUrl = 'https://www.linkedin.com/in/juanan-wd'

// CV en español, en /public. Se descarga con el atributo download.
export const cvUrl = '/CV-Juan-Antonio-Lopez.pdf'

export const seo = {
  title: 'Juan Antonio López — Frontend Developer',
  description:
    'Portfolio de Juan Antonio López (JuanAn), Frontend Developer en Palma de Mallorca: experiencia con React, Vue y Tailwind, proyectos y contacto.',
}

export const profile = {
  name: 'JuanAn',
  fullName: 'Juan Antonio López',
  role: 'Frontend Developer · React y Vue',
  tagline:
    'Más de tres años haciendo interfaces con React, Vue y Tailwind. Ahora busco mi próximo equipo en Palma.',
  about:
    'Soy desarrollador frontend y vivo en Palma de Mallorca. Terminé el CFGS de Desarrollo de Aplicaciones Web en 2023 y entré en APSL Tech con 400 horas de prácticas. Me quedé como Frontend Developer hasta agosto de 2026, trabajando con React, Vue y Tailwind. También he hecho webs con WordPress en EPI Balear.',
  tags: ['Palma de Mallorca', 'Español · Inglés (medio)'],
  github: 'https://github.com/JuanAn-WD',
}

export const nav = [
  { label: 'Sobre mí', href: '#sobre-mi' },
  { label: 'Experiencia', href: '#experiencia' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Stack', href: '#stack' },
  { label: 'Hobbies', href: '#hobbies' },
  { label: 'Contacto', href: '#contacto' },
]

export const ui = {
  skipLink: 'Saltar al contenido',
  mainNav: 'Principal',
  openMenu: 'Abrir menú',
  closeMenu: 'Cerrar menú',
  toLight: 'Cambiar a modo claro',
  toDark: 'Cambiar a modo oscuro',
  viewProjects: 'Ver proyectos',
  downloadCv: 'Descargar CV',
  view3d: 'Ver versión 3D',
  view3dHint: '¿Prefieres explorarlo? Hay una versión 3D interactiva.',
  github: 'GitHub',
  email: 'Email',
  linkedin: 'LinkedIn',
  demo: 'Demo',
  newTab: '(se abre en una pestaña nueva)',
  techLabel: 'Tecnologías',
  aboutTitle: 'Sobre mí',
  experienceTitle: 'Experiencia',
  projectsTitle: 'Proyectos',
  stackTitle: 'Stack',
  hobbiesTitle: 'Hobbies',
  contactTitle: 'Contacto',
  contactText: 'Estoy buscando trabajo como frontend developer en Palma. Escríbeme o descarga mi CV.',
}

export const experience = [
  {
    id: 'apsl',
    title: 'APSL Tech · Frontend Developer',
    date: '2023–2026',
    description: 'Prácticas (400 h) y después contrato. React, Vue, Tailwind.',
  },
  {
    id: 'epi-balear',
    title: 'EPI Balear · WordPress',
    date: null,
    description: null,
  },
  {
    id: 'cfgs-daw',
    title: 'CFGS Desarrollo de Aplicaciones Web',
    date: '2023',
    description: null,
  },
]

export const projects = [
  {
    id: 'shelvingit',
    featured: true, // Único proyecto por ahora: tarjeta ancha con la captura al lado.
    title: 'Shelvingit',
    description:
      'Biblioteca personal gamificada: busca libros, organízalos en tu estantería y sigue qué estás leyendo, qué quieres comprar y qué has terminado.',
    tags: ['React', 'Django', 'PWA'],
    demo: 'https://shelvingit.vercel.app',
    github: 'https://github.com/JuanAn-WD/ShelvingIt',
    image: '/projects/shelvingit.webp',
    imageAlt:
      'Captura de la portada de Shelvingit: una estantería de madera con libros de colores y filtros por comprar, por leer, leyendo y leído',
  },
]

// Streak365 retirado por ahora. Para recuperarlo, vuelve a añadirlo a `projects`:
//   {
//     id: 'streak365',
//     title: 'Streak365',
//     description: 'App para registrar hábitos durante 365 días, con rachas y ranking global.',
//     tags: ['React', 'PWA', 'Hábitos'],
//     demo: 'https://streak365.vercel.app',
//     github: null, // El repo 365days_challenge no es público (404): sin botón de GitHub.
//     image: null, // La demo abre en una pantalla de login: se deja el hueco hasta tener una captura buena.
//     imageAlt: 'Captura de Streak365: panel de hábitos con la racha diaria',
//   },

export const stack = [
  { title: 'Frameworks', items: ['Vue 3', 'Vue 2', 'Nuxt 3', 'React', 'Angular'] },
  { title: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'SQL'] },
  { title: 'Marcado y estilos', items: ['HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap'] },
  { title: 'Otros', items: ['WordPress', 'Django'] },
]

export const hobbies = {
  intro: 'Cuando no estoy programando:',
  items: ['Series', 'Anime', 'Videojuegos', 'Leer', 'Automovilismo'],
}
