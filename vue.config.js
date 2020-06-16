module.exports = {
  chainWebpack: config => {
    config.plugin('MonocoEditorPlugin')
      .use('monaco-editor-webpack-plugin', [{
        languages: ['lua']
      }])
  }
}
