<template lang="pug">
  div(v-if='error')
    q-card-section.text-center
      q-icon(name='mdi-alert-circle', size='50px' color='red')
      p(v-text='"Erreur lors du chargement des scores..."')
  div(v-else-if='ranking?.length === 0')
    q-card-section.text-center
      q-icon(name='mdi-alert-circle', size='50px' color='red')
      p(v-text='"Aucun score trouvé..."')
  div(v-else-if='error')
    q-card-section.text-center
      q-spinner-dots(size='50px' color='purple')
      p(v-text='"Chargement des scores..."')
  div(v-else)
    div(v-for='defi in ranking')
      q-table(
        flat bordered
        :title="defi.name + ' (' + defi.itemId + ')'"
        :rows="defi._rank"
        :columns="columns"
        row-key="name"
      )
</template>

<script lang="ts">
export default {
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const {
      data: ranking,
      refresh,
      error,
    } = await useHttp<any>('/core/defi/ranking', {
      transform: (result) => {
        return result?.data || {}
      },
    })

    return {
      error,
      ranking,
      refresh,

      getUsername,
    }
  },
}
</script>
