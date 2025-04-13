<template lang="pug">
q-layout.flex.column(view="hHh Lpr lff")
  q-custom-layout-default-header
  q-custom-layout-default-drawer
  q-page-container.q-mx-md.flex.column(:style="{ flex: 1 }")
    nuxt-page
  q-custom-layout-default-footer
</template>

<script lang="ts">
export default {
  name: 'DefaultLayout',
  setup() {
    const $q = useQuasar()

    provide('drawer', ref($q.screen.width > $q.screen.sizes.md))
  },
}
</script>
