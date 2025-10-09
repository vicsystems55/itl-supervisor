// src/core/utils/plugins.js
export const registerPlugins = app => {
  const imports = import.meta.glob(
    ['../../plugins/*.{ts,js}', '../../plugins/*/index.{ts,js}'],
    { eager: true }
  )

  Object.keys(imports).sort().forEach(path => {
    const pluginModule = imports[path]
    
    // Only call default exports if they are functions
    if (typeof pluginModule.default === 'function') {
      pluginModule.default(app)
    }
  })
}
