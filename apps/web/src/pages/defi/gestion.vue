<template lang="pug">
div(class='q-pa-md')
  q-card(flat)
    q-card-section.text-center
      q-input(v-model='name' label='Nom du défi' outlined)
      q-input(v-model='itemId' label='Item identifiant' placeholder='minecraft:dirt' outlined)
      q-input(v-model='startAt' label='debut' type='datetime-local' outlined)
      q-input(v-model='endAt' label='fin' type='datetime-local' outlined)
    q-card-actions
      q-btn(label='Créer' color='primary' @click='createDefi')
  q-card(flat style='max-width: 75vw')
    q-table(
      flat bordered
      :rows='ranking'
      row-key='name'
      @row-click='changeRow'
    )
</template>

<script lang="ts">
const defaultDate = new Date()
defaultDate.setHours(0, 0, 0, 0)

const defaultEndDate = new Date()
defaultEndDate.setHours(23, 59, 59, 999)
defaultEndDate.setDate(defaultEndDate.getDate() + 6)

export default {
  data() {
    return {
      name: '',
      itemId: '',
      startAt: toLocalISOString(defaultDate),
      endAt: toLocalISOString(defaultEndDate),
    }
  },
  async setup() {
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
    }
  },
  methods: {
    async createDefi() {
      await $http.$post('/core/defi/create', {
        body: {
          name: this.name,
          itemId: this.itemId,
          startAt: new Date(this.startAt).getTime(),
          endAt: new Date(this.endAt).getTime(),
        },
      })
    },
    async changeRow(ev, row: any) {
      if (row.participation && row.participation.length > 0) {
        alert('Impossible de supprimer un défi avec des participations')
        return
      }
      await this.$q
        .dialog({
          title: 'Supprimer le défi',
          message: 'Êtes-vous sûr de vouloir supprimer ce défi ?',
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          await $http.$post('/core/defi/delete', {
            body: {
              id: row._id,
            },
          })
          this.refresh()
        })
    },
  },
}

function toLocalISOString(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offsetMs)
  return localDate.toISOString().slice(0, 16)
}
</script>
