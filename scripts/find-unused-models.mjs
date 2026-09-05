import fs from 'fs'
import path from 'path'

const sources = [
  'src/config/content.js',
  'src/config/assets.js',
  'src/config/forest.js',
  'src/Juanan.jsx',
  'src/components/SmokeParticle.jsx',
]

const text = sources.map((f) => fs.readFileSync(f, 'utf8')).join('\n')
const used = new Set(
  [...text.matchAll(/['"](\/models\/[^'"]+\.glb)['"]/g)].map((m) => m[1].replace(/^\//, ''))
)

const root = path.resolve('public')

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.glb')) out.push(full)
  }
  return out
}

const all = walk(path.join(root, 'models'))
const unused = []
const missing = []

for (const abs of all) {
  const rel = path.relative(root, abs).split(path.sep).join('/')
  if (!used.has(rel)) unused.push({ abs, rel, size: fs.statSync(abs).size })
}

for (const rel of used) {
  if (!fs.existsSync(path.join(root, rel))) missing.push(rel)
}

const unusedMb = unused.reduce((sum, file) => sum + file.size, 0) / 1e6
console.log(JSON.stringify({ used: used.size, onDisk: all.length, unused: unused.length, missing, unusedMb: Number(unusedMb.toFixed(1)) }, null, 2))

fs.writeFileSync(
  path.resolve('scripts/unused-models.json'),
  JSON.stringify(unused.map((u) => u.rel), null, 2)
)

if (process.argv.includes('--delete')) {
  let removed = 0
  for (const file of unused) {
    fs.unlinkSync(file.abs)
    removed += 1
  }
  // remove empty directories bottom-up
  const dirs = []
  function walkDirs(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walkDirs(path.join(dir, entry.name))
    }
    dirs.push(dir)
  }
  walkDirs(path.join(root, 'models'))
  for (const dir of dirs) {
    if (dir === path.join(root, 'models')) continue
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
  }
  console.log(`Deleted ${removed} unused GLBs`)
}
