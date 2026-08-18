# 🪐 React Three Fiber: Interactive Spherical World Portfolio

Una experiencia de portfolio 3D interactiva, fluida y modular construida con **React Three Fiber**, **Three.js** y **Rapier Physics**. 

El proyecto recrea un mini-planeta explorable infinito (estilo *Super Mario Galaxy* o *Animal Crossing*) con generación procedural de naturaleza, edificios interactivos con transición a interiores (diorama de habitación de desarrollador) y fauna autónoma.

---

## 🌟 Características Principales

* **🌍 Mundo Esférico Infinito ("Treadmill World"):** El personaje se mantiene centrado en la cima del mundo mientras el planeta entero rota bajo sus pies mediante rotaciones de cuaterniones, eliminando límites y bordes de caída.
* **🎥 Cámara Dinámica en 3ª Persona:**
  Cámara seguidora suave con interpolación angular (`dampAngle`) y amortiguación vectorial para un seguimiento cinematográfico.
* **🏠 Edificios Interiores Explorables:**
  * Puertas interactivas con sensores de proximidad y popups 3D flotantes (`Html` de Drei).
  * Transición cinemática con desvanecimiento a negro (*fade-to-black*).
  * Habitación estilo diorama con vista cenital isométrica (setup con PC, cama, TV, estanterías y lámparas con iluminación puntual).
* **🌲 Generación Procedural de Naturaleza:**
  Distribución algorítmica de más de 300 elementos de vegetación (árboles, pinos, rocas y flores) sobre la superficie esférica respetando las zonas de los edificios.
* **❄️ Modo Estacional / Invierno Automático:**
  Detección del mes actual en tiempo real. En meses de invierno (diciembre, enero y febrero), el césped se cubre de nieve y los modelos se sustituyen dinámicamente por sus variantes nevadas.
* **🐾 Fauna y Mascotas Autónomas:**
  Animales con comportamiento autónomo (vacas, cerdos, conejos, zorros, perros, gatos y abejas voladoras) que deambulan por la superficie adaptándose a la curvatura del planeta.
* **🧱 Colisiones Matemáticas en Superficie Esférica:**
  Cálculo de *hitboxes* locales proyectadas para permitir que el jugador se deslice por las paredes de los edificios sin ser expulsado por motores de física tradicionales.

---

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
| :--- | :--- |
| **React 18+** | Gestión de estado, ciclo de vida y UI modular |
| **Three.js** | Motor gráfico WebGL |
| **@react-three/fiber** | Renderizador declarativo de Three.js para React |
| **@react-three/drei** | Utilidades (cámaras, teclado, overlays HTML, loaders) |
| **@react-three/rapier** | Motor de físicas WASM para colisiones e interiores |
| **Vite** | Entorno de desarrollo y empaquetado ultrarrápido |
| **Kenney 3D Assets** | Modelos *low-poly* optimizados (CC0) |

---

## 📁 Estructura del Proyecto

```text
portfolio-3d/
├── public/
│   └── models/
│       ├── Player/
│       │   └── juanan.glb
│       ├── Edifices/
│       │   ├── building-a.glb
│       │   ├── building-b.glb
│       │   ├── building-c.glb
│       │   └── building-e.glb
│       ├── Animals/
│       │   ├── animal-cow.glb
│       │   ├── animal-pig.glb
│       │   ├── animal-bunny.glb
│       │   ├── animal-bee.glb
│       │   ├── animal-fox.glb
│       │   └── animal-dog.glb
│       ├── InteriorHouse/
│       │   ├── desk.glb
│       │   ├── computerScreen.glb
│       │   ├── computerKeyboard.glb
│       │   ├── chairDesk.glb
│       │   ├── bedDouble.glb
│       │   ├── loungeSofa.glb
│       │   └── televisionModern.glb
│       └── ExtDecoration/
│           ├── tree.glb
│           ├── tree-snow.glb
│           ├── tree-pine.glb
│           ├── tree-pine-snow.glb
│           ├── rocks.glb
│           └── flowers.glb
├── src/
│   ├── App.jsx           # Escena principal, mundo esférico, interiores y UI
│   ├── Juanan.jsx        # Componente del personaje y animaciones
│   ├── Building.jsx      # Componente base de edificios
│   ├── WanderingPet.jsx  # IA de movimiento de animales
│   ├── main.jsx          # Punto de entrada de React
│   └── index.css         # Estilos globales
└── package.json