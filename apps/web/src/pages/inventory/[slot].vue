<template lang="pug">
  q-card-section.q-py-none#to-place-in-store
    q-form
      .row.q-col-gutter-md.q-mb-md
        .col-12.col-md-8
          q-input(v-model="formData.item" label="Name" readonly outlined)
        .col-12.col-md-4
          q-select(v-model="formData.stack" label="Stack" :options='[1, 16, 64]' outlined)
      .row.q-col-gutter-md.q-mb-md
        .col-12.col-md-6
          q-input(v-model="formData.price" label="Prix de vente" type="number" step="1" outlined)
        .col-12.col-md-6
          q-input(v-model="formData.price" label="Prix moyen /stack" type="number" readonly outlined)

  q-expansion-item.bg-blue-grey-10(label='NBT' icon='mdi-bug' dark dense)
    .outer-ne-resize(:style='{minHeight: "250px", height: "250px"}')
      q-card.overflow-auto.bg-blue-grey-8.text-white.inner-ne-resize
        q-card-section.q-pa-xs
          pre.q-ma-none(v-html='JSON.stringify(formData.nbt, null, 2)')

  q-card-actions
    q-space
    q-btn(label="Annuler" color="negative" @click="$router.replace('/inventory')" flat)
    q-btn(label="Mettre en vente !" color="positive" @click="sell")
</template>

<script lang="ts">
export default {
  name: 'InventorySlotPage',
  props: {
    formData: {
      type: Object,
      required: true,
    },
    slot: {
      type: Number,
      required: true,
    },
    refresh: {
      type: Function,
      required: true,
    },
  },
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    return {
      getUsername,
    }
  },
  methods: {
    async sell() {
      try {
        await useHttp(`/core/article/${this.getUsername}/sell/${this.slot}`, {
          method: 'POST',
          body: {
            stack: this.formData.stack,
            price: this.formData.price,
          },
        })
        this.$q.notify({
          type: 'positive',
          message: 'Objet mis en vente !',
        })
        this.$router.replace('/inventory')
        this.refresh()
      } catch (error) {
        console.error('Error selling item:', error)
        this.$q.notify({
          type: 'negative',
          message: "Erreur lors de la vente de l'objet",
        })
      }
    },
  },
}
</script>
