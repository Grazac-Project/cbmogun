import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'cbm-ogun',
  title: 'CBM Ogun News & Events',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'zn3hw447',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool(), visionTool()],
  schema: {types: schemaTypes},
})
