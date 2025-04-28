<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    q-tabs(v-model='tab' inline-label)
      q-tab(name='upload', label='Déposer')
      //- q-tab(name='exchange', label='Echanger')
    q-card-section
      nuxt-page
</template>

<script lang="ts">
export default {
  setup() {
    const $route = useRoute()
    const $router = useRouter()

    if ($route.path === '/bank') {
      $router.replace('/bank/upload')
    }

    return {}
  },
  computed: {
    tab: {
      get(): string[] | string {
        return this.$route.path.split('/')[2]
      },
      set(v: string) {
        this.$router.replace('/bank/' + v)
      },
    },
    isAdmin(): boolean {
      const $auth = useAuth()

      return ($auth.user as any)?.roles.includes('op')
    },
  },
}
</script>
