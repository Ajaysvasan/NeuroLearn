import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      // React plugin with Fast Refresh
      react({
        fastRefresh: true,
        // Exclude storybook stories from fast refresh
        exclude: /\.stories\.(t|j)sx?$/,
        // React DevTools integration
        babel: {
          plugins: isDevelopment ? [
            ['@babel/plugin-transform-react-jsx-development', {}]
          ] : []
        }
      }),

      // Code splitting for vendor chunks
      splitVendorChunkPlugin(),

      // PWA Configuration
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                  return `${request.url}?v=1`
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.intelliassess\.com\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                },
                networkTimeoutSeconds: 10
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'IntelliAssess - Intelligent Assessment Platform',
          short_name: 'IntelliAssess',
          description: 'AI-powered assessment platform for Chennai students and teachers',
          theme_color: '#1976d2',
          background_color: '#fafafa',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['education', 'productivity'],
          lang: 'en-IN',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Take Quiz',
              short_name: 'Quiz',
              description: 'Start taking a quiz',
              url: '/student/dashboard',
              icons: [{ src: '/shortcuts/quiz.png', sizes: '96x96' }]
            },
            {
              name: 'Create Quiz',
              short_name: 'Create',
              description: 'Create a new quiz',
              url: '/teacher/quiz/create',
              icons: [{ src: '/shortcuts/create.png', sizes: '96x96' }]
            },
            {
              name: 'View Results',
              short_name: 'Results',
              description: 'View quiz results',
              url: '/student/results',
              icons: [{ src: '/shortcuts/results.png', sizes: '96x96' }]
            }
          ]
        },
        devOptions: {
          enabled: isDevelopment,
          type: 'module',
          navigateFallback: 'index.html'
        }
      }),

      // Bundle analyzer for production builds
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@context': resolve(__dirname, 'src/context'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@store': resolve(__dirname, 'src/store'),
        '@router': resolve(__dirname, 'src/router'),
        '@constants': resolve(__dirname, 'src/utils/constants'),
        '@helpers': resolve(__dirname, 'src/utils/helpers')
      }
    },

    // CSS Configuration
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },

    // Development Server Configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
            })
          }
        }
      }
    },

    // Preview Server Configuration (for production builds)
    preview: {
      port: 4173,
      host: true,
      cors: true
    },

    // Build Configuration
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment,
      minify: isProduction ? 'terser' : false,
      
      // Terser options for production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        format: {
          comments: false
        }
      } : {},

      // Rollup options
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['@mui/material', '@mui/icons-material'],
            'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
            'query-vendor': ['@tanstack/react-query'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers'],
            'animation-vendor': ['framer-motion'],
            'chart-vendor': ['recharts'],
            'utils-vendor': ['date-fns', 'lodash-es', 'axios']
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const fileName = facadeModuleId.split('/').pop().replace(/\.(jsx?|tsx?)$/, '')
              return `js/${fileName}-[hash].js`
            }
            return `js/[name]-[hash].js`
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const extType = info[info.length - 1]
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              return `media/[name]-[hash][extname]`
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(assetInfo.name)) {
              return `img/[name]-[hash][extname]`
            }
            if (extType === 'css') {
              return `css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          }
        }
      },

      // Asset handling
      assetsInlineLimit: 4096, // 4kb
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Generate manifest
      manifest: true,
      
      // Write bundle info
      write: true,
      
      // Empty output dir before build
      emptyOutDir: true
    },

    // Environment Variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(process.env.COMMIT_HASH || 'unknown'),
      global: 'globalThis'
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@reduxjs/toolkit',
        'react-redux',
        '@tanstack/react-query',
        'axios',
        'date-fns',
        'lodash-es'
      ],
      exclude: [
        'fsevents'
      ]
    },

    // ESBuild options
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: 'es2015',
      drop: isProduction ? ['console', 'debugger'] : []
    },

    // Worker configuration
    worker: {
      format: 'es'
    },

    // Experimental features
    experimental: {
      renderBuiltUrl(filename, { hostId, hostType, type }) {
        if (type === 'asset') {
          return `/${filename}`
        }
        return { relative: true }
      }
    }
  }
})
