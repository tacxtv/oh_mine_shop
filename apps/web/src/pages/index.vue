<template lang="pug">
  q-card.q-pa-md(flat :style="{ flex: 1 }")
    q-card-section
      h3.q-mt-sm Bienvenue dans la nouvelle saison de Miratopia
    q-card.bg-positive(v-if='getState === 99')
      q-card-section
        h6
          b Vous êtes whitelisté, vous pouvez rejoindre dès maintenant le serveur
    q-card.bg-negative(v-else-if='getState < 99')
      q-card-section
        h6
          b Vous êtes pas whitelisté, veuillez contacter un membre de l'équipe technique !
</template>

<script lang="ts">
export default {
  async setup() {
    definePageMeta({
      auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
      },
    })

    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const getState = computed(() => {
      const $auth = useAuth()

      return $auth.user?.state
    })

    return {
      getUsername,
      getState,
    }
  },
}
</script>
