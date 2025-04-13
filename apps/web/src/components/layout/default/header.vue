<template lang="pug">
q-header.q-pa-md.bg-white(
  :style="{ background: $q.dark.isActive ? 'var(--q-dark-page) !important' : '', border: $q.dark.isActive ? '1px solid var(--q-dark-page) !important' : '' }"
)
  .row
    q-card.bg-secondary.q-mr-md(flat)
      q-toolbar.q-px-none
        q-btn.rounded-borders(color="white" flat round)
          q-img(src="/logo.png" width="46px" height="46px" class="q-mx-xs")
    .col
      q-card.bg-secondary.text-white(flat)
        .row.no-wrap
          q-toolbar
            q-toolbar-title.gt-xs Oh Mine Shop
            q-btn.lt-sm(icon="mdi-menu" color="white" @click="drawer = !drawer" flat dense)
          q-toolbar.q-gutter-sm
            q-space
            //- q-btn(icon="mdi-theme-light-dark" @click="$q.dark.toggle()" flat dense)
            q-btn-dropdown(icon="mdi-account" :label="getUsername" flat dense)
              q-list
                q-item(@click='logout' clickable v-close-popup)
                  q-item-section
                    q-item-label Déconnexion
</template>

<script lang="ts">
export default {
  name: 'LayoutDefaultHeaderComponent',
  setup() {
    return {
      drawer: inject('drawer'),
    }
  },
  watch: {
    '$q.screen.lt.sm': {
      handler(v) {
        this.drawer = !v
      },
      immediate: true,
    },
  },
  methods: {
    async logout() {
      const $auth = useAuth()

      await $auth.logout()
      this.$router.go(0)
    },
  },
  computed: {
    getUsername() {
      const $auth = useAuth()

      return $auth.user?.name
    },
  },
}
</script>
