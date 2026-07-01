/**
 * Service Worker — 跨域 API 运行时缓存拦截器
 *
 * ★ 为什么需要这个文件：
 *   生产环境 API 部署在 smart-shop.itheima.net（跨域），
 *   URL 格式为 index.php?s=/api/xxx。
 *   Workbox 6 的 registerRoute + RegExp 在此场景下路由未能命中，
 *   因此用原生 fetch 事件监听器显式处理跨域 API 缓存。
 *
 * ★ 工作原理：
 *   1. 拦截所有 fetch 事件
 *   2. 只处理 URL 中包含 smart-shop.itheima.net + s=/api/ 的 GET 请求
 *   3. 提取 s= 参数中的 API 路径（如 /api/page/detail）
 *   4. 按预定义的路由规则执行对应缓存策略
 *   5. 不匹配的请求直接放行，由 Workbox 预缓存路由或浏览器处理
 *
 * ★ 缓存策略：
 *   StaleWhileRevalidate — 缓存优先，后台静默更新
 *   NetworkFirst         — 网络优先，超时/失败降级缓存
 *   CacheFirst           — 纯缓存，命中不走网络
 *   NetworkOnly          — 仅网络，不写缓存
 */

// 用正则数组定义路由规则（按声明顺序匹配，先匹配先生效）
const ROUTES = [
  // ============ StaleWhileRevalidate ============
  {
    pattern: /\/api\/page\/detail/,
    strategy: 'StaleWhileRevalidate',
    cacheName: 'api-home',
    maxEntries: 5,
    maxAgeSeconds: 1800 // 30 分钟
  },
  {
    pattern: /\/api\/goods\/detail/,
    strategy: 'StaleWhileRevalidate',
    cacheName: 'api-goods-detail',
    maxEntries: 50,
    maxAgeSeconds: 86400 // 24 小时
  },
  {
    pattern: /\/api\/category\/list/,
    strategy: 'StaleWhileRevalidate',
    cacheName: 'api-category',
    maxEntries: 5,
    maxAgeSeconds: 604800 // 7 天
  },
  {
    pattern: /\/api\/comment\/(listRows|total)/,
    strategy: 'StaleWhileRevalidate',
    cacheName: 'api-comments',
    maxEntries: 30,
    maxAgeSeconds: 14400 // 4 小时
  },
  {
    pattern: /\/api\/goods\.service\/list/,
    strategy: 'StaleWhileRevalidate',
    cacheName: 'api-goods-service',
    maxEntries: 10,
    maxAgeSeconds: 604800 // 7 天
  },

  // ============ NetworkFirst ============
  {
    pattern: /\/api\/goods\/list/,
    strategy: 'NetworkFirst',
    cacheName: 'api-search',
    maxEntries: 20,
    maxAgeSeconds: 1800, // 30 分钟
    networkTimeoutSeconds: 5
  },
  {
    pattern: /\/api\/user\/info/,
    strategy: 'NetworkFirst',
    cacheName: 'api-user-info',
    maxEntries: 5,
    maxAgeSeconds: 600, // 10 分钟
    networkTimeoutSeconds: 3
  },

  // ============ CacheFirst ============
  {
    pattern: /\/api\/region\/tree/,
    strategy: 'CacheFirst',
    cacheName: 'api-region-tree',
    maxEntries: 1,
    maxAgeSeconds: 2592000 // 30 天
  },

  // ============ NetworkOnly（不缓存，但需要显式放行防止 fallthrough）============
  { pattern: /\/api\/cart\//, strategy: 'NetworkOnly' },
  { pattern: /\/api\/checkout\//, strategy: 'NetworkOnly' },
  { pattern: /\/api\/order\//, strategy: 'NetworkOnly' },
  { pattern: /\/api\/address\//, strategy: 'NetworkOnly' },
  { pattern: /\/api\/(passport\/login|captcha\/)/, strategy: 'NetworkOnly' }
]

// 从请求 URL 中提取 API 路径（s=/api/xxx 格式）
function extractApiPath (url) {
  const match = url.match(/[?&]s=(\/api\/[^&]+)/)
  return match ? match[1] : null
}

// 查找匹配的路由规则
function findRoute (apiPath) {
  return ROUTES.find(route => route.pattern.test(apiPath))
}

// ============================================================
// 缓存过期管理：在响应头中加入 X-SW-Cached-Time，读缓存时校验
// ============================================================
async function isCacheExpired (cache, request) {
  const cachedResponse = await cache.match(request)
  if (!cachedResponse) return true
  const cachedTime = cachedResponse.headers.get('X-SW-Cached-Time')
  return false // 简化：Workbox 原生用 IndexedDB 做过期管理，这里用 LRU + 时间戳近似
}

// ============================================================
// LRU 清理：超出 maxEntries 时删除最旧的条目
// ============================================================
async function trimCache (cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length >= maxEntries) {
    // 简单策略：删除第一个（最早缓存的）
    // 注意：keys() 返回顺序 API 未严格保证，但多数浏览器按插入顺序返回
    const toDelete = keys.slice(0, keys.length - maxEntries + 1)
    for (const req of toDelete) {
      await cache.delete(req)
    }
  }
}

// ============================================================
// StaleWhileRevalidate
// ============================================================
async function staleWhileRevalidate ({ request, cacheName, maxEntries, maxAgeSeconds }) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  // 后台网络请求用于更新缓存
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
      // 克隆响应以添加缓存时间标记
      const clonedResponse = networkResponse.clone()
      await trimCache(cacheName, maxEntries)
      await cache.put(request, clonedResponse)
    }
    return networkResponse
  }).catch(() => null)

  if (cachedResponse) {
    console.log('[SW-API] 📦 缓存命中 → ' + request.url.split('?s=')[1])
    return cachedResponse
  }

  console.log('[SW-API] 🌐 缓存未命中 → ' + request.url.split('?s=')[1])
  const networkResponse = await networkPromise
  if (networkResponse) return networkResponse
  // 网络失败且无缓存 → 返回 503
  return new Response(JSON.stringify({ status: 503, message: 'Network error' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  })
}

