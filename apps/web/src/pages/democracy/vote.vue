<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    .fit.flex(v-if="candidature.candidatures")
      .flex.justify-center.items-center.column(:style='{flex: 1}')
        .slot.middle.cursor-pointer(@click="toVoteCandidature")
          q-icon(name='mdi-circle' size='10vw' :color='candidature.hasVoted ? "green" : "red"')
        .flex
          q-select(
            v-model="voteCandidature"
            :options="candidature.candidatures"
            :disable="candidature.hasVoted"
            :label="`Vote pour le futur maire !`"
            emit-value
            map-options
            error-message="Vous devez voter pour un candidat !"
            :style='{ width: "35vw" }'
            option-value="proposedBy"
            option-label="proposedBy"
          )
</template>

<script lang="ts">
export default {
  data() {
    return {
      voteCandidature: null,
    }
  },
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)

    const {
      data: candidature,
      refresh,
      error,
    } = await useHttp<any>('/core/democracy/candidature/' + currentWeekNumber + '/' + getUsername.value, {
      transform: (result) => {
        return result?.data || {}
      },
    })

    return {
      error,
      candidature,
      refresh,

      getUsername,
    }
  },
  methods: {
    async toVoteCandidature() {
      if (!this.voteCandidature) {
        this.$q.notify({
          type: 'negative',
          message: 'Vous devez voter pour un candidat !',
        })
        return
      }

      const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)
      const { data, error } = await useHttp<any>('/core/democracy/candidature/' + currentWeekNumber + '/' + this.getUsername + '/vote', {
        method: 'POST',
        body: {
          target: this.voteCandidature,
        },
      })

      if (error) {
        console.error('Error while voting:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors du vote: ' + error.value?.data.message,
        })
        return
      }

      if (data) {
        this.$q.notify({
          type: 'positive',
          message: 'Vote pris en compte !',
        })
        this.candidature.hasVoted = true
      }
    },
  },
}
</script>
