<template lang="pug">
q-layout(view="lHh Lpr fff")
  q-page-container
    q-page.window-height.window-width.row.justify-center.items-center(
      :style-fn="getStyle"
    )
      nuxt-page
</template>

<script lang="ts">
export default {
  name: 'DefaultLayout',
  methods: {
    getStyle() {
      return {
        backgroundImage: `url('https://raw.githubusercontent.com/tacxtv/miratopia-launcher/refs/heads/config/launcher/splash.png'), linear-gradient(#5274C5, #9A4A9F)`,
        backgroundSize: 'cover',
      }
    },
  },
}
</script>
