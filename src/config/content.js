export const profile = {
  name: 'JuanAn',
  role: 'Desarrollador web',
  github: 'https://github.com/JuanAn-WD',
  summary:
    'Construyo experiencias web interactivas. Este planeta es mi portfolio: entra al estudio para ver el setup y visita los edificios para abrir proyectos reales.',
}

export const projects = {
  setup: {
    id: 'setup',
    title: 'Setup de desarrollo',
    description:
      'Rincón de trabajo con el que prototipo interfaces y escenas 3D. El stack está agrupado por tipo:',
    stack: [
      { label: 'Frameworks', items: ['Vue 3', 'Vue 2', 'Nuxt 3', 'React'] },
      { label: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'SQL'] },
      { label: 'Marcado y estilos', items: ['HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap'] },
    ],
    links: [{ label: 'GitHub', href: profile.github }],
  },
  portfolio3d: {
    id: 'portfolio3d',
    title: 'Portfolio 3D',
    description:
      'Mundo esférico explorable (estilo treadmill): el personaje se queda arriba y el planeta rota debajo. Naturaleza procedural, interiores con físicas y ciclo día/noche.',
    tags: ['React Three Fiber', 'Rapier', 'Drei'],
    links: [{ label: 'GitHub', href: 'https://github.com/JuanAn-WD/Portfolio3D' }],
  },
  tictactoe: {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description:
      'Tres en raya en el navegador. Un proyecto anterior, más pequeño, de lógica de juego y UI.',
    tags: ['JavaScript', 'React'],
    links: [
      { label: 'Demo', href: 'https://tic-tac-toe-juanan-wd.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/JuanAn-WD/TicTacToe' },
    ],
  },
}

export const buildings = [
  {
    id: 'house',
    refKey: 'house',
    modelPath: '/models/Edifices/building-h.glb',
    position: [-7, -0.1, -8],
    rotation: [0, Math.PI / 0.85, 0],
    scale: 3,
    popupTitle: 'Estudio',
    popupHeight: 6.5,
    interactDistance: 4.5,
    tooltip: 'entrar al estudio',
    action: 'enterHouse',
  },
  {
    id: 'lab',
    refKey: 'lab',
    modelPath: '/models/Edifices/building-e.glb',
    position: [8, -0.1, -4],
    rotation: [0, -Math.PI / 0.75, 0],
    scale: 3,
    popupTitle: 'Portfolio 3D',
    popupHeight: 6.5,
    interactDistance: 4.5,
    tooltip: 'ver el proyecto Portfolio 3D',
    action: 'openProject',
    projectId: 'portfolio3d',
    chimney: { path: '/models/Edifices/chimney-medium.glb', position: [1.0, 1, -0.6], scale: 1.0 },
  },
  {
    id: 'arcade',
    refKey: 'arcade',
    modelPath: '/models/Edifices/building-c.glb',
    position: [5, -0.1, 9],
    rotation: [0, Math.PI * 1.1, 0],
    scale: 3,
    popupTitle: 'Tic Tac Toe',
    popupHeight: 6.5,
    interactDistance: 4.5,
    tooltip: 'ver Tic Tac Toe',
    action: 'openProject',
    projectId: 'tictactoe',
  },
]

export const fauna = [
  { modelPath: '/models/Animals/animal-cow.glb', position: [-12, 0, -4], scale: 0.4 },
  { modelPath: '/models/Animals/animal-pig.glb', position: [6, 0, 12], scale: 0.35 },
  { modelPath: '/models/Animals/animal-bunny.glb', position: [-2, 0, -3], scale: 0.25, speed: 0.8 },
  { modelPath: '/models/Animals/animal-bee.glb', position: [2, 0, 3], scale: 0.2, speed: 0.6, flyHeight: 1.6 },
  { modelPath: '/models/Animals/animal-dog.glb', position: [-3, 0, 8], scale: 0.35, speed: 0.5 },
  { modelPath: '/models/Animals/animal-cat.glb', position: [-8, 0, -4], scale: 0.25, speed: 0.4 },
  { modelPath: '/models/Animals/animal-chick.glb', position: [-5, 0, 5], scale: 0.15, speed: 0.9 },
  { modelPath: '/models/Animals/animal-crab.glb', position: [22, 0, 8], scale: 0.22, speed: 0.45 },
  { modelPath: '/models/Animals/animal-crab.glb', position: [-18, 0, 16], scale: 0.22, speed: 0.45 },
  { modelPath: '/models/Animals/animal-parrot.glb', position: [6, 0, -6], scale: 0.3, speed: 0.7, flyHeight: 2.2 },
  { modelPath: '/models/Animals/animal-parrot.glb', position: [-9, 0, 9], scale: 0.3, speed: 0.65, flyHeight: 2.5 },
]

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

