<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    .fit.flex(v-if="money")
      .flex.justify-center.items-center.column(:style='{flex: 1}')
        h1.text-h4 Dans votre inventaire
        .slot.middle.cursor-pointer.column
          .text-body1(style='font-size: 24px') {{ getCurrencyFromInventory }}
          img.non-selectable(
            :class="{'no-texture' : !getItemTexture}"
            :src="getItemTexture"
            :title="getItemTitle"
          )
      .flex.justify-center.items-center.column
        q-btn.bg-positive(
          icon='mdi-cash'
          @click="upload"
        ) &nbsp;&nbsp;Envoyer
      .flex.justify-center.items-center.column(:style='{flex: 1}')
        h1.text-h4 Dans votre banque
        .slot.middle.cursor-pointer.column
          .text-body1(style='font-size: 24px') {{ getCurrentCurrency }}
          img.non-selectable(
            :class="{'no-texture' : !getItemTexture}"
            :src="getItemTexture"
            :title="getItemTitle"
          )
    h5.text-warning ATTENTION: Au dessus de 100_000 Mirex, votre compte sera taxé par le village a hauteur de 5% par semaine
    q-separator.q-my-xl
    .fit.flex.column(style='flex-direction: row;')
      q-card.bg-blue.q-pa-md.q-mx-md.text-center.cursor-pointer(
        flat :style='{flex: 3}' style='align-content: center; flex-direction: row; display: flex; align-items: center;'
        @click='buyChunk'
      )
        q-icon(name='mdi-cash' size='50px' color='white')
        h5(style="flex: 1;") Acheter un titre de propriété (claim)
        h6(style='font-size: 14px') (prix actuel: {{ getNextPrice }})
      q-card.bg-grey.q-pa-md.q-mx-md.text-center(flat :style='{flex: 1}' style='align-content: center;')
        h6.text-body2 Actuellement
        h5 {{ getExtraClaimChunks }}
</template>

<script lang="ts">
export default {
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const {
      data: money,
      refresh,
      error,
    } = await useHttp<any>('/core/users/currency/' + getUsername.value, {
      transform: (result) => {
        return result?.data || {}
      },
    })

    const quantity = ref<number>(money.value?._playerMaxQuantity || 0)

    return {
      error,
      money,
      refresh,

      getUsername,

      quantity,
    }
  },
  computed: {
    getItemTexture() {
      return this.money?._data?.texture
    },
    getCurrencyFromInventory() {
      return this.money?._currencyFromInventory || 0
    },
    getExtraClaimChunks() {
      return this.money?._extra_claim_chunks || 0
    },
    getCurrentCurrency() {
      return this.money?.currentCurrency || 0
    },
    getNextPrice() {
      return this.money?._nextPrice || 0
    },
    getItemTitle() {
      return this.money?._data?.name
    },
    getPlayerMaxQuantity() {
      return this.money?._playerMaxQuantity || 0
    },
  },
  methods: {
    async buyChunk() {
      const { error } = await useHttp('/core/users/chunk/' + this.getUsername, {
        method: 'POST',
      })
      if (error.value) {
        this.$q.notify({
          message: "Erreur lors de l'achat du chunk",
          color: 'red',
          icon: 'mdi-alert',
        })
        return
      }

      this.$q.notify({
        message: 'Le chunk a été acheté',
        color: 'green',
        icon: 'mdi-check',
      })

      this.refresh()
      const $auth = useAuth()
      $auth.fetchUser()
    },
    async upload() {
      if (this.getCurrencyFromInventory <= 0) {
        this.$q.notify({
          message: "Vous n'avez pas d'argent à envoyer",
          color: 'red',
          icon: 'mdi-alert',
        })
        return
      }

      const { error } = await useHttp('/core/users/currency/' + this.getUsername + '/' + this.getCurrencyFromInventory, {
        method: 'POST',
      })

      if (error.value) {
        this.$q.notify({
          message: "Erreur lors de l'envoi de la transaction",
          color: 'red',
          icon: 'mdi-alert',
        })
        return
      }

      this.$q.notify({
        message: 'La transaction a été envoyée',
        color: 'green',
        icon: 'mdi-check',
      })

      this.refresh()
      const $auth = useAuth()
      $auth.fetchUser()
    },
    detectVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.refresh()
      }
    },
  },
  mounted() {
    window.addEventListener('focus', this.detectVisibilityChange)
    document.addEventListener('visibilitychange', this.detectVisibilityChange)
  },
  unmounted() {
    window.removeEventListener('focus', this.detectVisibilityChange)
    document.removeEventListener('visibilitychange', this.detectVisibilityChange)
  },
}
</script>