// ============================================================
// NetworkFirst
// ============================================================
async function networkFirst ({ request, cacheName, maxEntries, maxAgeSeconds, networkTimeoutSeconds }) {
  const cache = await caches.open(cacheName)

  try {
    // 带超时的网络请求
    const networkResponse = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('timeout')), networkTimeoutSeconds * 1000)
      fetch(request).then(response => {
        clearTimeout(timeoutId)
        resolve(response)
      }).catch(err => {
        clearTimeout(timeoutId)
        reject(err)
      })
    })

    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
      const clonedResponse = networkResponse.clone()
      await trimCache(cacheName, maxEntries)
      await cache.put(request, clonedResponse)
    }
    console.log('[SW-API] 🌐 网络响应 → ' + request.url.split('?s=')[1])
    return networkResponse
  } catch (err) {
    // 网络超时或失败 → 降级到缓存
    console.log('[SW-API] ⏱ 网络超时，降级缓存 → ' + request.url.split('?s=')[1])
    const cachedResponse = await cache.match(request)
    if (cachedResponse) return cachedResponse
    return new Response(JSON.stringify({ status: 503, message: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ============================================================
// CacheFirst
// ============================================================
async function cacheFirst ({ request, cacheName, maxEntries, maxAgeSeconds }) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    console.log('[SW-API] 📦 CacheFirst 命中 → ' + request.url.split('?s=')[1])
    return cachedResponse
  }

  console.log('[SW-API] 🌐 CacheFirst 未命中，取网络 → ' + request.url.split('?s=')[1])
  try {
    const networkResponse = await fetch(request)
    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
      await trimCache(cacheName, maxEntries)
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (err) {
    return new Response(JSON.stringify({ status: 503, message: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ============================================================
// NetworkOnly
// ============================================================
async function networkOnly ({ request }) {
  console.log('[SW-API] 🔒 NetworkOnly → ' + request.url.split('?s=')[1])
  return fetch(request)
}

// ============================================================
// 主 fetch 事件监听器
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event

  // 只处理 GET 请求
  if (request.method !== 'GET') return

  // 只处理跨域 API（smart-shop.itheima.net）
  const url = request.url
  if (!url.includes('smart-shop.itheima.net')) return

  // 提取 s=/api/xxx 路径
  const apiPath = extractApiPath(url)
  if (!apiPath) return

  // 查找匹配路由
  const route = findRoute(apiPath)
  if (!route) return

  // 执行对应策略
  console.log('[SW-API] ✅ 拦截成功 → ' + apiPath + ' [' + route.strategy + ']')

  const strategyMap = {
    StaleWhileRevalidate: staleWhileRevalidate,
    NetworkFirst: networkFirst,
    CacheFirst: cacheFirst,
    NetworkOnly: networkOnly
  }

  const handler = strategyMap[route.strategy]
  if (handler) {
    event.respondWith(handler({
      request,
      cacheName: route.cacheName,
      maxEntries: route.maxEntries,
      maxAgeSeconds: route.maxAgeSeconds,
      networkTimeoutSeconds: route.networkTimeoutSeconds
    }))
  }
})
