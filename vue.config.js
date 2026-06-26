const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/wisdom-market/' : './',
  outputDir: 'docs',
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://smart-shop.itheima.net',
        changeOrigin: true,
        onProxyReq (proxyReq, req) {
          proxyReq.path = '/index.php?s=' + req.url.replace('?', '&')
        }
      }
    }
  }
})
