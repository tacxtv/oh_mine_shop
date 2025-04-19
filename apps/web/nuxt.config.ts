import { readFileSync } from 'node:fs'
import { defineNuxtConfig } from 'nuxt/config'
import pugPlugin from 'vite-plugin-pug'
import consola from 'consola'
import { resolve } from 'node:path'

const OMS_API_URL = process.env.OMS_API_URL || 'http://localhost:4000'

let sslCfg = <any>{}
if (/yes|1|on|true/i.test(`${process.env.OMS_HTTPS_ENABLED}`)) {
  try {
    sslCfg.https = {
      key: readFileSync(`${process.env.OMS_HTTPS_PATH_KEY}`, 'utf8'),
      cert: readFileSync(`${process.env.OMS_HTTPS_PATH_CERT}`, 'utf8'),
    };
    consola.info('[Nuxt] SSL certificates loaded successfully')
  } catch (error) {
    consola.warn('[Nuxt] Error while reading SSL certificates', error)
  }
}

console.log('sslCfg', process.env.OMS_HTTPS_ENABLED)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-02-19",
  srcDir: "src",
  pages: true,
  telemetry: false,
  ssr: false,
  devServer: {
    port: 3000,
    host: '0',
    ...sslCfg,
  },
  debug: !!process.env.DEBUG,
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    timeline: {
      enabled: true,
    },
  },
  css: ["~/assets/sass/global.sass"],
  components: {
    global: true,
    dirs: [{ path: '~/components', prefix: 'q-custom' }],
  },
  modules: [
    '@nuxt-alt/auth',
    '@nuxt-alt/proxy',
    '@nuxt-alt/http',
    '@pinia/nuxt',
    'nuxt-quasar-ui',
    '@vueuse/nuxt',
    'dayjs-nuxt',
    '@nuxt/devtools',
  ],
  auth: {
    globalMiddleware: true,
    rewriteRedirects: true,
    watchLoggedIn: true,
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          maxAge: 60 * 5,
        },
        refreshToken: {
          property: 'refresh_token',
          data: 'refresh_token',
          maxAge: 60 * 60 * 4,
        },
        user: {
          property: 'user',
          autoFetch: true,
        },
        endpoints: {
          login: {
            url: `/api/core/auth/local`,
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
          },
          refresh: {
            url: `/api/core/auth/refresh`,
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
          },
          logout: { url: `/api/core/auth/logout`, method: 'post' },
          user: { url: `/api/core/auth/session`, method: 'get' },
        },
        // @ts-ignore
        redirect: {
          logout: '/login',
          login: '/',
        },
        tokenType: 'Bearer',
        autoRefresh: true,
      },
      minecraft: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          maxAge: 60 * 5,
        },
        refreshToken: {
          property: 'refresh_token',
          data: 'refresh_token',
          maxAge: 60 * 60 * 4,
        },
        user: {
          property: 'user',
          autoFetch: true,
        },
        endpoints: {
          login: {
            url: `/api/core/auth/minecraft`,
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
          },
          refresh: {
            url: `/api/core/auth/refresh`,
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
          },
          logout: { url: `/api/core/auth/logout`, method: 'post' },
          user: { url: `/api/core/auth/session`, method: 'get' },
        },
        // @ts-ignore
        redirect: {
          logout: '/login',
          login: '/',
        },
        tokenType: 'Bearer',
        autoRefresh: true,
      },
    },
    stores: {
      pinia: {
        enabled: true,
      },
    },
  },
  proxy: {
    proxies: {
      '/api': {
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        target: OMS_API_URL,
        secure: false,
        changeOrigin: true,
        xfwd: true,
      }
    },
  },
  http: {
    debug: /true|on|yes|1/i.test(`${process.env.DEBUG}`),
    browserBaseURL: '/api',
    baseURL: '/api',
  },
  quasar: {
    iconSet: 'mdi-v7',
    plugins: ['Dialog', 'Loading', 'Notify'],
    config: {
      dark: 'auto',
      brand: {
        primary: '#F2DF4B',
        secondary: '#1E202C',
        accent: '#9c27b0',
        dark: '#1a1a1a',
        'dark-page': '#121212',
        positive: '#21ba45',
        negative: '#ff3860',
        info: '#31ccec',
        warning: '#f2c037',
      },
      notify: {
        timeout: 2500,
        position: 'top-right',
        actions: [{ icon: 'mdi-close', color: 'white' }],
      },
    },
  },
  alias: {
    cookie: resolve(__dirname, '../node_modules/cookie'),
  },
  pinia: {
    storesDirs: ['~/stores'],
  },
  vite: {
    define: {
      'process.env.DEBUG': process.env.NODE_ENV === 'development',
    },
    plugins: [
      pugPlugin(<any>{
        pretty: true,
        compilerOptions: {},
      }),
    ],
  },
})
