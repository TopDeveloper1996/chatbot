import { defineMultiCacheOptions } from 'nuxt-multi-cache/dist/runtime/serverOptions'

export default defineMultiCacheOptions({
    api: {
        // Use a custom method that checks authorization. Can be something like
        // cookie, basic auth or request IP.
        authorization: async function (event) {
          return true
        },
      },
})