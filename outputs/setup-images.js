/**
 * Setup script to copy image files and HTML files to public directory for Vite
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const images = [
  {
    src: path.join(__dirname, 'wildfire_intensity_overlay.png'),
    dest: path.join(__dirname, 'public', 'wildfire_intensity_overlay.png')
  },
  {
    src: path.join(__dirname, 'component_maps', 'historical_fires_overlay.png'),
    dest: path.join(__dirname, 'public', 'component_maps', 'historical_fires_overlay.png')
  },
  {
    src: path.join(__dirname, 'component_maps', 'fire_weather_(lst)_overlay.png'),
    dest: path.join(__dirname, 'public', 'component_maps', 'fire_weather_(lst)_overlay.png')
  },
  {
    src: path.join(__dirname, 'component_maps', 'vegetation_index_(ndvi)_overlay.png'),
    dest: path.join(__dirname, 'public', 'component_maps', 'vegetation_index_(ndvi)_overlay.png')
  },
  {
    src: path.join(__dirname, 'component_maps', 'population_urban_overlay.png'),
    dest: path.join(__dirname, 'public', 'component_maps', 'population_urban_overlay.png')
  },
  {
    src: path.join(__dirname, 'component_maps', 'terrain_slope_overlay.png'),
    dest: path.join(__dirname, 'public', 'component_maps', 'terrain_slope_overlay.png')
  }
]

// HTML files to copy
const htmlFiles = [
  {
    src: path.join(__dirname, 'methodology.html'),
    dest: path.join(__dirname, 'public', 'methodology.html')
  }
]

// Create public directory structure
const publicDir = path.join(__dirname, 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const componentMapsDir = path.join(publicDir, 'component_maps')
if (!fs.existsSync(componentMapsDir)) {
  fs.mkdirSync(componentMapsDir, { recursive: true })
}

// Copy images
let copied = 0
let skipped = 0

images.forEach(({ src, dest }) => {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(`✓ Copied: ${path.basename(src)}`)
      copied++
    } else {
      console.log(`✗ Not found: ${path.basename(src)}`)
      skipped++
    }
  } catch (error) {
    console.error(`✗ Error copying ${path.basename(src)}:`, error.message)
    skipped++
  }
})

// Copy HTML files
htmlFiles.forEach(({ src, dest }) => {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(`✓ Copied: ${path.basename(src)}`)
      copied++
    } else {
      console.log(`✗ Not found: ${path.basename(src)}`)
      skipped++
    }
  } catch (error) {
    console.error(`✗ Error copying ${path.basename(src)}:`, error.message)
    skipped++
  }
})

console.log(`\nSetup complete: ${copied} copied, ${skipped} skipped`)

