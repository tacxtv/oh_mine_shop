<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    q-tabs(v-model='tab')
      q-tab(name='upload', label='Défi')
      q-tab(name='ranking', label='Classement')
    q-card-section
      nuxt-page
</template>

<script lang="ts">
export default {
  setup() {
    const $route = useRoute()
    const $router = useRouter()

    console.log('route', $route.path.split('/')[2])

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
  },
}
</script>
