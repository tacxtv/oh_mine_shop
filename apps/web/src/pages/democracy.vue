<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    q-tabs(v-model='tab' inline-label)
      q-tab(name='vote', label='Vote')
      //- q-tab(name='village', label='Village')
      q-tab(name='mairie', label='Mairie' icon='mdi-city-variant' v-if='isMairie')
    q-card-section
      nuxt-page
</template>

<script lang="ts">
export default {
  setup() {
    const $route = useRoute()
    const $router = useRouter()

    if ($route.path === '/democracy') {
      $router.replace('/democracy/vote')
    }

    return {}
  },
  computed: {
    tab: {
      get(): string[] | string {
        return this.$route.path.split('/')[2]
      },
      set(v: string) {
        this.$router.replace('/democracy/' + v)
      },
    },
    isAdmin(): boolean {
      const $auth = useAuth()

      return ($auth.user as any)?.roles.includes('op')
    },
    isMairie(): boolean {
      const $auth = useAuth()

      return ($auth.user as any)?.roles.includes('maire') || ($auth.user as any)?.roles.includes('adjoint') || this.isAdmin
    },
  },
}
</script>
