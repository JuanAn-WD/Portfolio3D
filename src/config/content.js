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
      'Rincón de trabajo con el que prototipo interfaces y escenas 3D. Stack actual: React, Three.js y Vite.',
    tags: ['React', 'Three.js', 'Vite'],
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

export const interiorFurniture = [
  { path: '/models/InteriorHouse/rugRectangle.glb', position: [-3.5, 0.02, -3.5], rotation: [0, 0, 0], scale: 2.5 },
  { path: '/models/InteriorHouse/rugRound.glb', position: [2.5, 0.02, 2.5], rotation: [0, 0, 0], scale: 2.5 },
  { path: '/models/InteriorHouse/desk.glb', position: [-4.8, 0, -3.5], rotation: [0, Math.PI / 2, 0], scale: 2.2, collider: { args: [0.45, 0.75, 1.5], offset: [0, 0.75, 0] } },
  { path: '/models/InteriorHouse/computerScreen.glb', position: [-4.8, 1.63, -4.5], rotation: [0, Math.PI / 2 - Math.PI / 8, 0], scale: 1.9 },
  { path: '/models/InteriorHouse/computerScreen.glb', position: [-4.8, 1.63, -3.5], rotation: [0, Math.PI / 2, 0], scale: 1.9 },
  { path: '/models/InteriorHouse/computerScreen.glb', position: [-4.8, 1.63, -2.5], rotation: [0, Math.PI / 2 + Math.PI / 8, 0], scale: 1.9 },
  { path: '/models/InteriorHouse/computerKeyboard.glb', position: [-4.2, 1.63, -3.5], rotation: [0, Math.PI / 2, 0], scale: 1.9 },
  { path: '/models/InteriorHouse/chairDesk.glb', position: [-3.0, 0, -3.5], rotation: [0, -Math.PI / 2, 0], scale: 2.2, collider: { args: [0.45, 0.7, 0.45], offset: [0, 0.7, 0] } },
  { path: '/models/InteriorHouse/bookcaseOpen.glb', position: [-4.0, 0, -5.2], rotation: [0, 0, 0], scale: 2.2, collider: { args: [0.4, 1.1, 0.7], offset: [0, 1.1, 0] } },
  { path: '/models/InteriorHouse/bookcaseClosed.glb', position: [-2.0, 0, -5.2], rotation: [0, 0, 0], scale: 2.2, collider: { args: [0.4, 1.1, 0.7], offset: [0, 1.1, 0] } },
  { path: '/models/InteriorHouse/bedDouble.glb', position: [3.5, 0, -4.0], rotation: [0, 0, 0], scale: 2.2, collider: { args: [1.1, 0.45, 1.5], offset: [0, 0.45, 0] } },
  { path: '/models/InteriorHouse/sideTableDrawers.glb', position: [1.2, 0, -4.8], rotation: [0, 0, 0], scale: 2.2, collider: { args: [0.35, 0.5, 0.35], offset: [0, 0.5, 0] } },
  { path: '/models/InteriorHouse/lampRoundTable.glb', position: [1.2, 1.1, -4.8], rotation: [0, 0, 0], scale: 1.9 },
  { path: '/models/InteriorHouse/loungeSofaCorner.glb', position: [4.0, 0, 4.0], rotation: [0, Math.PI, 0], scale: 2.2, collider: { args: [1.4, 0.55, 1.4], offset: [0, 0.55, 0] } },
  { path: '/models/InteriorHouse/tableCoffee.glb', position: [2.0, 0, 2.0], rotation: [0, 0, 0], scale: 2.2, collider: { args: [0.7, 0.35, 0.7], offset: [0, 0.35, 0] } },
  { path: '/models/InteriorHouse/cabinetTelevision.glb', position: [-0.5, 0, 2.5], rotation: [0, Math.PI / 2, 0], scale: 2.2, collider: { args: [0.4, 0.5, 0.8], offset: [0, 0.5, 0] } },
  { path: '/models/InteriorHouse/televisionModern.glb', position: [-0.5, 0.95, 2.5], rotation: [0, 0, 0], scale: 2.2 },
  { path: '/models/InteriorHouse/pottedPlant.glb', position: [-4.5, 0, 4.5], rotation: [0, 0, 0], scale: 2.6, collider: { args: [0.3, 0.6, 0.3], offset: [0, 0.6, 0] } },
  { path: '/models/InteriorHouse/lampRoundFloor.glb', position: [0.0, 0, -5.0], rotation: [0, 0, 0], scale: 2.2, collider: { args: [0.2, 0.9, 0.2], offset: [0, 0.9, 0] } },
]
