export const profile = {
  name: 'JuanAn',
  role: 'Front-end · experiencias 3D',
  github: 'https://github.com/JuanAn-WD',
  tagline: 'Un planeta redondo con un pueblo para recorrer: proyectos, estudio y un rincón sobre mí.',
  summary:
    'Construyo experiencias web interactivas. Este planeta es mi portfolio: entra al estudio para ver el setup y acércate a los edificios marcados para abrir proyectos reales.',
}

export const projects = {
  about: {
    id: 'about',
    title: 'Sobre mí',
    description: profile.summary,
    tags: ['Front-end', 'Experiencias 3D'],
    links: [{ label: 'GitHub', href: profile.github }],
  },
  setup: {
    id: 'setup',
    title: 'Setup de desarrollo',
    description:
      'Rincón de trabajo con el que prototipo interfaces. El stack está agrupado por tipo:',
    stack: [
      { label: 'Frameworks', items: ['Vue 3', 'Vue 2', 'Nuxt 3', 'React', 'Angular'] },
      { label: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'SQL'] },
      { label: 'Marcado y estilos', items: ['HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap'] },
    ],
    links: [{ label: 'GitHub', href: profile.github }],
  },
  hobbies: {
    id: 'hobbies',
    title: 'Hobbies',
    description:
      'Aquí puedes ver algunos de mis hobbies y aficiones.',
    stack: [
      { label: 'Fuera del teclado', items: ['Series', 'Anime', 'Videojuegos', 'Leer', 'Automovilismo'] },
    ],
    links: [],
  },
  portfolio3d: {
    id: 'portfolio3d',
    title: 'Portfolio 3D',
    description:
      'Planeta esférico explorable: el personaje se queda arriba y el mundo gira debajo. El pueblo tiene edificios con ficha, un estudio interior y ciclo día/noche.',
    tags: ['React Three Fiber', 'Rapier', 'Mundo 3D'],
    links: [{ label: 'GitHub', href: 'https://github.com/JuanAn-WD/Portfolio3D' }],
  },
  tictactoe: {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description:
      'Tres en raya en el navegador. Un proyecto anterior, más pequeño, de lógica de juego y UI.',
    tags: ['React', 'Lógica de juego'],
    links: [
      { label: 'Demo', href: 'https://tic-tac-toe-juanan-wd.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/JuanAn-WD/TicTacToe' },
    ],
  },
}

const F = 2.4

