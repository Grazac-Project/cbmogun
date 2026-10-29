import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'zn3hw447',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Built into the website and served at cbmogun.org/studio.
  project: {basePath: '/studio'},
  studioHost: 'cbmogun',
})
