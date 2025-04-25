<template lang="pug">
  section.flex.column.full-height(:style="{ flex: 1 }")
    div
      q-expansion-item.bg-blue-grey-10(label='Inventory' icon='mdi-bug' dark dense)
        .outer-ne-resize(:style='{minHeight: "250px", height: "250px"}')
          q-card.overflow-auto.bg-blue-grey-8.text-white.inner-ne-resize
            q-card-section.q-pa-xs
              pre.q-ma-none(v-html='JSON.stringify(items, null, 2)')
    q-card.q-py-md.flex(v-if='!inventory' flat :style="{ flex: 1 }")
      q-card-section.flex.justify-center.q-py-none.items-center.full-width.column
        q-spinner(size='xl')
        span.q-mt-md(v-text='error.data?.statusCode === 404 ? "Veuiillez vous connecter au jeu..." : error.message')
    q-card.q-pt-md(v-else flat :style="{ flex: 1 }")
      div
        q-card-section.flex.justify-center.q-py-none
          .slot.cursor-pointer(
            @click="select(8 + n)"
            v-for="n in 9" :key="8 + n"
            :class="{ 'bg-white': slot === 8 + n }"
          )
            q-badge.non-selectable(
              :color='!getItemTag(8 + n) ? "blue" : "warning"'
              v-show="getItemCount(8 + n) > 0"
              :label="getItemCount(8 + n)"
              :max="64" floating
            )
            img.non-selectable(
              v-show="getItemCount(8 + n) > 0"
              :class="{'no-texture' : !getItemTexture(8 + n)}"
              :src="getItemTexture(8 + n)"
            )
        q-card-section.flex.justify-center.q-py-none
          .slot.cursor-pointer(
            @click="select(17 + n)"
            v-for="n in 9" :key="17 + n"
            :class="{ 'bg-white': slot === 17 + n }"
          )
            q-badge.non-selectable(
              :color='!getItemTag(17 + n) ? "blue" : "warning"'
              v-show="getItemCount(17 + n) > 0"
              :label="getItemCount(17 + n)"
              :max="64" floating
            )
            img.non-selectable(
              v-show="getItemCount(17 + n) > 0"
              :class="{'no-texture' : !getItemTexture(17 + n)}"
              :src="getItemTexture(17 + n)"
            )
        q-card-section.flex.justify-center.q-py-none
          .slot.cursor-pointer(
            @click="select(26 + n)"
            v-for="n in 9" :key="26 + n"
            :class="{ 'bg-white': slot === 26 + n }"
          )
            q-badge.non-selectable(
              :color='!getItemTag(26 + n) ? "blue" : "warning"'
              v-show="getItemCount(26 + n) > 0"
              :label="getItemCount(26 + n)"
              :max="64" floating
            )
            img.non-selectable(
              v-show="getItemCount(26 + n) > 0"
              :class="{'no-texture' : !getItemTexture(26 + n)}"
              :src="getItemTexture(26 + n)"
            )

        .q-my-sm

        q-card-section.flex.justify-center.q-py-none
          .slot.cursor-pointer(
            @click="select(n - 1)"
            v-for="n in 9" :key="n - 1"
            :class="{ 'bg-white': slot === n -1 }"
          )
            q-badge.non-selectable(
              :color='!getItemTag(n - 1) ? "blue" : "warning"'
              v-show="getItemCount(n - 1) > 0"
              :label="getItemCount(n - 1)"
              :max="64" floating
            )
            img.non-selectable(
              v-show="getItemCount(n - 1) > 0"
              :class="{'no-texture' : !getItemTexture(n - 1)}"
              :src="getItemTexture(n - 1)"
            )

      q-separator.q-my-md

      nuxt-page(:formData='formData' :slot='slot' :refresh='refresh')
</template>

<script lang="ts">
export default {
  name: 'IventoryPage',
  data() {
    return {
      formData: {
        item: '',
        nbt: {},
        stack: 1,
        price: 1,
      },
    }
  },
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const {
      data: inventory,
      refresh,
      error,
    } = await useHttp<any>('/minecraft/player/inventory/' + getUsername.value, {
      transform: (result) => {
        return result?.data || []
      },
    })

    return {
      error,
      inventory,
      refresh,

      getUsername,
    }
  },
  methods: {
    getItemTexture(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0]?._data?.texture : ''
    },
    getItemTitle(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0]?._data?.name : ''
    },
    getItemTag(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0]?.tag : ''
    },
    getItemCount(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0]?.Count : 0
    },
    getItemData(slot) {
      const item = this.items.filter((item) => item.Slot === slot)

      return item.length > 0 ? item[0] : ''
    },
    async select(slot: number) {
      if (slot < 0 || slot > 35) {
        return
      }

      if (slot === this.slot) {
        await this.$router.replace({
          path: `/inventory`,
        })

        return
      }

      await this.$router.replace({
        path: `/inventory/${slot}`,
        hash: '#to-place-in-store',
      })

      this.fillFormData(this.getItemData(this.slot))
    },
    fillFormData(data: any) {
      const { id, Count, _averagePrice, tag } = data

      this.formData.item = id
      this.formData.stack = Count >= 64 ? 64 : Count >= 16 ? 16 : 1
      this.formData.nbt = tag ?? {}
      this.formData.price = _averagePrice ?? 1
    },
    detectVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.refresh()
      }
    },
  },
  computed: {
    items(): any[] {
      return this.inventory || []
    },
    slot(): number {
      return parseInt(`${this.$route.params.slot}`, 10)
    },
  },
  mounted() {
    window.addEventListener('focus', this.detectVisibilityChange)
    document.addEventListener('visibilitychange', this.detectVisibilityChange)

    this.fillFormData(this.getItemData(this.slot))
  },
  unmounted() {
    window.removeEventListener('focus', this.detectVisibilityChange)
    document.removeEventListener('visibilitychange', this.detectVisibilityChange)
  },
}
</script>
