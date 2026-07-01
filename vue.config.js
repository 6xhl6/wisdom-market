const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/wisdom-market/' : './',
  outputDir: 'docs',
  transpileDependencies: true,

  // ============================================================
  //  Service Worker 双层缓存架构（Workbox 6.x）
  //
  //  ★ 核心设计：静态资源归 Precache 管，API 数据归 Runtime 管。
  //     两层各司其职，覆盖全站 19 个静态资源 + 13 个 API 端点。
  //
  //  —— 第一层：Precache 预缓存（静态资源）——
  //  对象：webpack 构建产物（JS/CSS/图片/font/index.html）
  //  方式：SW install 阶段一次性下载到 Cache Storage
  //  更新：webpack 给文件加 contenthash → 每次发版 hash 不同 → SW 自动更新
  //  特点：全自动，不写一行文件列表，编译时 Workbox 扫描 webpack 产物注入
  //
  //  —— 第二层：Runtime 运行时缓存（API 数据）——
  //  对象：13 条 API 接口，按业务特性分 4 档策略
  //  方式：SW fetch 事件拦截 → URL 正则匹配 → 执行对应策略
  //
  //  Stale-While-Revalidate … 缓存优先+后台更新    首页/详情/分类/评价/服务标签
  //  Network First …………… 网络优先+超时兜底       搜索/用户信息
  //  Cache First ……………… 缓存命中不走网络          省市区（几乎不变）
  //  Network Only …………… 仅网络且不写缓存           购物车/订单/结算/地址/登录
  //
  //  关键决策：交易链路（货架→购物车→结算→支付）全部 Network Only。
  //  宁可慢一点，也不能让用户看到过期的价格或库存。
  // ============================================================
  pwa: {
    // PWA 应用名称（安装到桌面时显示）
    name: '智慧商城',
    // 主题色（与 Vant 品牌色一致）
    themeColor: '#ee0a24',
    // Windows Tile 颜色
    msTileColor: '#ffffff',
    // iOS Safari 全屏模式
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // Workbox 配置
    workboxOptions: {
      // ★ 注入跨域 API 拦截器（Workbox 原生路由不匹配 index.php?s=/api/ 格式）
      importScripts: ['./sw-api-interceptor.js'],

      // ----------------------------------------------------------
      // 第一层：Precache 预缓存配置（静态资源自动缓存）
      //
      // 排除规则：哪些文件不加入预缓存
      // - .map 文件：source map，仅开发调试用，线上不需要
      // - _redirects：Netlify 等平台的部署配置文件
      //
      // 预缓存的文件由 workbox-webpack-plugin 在编译时自动收集，
      // 包括所有 webpack 输出的 .js/.css + public 目录下的静态资源。
      // 由于文件名带 contenthash（如 app.930cc24e.js），每次发版
      // SW 会自动检测到新文件并触发预缓存更新。
      // ----------------------------------------------------------
      exclude: [/\.map$/, /_redirects/],

      // 注：不需要手动列举文件 —— workbox-webpack-plugin 在编译时
      // 自动扫描所有 webpack 输出产物（带 contenthash 的 JS/CSS + public 目录静态资源）
      // 并注入到 service-worker.js 的 precacheAndRoute() 调用中。
      // 每次发版，文件 hash 变化 → SW 自动检测并预缓存新版本。

      // ============================================================
      // 第二层：Runtime Caching 运行时缓存策略（API 数据缓存）
      // 以下配置按接口数据特性分为四种策略
      // ============================================================
      runtimeCaching: [
        // ----------------------------------------------------------
        // 【策略一】Stale-While-Revalidate — 缓存优先，后台更新
        //
        //  原理：立即返回缓存数据 → 后台发起网络请求 → 缓存更新
        //  适用于：数据变化不频繁、用户可容忍短暂旧数据的场景
        //  优势：首屏秒开，离线可用，静默更新保证下次访问新鲜度
        // ----------------------------------------------------------

        {
          // 首页数据接口：轮播图、导航图标网格、猜你喜欢列表
          // URL 覆盖两种格式：/api/page/detail（直接请求）、index.php?s=/api/page/detail（PHP 前端控制器）
          urlPattern: /\/api\/.*\/?page\/detail/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-home',
            expiration: {
              maxEntries: 5
            },
            cacheableResponse: {
              statuses: [0, 200] // 0=opaque 跨域响应也允许缓存（生产环境 API 为跨域 smart-shop.itheima.net）
            }
          }
        },
        {
          // 商品详情接口（含参数 goodsId）
          urlPattern: /\/api\/.*\/?goods\/detail/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-goods-detail',
            expiration: {
              maxEntries: 50
            },
            cacheableResponse: {
              statuses: [0, 200] // 0=opaque 跨域响应也允许缓存
            }
          }
        },
        {
          // 商品分类列表（分类结构几乎不变，极小更新频率）
          urlPattern: /\/api\/.*\/?category\/list/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-category',
            expiration: {
              maxEntries: 5
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // 商品评价列表 & 评价总数
          urlPattern: /\/api\/.*\/?comment\/(listRows|total)/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-comments',
            expiration: {
              maxEntries: 30
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // 商品服务标签（如"7天无理由"、"正品保证"等图标标签）
          urlPattern: /\/api\/.*\/?goods\.service\/list/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-goods-service',
            expiration: {
              maxEntries: 10
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },

        // ----------------------------------------------------------
        // 【策略二】Network First — 网络优先，超时则降级到缓存
        //
        //  原理：先请求网络 → 超时 N 秒未响应 → 返回缓存兜底
        //  适用于：用户期望看到较新数据，但断网/弱网时需降级体验
        //  优势：正常网络下数据最新，弱网/断网时不白屏
        // ----------------------------------------------------------

        {
          // 商品搜索列表（用户期望搜索结果尽可能新鲜）
          urlPattern: /\/api\/.*\/?goods\/list/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-search',
            networkTimeoutSeconds: 5,
            expiration: {
              maxEntries: 20
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // 用户信息接口（头像、昵称等；需要相对新鲜但可离线查看）
          urlPattern: /\/api\/.*\/?user\/info/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-user-info',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 5
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },

        // ----------------------------------------------------------
        // 【策略三】Cache First — 纯缓存优先，命中则不走网络
        //
        //  原理：缓存命中 → 直接返回，不发网络请求
        //       缓存未命中 → 走网络 → 写入缓存
        //  适用于：几乎不会变的基础数据
        //  优势：极致加载速度，零网络开销，节省用户流量
        // ----------------------------------------------------------

        {
          // 省市区三级联动数据（行政区域划分几乎不更新）
          urlPattern: /\/api\/.*\/?region\/tree/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'api-region-tree',
            expiration: {
              maxEntries: 1
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },

        // ----------------------------------------------------------
        // 【策略四】Network Only — 仅网络，不缓存
        //
        //  原理：仅走网络请求，不写入缓存，不读取缓存
        //  适用于：涉及金额、库存、用户隐私的写操作或状态变更
        //  理由：绝不能向用户展示过期的价格/库存/订单状态
        // ----------------------------------------------------------

        {
          // 购物车：增删改查（数量/价格/库存实时敏感）
          urlPattern: /\/api\/.*\/?cart\//,
          handler: 'NetworkOnly'
        },
        {
          // 订单结算 & 提交订单（金额相关，必须实时）
          urlPattern: /\/api\/.*\/?checkout\//,
          handler: 'NetworkOnly'
        },
        {
          // 订单列表、支付、取消、确认收货（订单状态流转必须实时）
          urlPattern: /\/api\/.*\/?order\//,
          handler: 'NetworkOnly'
        },
        {
          // 收货地址增删改查（用户敏感数据，必须实时）
          urlPattern: /\/api\/.*\/?address\//,
          handler: 'NetworkOnly'
        },
        {
          // 登录、图形验证码、短信验证码（安全凭证，绝不缓存）
          urlPattern: /\/api\/.*\/?(passport\/login|captcha\/)/,
          handler: 'NetworkOnly'
        }
      ]
    }
  },

  // 开发服务器代理配置
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
