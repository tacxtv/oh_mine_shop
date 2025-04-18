<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    .fit.flex
      .flex.justify-center.items-center.column(:style='{flex: 1}')
        .slot.big.cursor-pointer
          img.non-selectable(
            :class="{'no-texture' : !getItemTexture}"
            :src="getItemTexture"
            :title="getItemTitle"
          )
        .flex
          q-field(
            :model-value="quantity"
            @update:model-value="q => { quantity = q }"
            type="number"
            label="Quantité"
            :min='0'
            :max='getPlayerMaxQuantity'
            :error="!quantity || quantity <= 0"
            error-message="Vous devez posséder au moins 1 item dans votre inventaire pour participer !"
            filled
            :style='{ width: "35vw" }'
          )
            template(#control)
              q-slider(
                :model-value="quantity"
                @change="q => { quantity = q }"
                :min="0"
                :max="getPlayerMaxQuantity"
                label
                markers
                label-always
                thumb-color="purple"
                label-color="black"
                label-text-color="yellow"
              )
            template(#append)
              q-btn.text-primary(
                @click="upload"
                :disabled="quantity <= 0"
                color='primary'
                icon='mdi-send'
                flat
              )
      .full-height
        .flex.justify-center.q-py-none.column
          div
            p Temps restant
            .slot.medium.cursor-pointer-none
              span(v-text='getRemainingTime')
          div
            p Votre position
            .slot.medium.cursor-pointer-none
              span(v-text='"#" + (defi._playerRank || "0")')
          div
            p Votre participation
            .slot.medium.cursor-pointer-none
              span(v-text='defi._playerParticipation?.amount || "0"')
</template>

<script lang="ts">
export default {
  data() {
    return {
      now: new Date(),
      interval: undefined,
    }
  },
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const {
      data: defi,
      refresh,
      error,
    } = await useHttp<any>('/core/defi/current/' + getUsername.value, {
      transform: (result) => {
        return result?.data || {}
      },
    })

    const quantity = ref<number>(defi.value?._playerMaxQuantity || 0)

    return {
      error,
      defi,
      refresh,

      getUsername,

      quantity,
    }
  },
  computed: {
    getItemTexture() {
      return this.defi._data?.texture
    },
    getItemTitle() {
      return this.defi._data?.name
    },
    getPlayerMaxQuantity() {
      return this.defi._playerMaxQuantity || 0
    },
    getRemainingTime() {
      const endTime = new Date(this.defi.endAt)
      const diff = endTime.getTime() - this.now.getTime()

      if (diff <= 0) {
        this.$q.notify({
          message: 'Le défi est terminé',
          color: 'red',
          icon: 'mdi-close',
        })
        this.refresh()
        return 'Terminé'
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return `${days}j ${hours}h ${minutes}m ${seconds}s`
    },
  },
  methods: {
    async upload() {
      await useHttp('/core/defi/participate/' + this.getUsername + '/' + this.quantity, {
        method: 'POST',
      })

      this.$q.notify({
        message: 'Votre participation a bien été prise en compte',
        color: 'green',
        icon: 'mdi-check',
      })
      this.refresh()
      this.quantity = this.defi._playerMaxQuantity
    },
    detectVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.refresh()
        this.quantity = this.defi._playerMaxQuantity
      }
    },
  },
  mounted() {
    this.interval = setInterval(() => {
      this.now = new Date()

      if (this.now.getTime() >= new Date(this.defi.endAt).getTime()) {
        clearInterval(this.interval)
      }
    }, 1000) as any

    window.addEventListener('focus', this.detectVisibilityChange)
    document.addEventListener('visibilitychange', this.detectVisibilityChange)
  },
  unmounted() {
    clearInterval(this.interval)

    window.removeEventListener('focus', this.detectVisibilityChange)
    document.removeEventListener('visibilitychange', this.detectVisibilityChange)
  },
}
</script>
