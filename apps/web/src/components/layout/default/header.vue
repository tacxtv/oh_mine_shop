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
            q-item-label.text-h6.text-white
              small {{ getCurrency }}
              q-icon.q-ml-xs(name="mdi-cash" class="q-mr-sm")
            q-btn.gt-xs(icon="mdi-refresh" color='warning' v-if='hasRole("op")' @click="refreshAuthToken()" flat dense)
            q-btn.gt-xs(icon="mdi-theme-light-dark" @click="$q.dark.toggle()" flat dense)
            q-btn-dropdown(flat dense)
              template(#label)
                q-avatar(
                  :style="{ width: '28px', height: '28px' }"
                  class="q-mr-sm" square
                )
                  img(:src="getAvatar" v-if="getAvatar")
                  q-icon(name="mdi-account" v-else)
                span {{ getUsername }}
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
    async refreshAuthToken() {
      const $auth = useAuth()

      if ($auth.loggedIn) {
        await $auth.refreshTokens()
      }
    },
    async logout() {
      const $auth = useAuth()

      await $auth.logout()
      this.$router.go(0)
    },
    hasRole(role: string) {
      const $auth = useAuth()

      return ($auth.user?.roles as string[]).includes(role)
    },
  },
  computed: {
    getUsername() {
      const $auth = useAuth()

      return $auth.user?.name
    },
    getCurrency() {
      const $auth = useAuth()

      return $auth.user?.currency
    },
    getAvatar() {
      const $auth = useAuth()

      return $auth.user?._avatarBase64 ? `data:image/png;base64,${$auth.user?._avatarBase64}` : null
    },
  },
}
</script>
