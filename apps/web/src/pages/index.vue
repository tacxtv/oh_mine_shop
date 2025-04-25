<template lang="pug">
  q-card.q-pa-md(flat :style="{ flex: 1 }")
    q-card-section
      h3.q-mt-sm Bienvenue dans la nouvelle saison de Miratopia
      p.text-body1 Bienvenue dans Miratopia, un monde en pleine expansion ! Après les événements passés, devenez l'aventurier chargé par le gouverneur de Fraktalis, le gouverneur le plus avide de pouvoir ! Votre mission ? Explorez un tout nouveau monde, aidez les voyageurs qui vous ont accompagnés, découvrez de nouvelles structures bercées dans les légendes anciennes et établissez ensemble le nouveau village communautaire d'Itineralis !
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
