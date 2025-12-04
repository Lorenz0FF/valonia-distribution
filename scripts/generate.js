/**
 * 🚀 Valonia Distribution Generator
 * 
 * Scanne les dossiers mods/, configs/, resourcepacks/
 * et génère automatiquement le distribution.json
 * 
 * Usage: npm run generate
 */

import { createHash } from 'crypto'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

// ============================================
// ⚙️ CONFIGURATION - MODIFIE ICI !
// ============================================
const CONFIG = {
  // URL GitHub Raw de ton repo
  baseUrl: 'https://raw.githubusercontent.com/Lorenz0FF/valonia-distribution/main',
  
  // Infos de ton serveur Minecraft
  server: {
    name: 'Valonia Server',
    description: 'Serveur Minecraft modé Valonia',
    ip: 'play.valonia.fr',  // ← Ton IP serveur
    port: 25565,
    autoConnect: true
  },
  
  // Version Minecraft + Forge
  minecraft: { version: '1.20.1', type: 'release' },
  forge: { version: '47.3.0' },
  
  // Java requis
  java: { minVersion: 17, recommended: 21 },
  
  // Metadata
  metadata: {
    maintainer: 'Valonia Team',
    discord: 'https://discord.gg/valonia'
  }
}

// ============================================
// FONCTIONS
// ============================================

function calculateMD5(filePath) {
  const fileBuffer = readFileSync(filePath)
  return createHash('md5').update(fileBuffer).digest('hex')
}

function getFileSize(filePath) {
  return statSync(filePath).size
}

function scanDirectory(dirPath, extensions = []) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
    return []
  }
  return readdirSync(dirPath).filter(file => {
    if (extensions.length === 0) return !file.startsWith('.')
    return extensions.some(ext => file.toLowerCase().endsWith(ext))
  })
}

function processMod(fileName, modsDir) {
  const filePath = join(modsDir, fileName)
  const md5 = calculateMD5(filePath)
  const size = getFileSize(filePath)
  
  // Nettoie le nom pour l'affichage
  const cleanName = fileName
    .replace(/\.jar$/i, '')
    .replace(/-mc[\d.]+/gi, '')
    .replace(/-forge/gi, '')
    .replace(/-\d+\.\d+.*$/g, '')
    .replace(/[-_]/g, ' ')
    .trim()
  
  return {
    name: cleanName || fileName,
    fileName: fileName,
    url: `${CONFIG.baseUrl}/mods/${fileName}`,
    md5: md5,
    size: size,
    required: true,
    enabled: true
  }
}

function processConfig(fileName, configDir, relativePath = '') {
  const filePath = join(configDir, relativePath, fileName)
  const path = relativePath ? `${relativePath}/${fileName}` : fileName
  
  return {
    path: path,
    url: `${CONFIG.baseUrl}/configs/${path}`,
    md5: calculateMD5(filePath),
    size: getFileSize(filePath)
  }
}

function scanConfigsRecursively(baseDir, currentDir = '', results = []) {
  const fullPath = join(baseDir, currentDir)
  if (!existsSync(fullPath)) return results
  
  const items = readdirSync(fullPath, { withFileTypes: true })
  for (const item of items) {
    if (item.name.startsWith('.')) continue
    if (item.isDirectory()) {
      scanConfigsRecursively(baseDir, join(currentDir, item.name), results)
    } else {
      results.push(processConfig(item.name, baseDir, currentDir))
    }
  }
  return results
}

function processResourcePack(fileName, rpDir) {
  const filePath = join(rpDir, fileName)
  return {
    name: fileName.replace(/\.zip$/i, '').replace(/[-_]/g, ' '),
    fileName: fileName,
    url: `${CONFIG.baseUrl}/resourcepacks/${fileName}`,
    md5: calculateMD5(filePath),
    size: getFileSize(filePath)
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// ============================================
// GÉNÉRATION
// ============================================

async function generate() {
  console.log('\n🚀 Valonia Distribution Generator\n')
  console.log('=' .repeat(50))
  
  const modsDir = join(ROOT, 'mods')
  const configsDir = join(ROOT, 'configs')
  const rpDir = join(ROOT, 'resourcepacks')
  
  // Scan des mods
  console.log('\n📦 Scan des mods...')
  const modFiles = scanDirectory(modsDir, ['.jar'])
  const mods = modFiles.map(file => {
    const mod = processMod(file, modsDir)
    console.log(`   ✅ ${mod.name} (${formatSize(mod.size)})`)
    return mod
  })
  
  // Scan des configs
  console.log('\n⚙️  Scan des configs...')
  const configs = scanConfigsRecursively(configsDir)
  configs.forEach(c => console.log(`   ✅ ${c.path}`))
  
  // Scan des resource packs
  console.log('\n🎨 Scan des resource packs...')
  const rpFiles = scanDirectory(rpDir, ['.zip'])
  const resourcepacks = rpFiles.map(file => {
    const rp = processResourcePack(file, rpDir)
    console.log(`   ✅ ${rp.name}`)
    return rp
  })
  
  // Calcul de la taille totale
  const totalSize = mods.reduce((acc, m) => acc + m.size, 0) +
                    configs.reduce((acc, c) => acc + c.size, 0) +
                    resourcepacks.reduce((acc, r) => acc + r.size, 0)
  
  // Construction du distribution.json
  const distribution = {
    '$schema': './schema/distribution.schema.json',
    version: '1.0.0',
    name: CONFIG.server.name,
    description: CONFIG.server.description,
    minecraft: CONFIG.minecraft,
    forge: CONFIG.forge,
    java: CONFIG.java,
    server: {
      ip: CONFIG.server.ip,
      port: CONFIG.server.port,
      autoConnect: CONFIG.server.autoConnect
    },
    files: { mods, configs, resourcepacks },
    metadata: {
      lastUpdated: new Date().toISOString(),
      maintainer: CONFIG.metadata.maintainer,
      discord: CONFIG.metadata.discord,
      totalMods: mods.length,
      totalSize: totalSize
    }
  }
  
  // Écriture
  const outputPath = join(ROOT, 'distribution.json')
  writeFileSync(outputPath, JSON.stringify(distribution, null, 2))
  
  console.log('\n' + '=' .repeat(50))
  console.log('✅ Distribution générée avec succès!\n')
  console.log(`   📄 ${outputPath}`)
  console.log(`   📦 ${mods.length} mods`)
  console.log(`   ⚙️  ${configs.length} configs`)
  console.log(`   🎨 ${resourcepacks.length} resource packs`)
  console.log(`   💾 Taille totale: ${formatSize(totalSize)}`)
  console.log('\n🔜 Prochaine étape: git add . && git commit -m "Update mods" && git push\n')
}

generate().catch(console.error)
