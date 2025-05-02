<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    .fit.flex.column
      q-tabs.q-mb-lg(
        v-model="tab"
        align="left"
        narrow-indicator
        style='max-width: calc(100vw - 150px);'
      )
        q-btn(flat) Devenir candidat
        q-separator(vertical).q-my-md.q-mx-sm
        q-tab(v-for='cand in candidature.candidatures' :name='cand.proposedBy' :label='cand.proposedBy')
      .q-gutter-y-sm
        q-tab-panels.text-white(
          v-model="tab"
          animated
          transition-prev="scale"
          transition-next="scale"
        )
          q-tab-panel(
            v-for='cand in candidature.candidatures'
            :name='cand.proposedBy'
            :key='cand.proposedBy'
          )
            div(v-html='cand.content')
        .q-mt-none.text-center.flex.column(v-if='!tab' style='align-items: center;')
          q-icon(name='mdi-information-outline' size='66px' color='grey-4')
          small.text-grey Sélectionne un candidat pour voir son programme
    q-separator.q-my-md
    .fit.flex(v-if="candidature.candidatures")
      .flex.justify-center.items-center.column(:style='{flex: 1}')
        h3.text-center.q-mb-md.q-mt-none Urne de vote
        .slot.middle.cursor-pointer.flex.column(@click="toVoteCandidature")
          q-icon(name='mdi-circle' size='10vw' :color='candidature.hasVoted ? "green" : "red"')
          div(v-if='candidature.hasVoted') déjà voté
          div(v-else) vote pour un maire
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
      tab: null,
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
      if (this.candidature.hasVoted) {
        return
      }

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