export const interiorFurniture = [
  { path: '/models/InteriorHouse/rugRectangle.glb', position: [-4.2, 0.012, -3.35], rotation: [0, Math.PI / 2, 0], scale: F },
  { path: '/models/InteriorHouse/rugRound.glb', position: [3.5, 0.012, 3.15], rotation: [0, 0, 0], scale: F },
  { path: '/models/InteriorHouse/rugDoormat.glb', position: [0, 0.012, 5.38], rotation: [0, Math.PI, 0], scale: 2.8 },

  { path: '/models/InteriorHouse/desk.glb', position: [-5.28, 0, -3.35], rotation: [0, Math.PI / 2, 0], scale: F, collider: { args: [0.88, 0.46, 0.47], offset: [0, 0.46, 0] } },
  { path: '/models/InteriorHouse/computerScreen.glb', position: [-5.52, 0.93, -3.88], rotation: [0, Math.PI / 2, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/computerScreen.glb', position: [-5.52, 0.93, -2.88], rotation: [0, Math.PI / 2, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/computerKeyboard.glb', position: [-5.12, 0.93, -3.35], rotation: [0, Math.PI / 2, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/computerMouse.glb', position: [-5.08, 0.93, -2.72], rotation: [0, Math.PI / 2, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/chairDesk.glb', position: [-4.2, 0, -3.35], rotation: [0, -Math.PI / 2, 0], scale: F, collider: { args: [0.4, 0.73, 0.38], offset: [0, 0.73, 0] } },

  { path: '/models/InteriorHouse/bookcaseOpen.glb', position: [-3.55, 0, -5.58], rotation: [0, 0, 0], scale: F, collider: { args: [0.48, 1.06, 0.3], offset: [0, 1.06, 0] } },
  { path: '/models/InteriorHouse/bookcaseClosed.glb', position: [-2.35, 0, -5.58], rotation: [0, 0, 0], scale: F, collider: { args: [0.48, 1.02, 0.3], offset: [0, 1.02, 0] } },
  { path: '/models/InteriorHouse/lampRoundFloor.glb', position: [-1.25, 0, -5.52], rotation: [0, 0.4, 0], scale: F, collider: { args: [0.18, 1.03, 0.21], offset: [0, 1.03, 0] } },

  { path: '/models/InteriorHouse/bedDouble.glb', position: [4.62, 0, -3.5], rotation: [0, 0, 0], scale: F, collider: { args: [1.15, 0.45, 1.35], offset: [0, 0.45, 0] } },
  { path: '/models/InteriorHouse/sideTableDrawers.glb', position: [3.15, 0, -5.28], rotation: [0, Math.PI / 2, 0], scale: F, collider: { args: [0.64, 0.46, 0.27], offset: [0, 0.46, 0] } },
  { path: '/models/InteriorHouse/lampRoundTable.glb', position: [3.15, 0.93, -5.28], rotation: [0, 0, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/pillow.glb', position: [4.28, 0.9, -4.55], rotation: [0, 0.12, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/pillowBlue.glb', position: [4.92, 0.9, -4.52], rotation: [0, -0.08, 0], scale: 2.2 },

  { path: '/models/InteriorHouse/loungeSofaLong.glb', position: [4.82, 0, 3.15], rotation: [0, -Math.PI / 2, 0], scale: F, collider: { args: [1.18, 0.55, 0.98], offset: [0, 0.55, 0] } },
  { path: '/models/InteriorHouse/tableCoffee.glb', position: [3.28, 0, 3.15], rotation: [0, -Math.PI / 2, 0], scale: F, collider: { args: [0.79, 0.28, 0.48], offset: [0, 0.28, 0] } },
  { path: '/models/InteriorHouse/cabinetTelevision.glb', position: [1.45, 0, 3.15], rotation: [0, Math.PI / 2, 0], scale: F, collider: { args: [0.96, 0.37, 0.3], offset: [0, 0.37, 0] } },
  { path: '/models/InteriorHouse/televisionModern.glb', position: [1.45, 0.76, 3.15], rotation: [0, Math.PI / 2, 0], scale: F },

  { path: '/models/InteriorHouse/pottedPlant.glb', position: [-5.35, 0, 4.9], rotation: [0, 0.3, 0], scale: 2.6, collider: { args: [0.28, 0.78, 0.31], offset: [0, 0.78, 0] } },
  { path: '/models/InteriorHouse/coatRackStanding.glb', position: [-2.2, 0, 5.35], rotation: [0, 0.2, 0], scale: 2.5, collider: { args: [0.2, 0.96, 0.2], offset: [0, 0.96, 0] } },
  { path: '/models/InteriorHouse/loungeChair.glb', position: [-4.45, 0, 2.25], rotation: [0, Math.PI * 0.65, 0], scale: F, collider: { args: [0.59, 0.55, 0.49], offset: [0, 0.55, 0] } },
  { path: '/models/InteriorHouse/sideTable.glb', position: [-5.3, 0, 1.55], rotation: [0, Math.PI / 2, 0], scale: 2.2, collider: { args: [0.59, 0.42, 0.24], offset: [0, 0.42, 0] } },
  { path: '/models/InteriorHouse/laptop.glb', position: [-5.3, 0.86, 1.55], rotation: [0, Math.PI / 2, 0], scale: 1.9 },
  { path: '/models/InteriorHouse/speaker.glb', position: [1.45, 0, 4.28], rotation: [0, Math.PI / 2, 0], scale: 2, collider: { args: [0.15, 0.64, 0.15], offset: [0, 0.64, 0] } },
  { path: '/models/InteriorHouse/trashcan.glb', position: [5.38, 0, 5.38], rotation: [0, 0.4, 0], scale: 2.2, collider: { args: [0.23, 0.47, 0.26], offset: [0, 0.47, 0] } },
]

