<template lang="pug">
  div(v-for='defi in ranking')
    q-table(
      flat bordered
      :title="defi.name + ' (' + defi.itemId + ')'"
      :rows="defi._rank"
      :columns="columns"
      row-key="name"
      hide-bottom
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
