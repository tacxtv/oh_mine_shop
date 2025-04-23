<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    q-tabs(v-model='tab' inline-label)
      q-tab(name='upload', label='Défi')
      q-tab(name='ranking', label='Classement')
      q-tab(name='gestion', label='Gestion' v-if='isAdmin' icon='mdi-cog')
    q-card-section
      nuxt-page
</template>

<script lang="ts">
export default {
  setup() {
    const $route = useRoute()
    const $router = useRouter()

    if ($route.path === '/defi') {
      $router.replace('/defi/upload')
    }

    return {}
  },
  computed: {
    tab: {
      get(): string[] | string {
        return this.$route.path.split('/')[2]
      },
      set(v: string) {
        this.$router.replace('/defi/' + v)
      },
    },
    isAdmin(): boolean {
      const $auth = useAuth()

      return ($auth.user as any)?.roles.includes('op')
    },
  },
}
</script>
