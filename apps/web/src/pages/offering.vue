<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    .fit.flex.justify-center
      .slot.big.cursor-pointer
        img.non-selectable(
          :class="{'no-texture' : !getItemTexture(26 + n)}"
          :src="getItemTexture(26 + n)"
          :title="getItemTitle(26 + n)"
        )
</template>

<script lang="ts">
export default {
  methods: {
    getItemTexture(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0]?._data?.texture : ''
    },
    getItemTitle(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0]?._data?.name : ''
    },
  },
}
</script>
