<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    div(v-if='isElection')
      .fit.flex.column
        q-tabs.q-mb-lg(
          v-model="tab"
          align="left"
          narrow-indicator
          style='max-width: calc(100vw - 150px);'
        )
          q-btn.bg-orange.text-white.text-bold(flat to='/democracy/candidat' :disable='isToCandidate') Devenir candidat
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
      .fit.flex(v-if="candidature.candidatures && isToVote")
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
      div.text-center(v-else) C'est pas encore le moment de voter, reviens plus tard !
    div.text-center(v-else-if='hasLaw')
      h4.q-my-none Votez pour une loi
      small.text-grey.q-mb-md Vous pouvez voter pour une loi proposée par un membre du gouvernement
      q-separator.q-my-md
      q-splitter(v-model="splitterModel" style="height: 100%")
        template(#before)
          q-tabs(
            v-model="tablaw"
            align="justify"
            vertical
          )
            q-tab(v-for="law in listVoteLaws" :key="law.id" :name='law.lawnum' :label="law.lawnum")
        template(#after)
          q-tab-panels(
            v-model="tablaw"
          )
            q-tab-panel(v-for="law in listVoteLaws" :key="law.id" :name='law.lawnum' :label="law.lawnum")
              h5.text-h5.q-mb-md.q-mt-none
                q-icon(name='mdi-file-document-edit' size='44px' color='grey-4')
                | {{ law.title }}
              q-separator.q-my-md
              div(v-html='law.content')
          q-card-section.text-center(v-if="!tablaw")
            q-icon(name='mdi-information-outline' size='66px' color='grey-4')
            small.text-grey Sélectionne une loi pour voir son contenu
      q-separator.q-my-md(v-if='tablaw')
      .fit.flex(v-if="tablaw")
        .flex.justify-center.items-center.column(:style='{flex: 1}')
          h3.text-center.q-mb-md.q-mt-none Urne de vote
          .slot.middle.cursor-pointer.flex.column(@click="toVoteLaw")
            q-icon(name='mdi-circle' size='10vw' :color='hasLawVoted ? "green" : "red"')
            div(v-if='hasLawVoted') déjà voté
            div(v-else) vote pour une mesure
          .flex
            q-select(
              v-model="voteLaw"
              :options="[{label: 'Approuver', value: 1}, {label: 'Refuser', value: -1}, {label: 'Sabstenir', value: 0}]"
              :disable="false"
              :label="`Vote pour la future loi !`"
              emit-value
              map-options
              error-message="Vous devez voter pour une loi !"
              :style='{ width: "35vw" }'
            )
    div(v-else)
      q-card-section.text-center
        h2.text-h4.q-mb-md.q-mt-none
          | Pas d'élection ou de vote en cours
          q-icon(name='mdi-information-outline' size='66px' color='grey-4')
        small.text-grey
          | Les élections se déroulent tous les vendredis de 18h à dimanche 20h
          br
          | Vous pouvez proposer votre candidature le vendredi à partir de 18h
</template>

<script lang="ts">
export default {
  data() {
    return {
      splitterModel: 20,
      tablaw: null,
      tab: null,
      voteCandidature: null,
      voteLaw: null,
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

    const {
      data: law,
      refresh: refreshLaw,
      error: errorLaw,
    } = await useHttp<any>('/core/democracy/law/' + getUsername.value, {
      transform: (result) => {
        return result?.data || {}
      },
    })

    return {
      error,
      candidature,
      refresh,
      errorLaw,
      law,
      refreshLaw,

      getUsername,
    }
  },
  computed: {
    isCandidat() {
      return this.candidature.candidatures.some((candidat) => candidat.proposedBy === this.getUsername)
    },
    hasLaw() {
      if (this.law.length > 0) {
        return this.law.some((law) => {
          const appliedAtTs = new Date(law.appliedAt).getTime()
          const currentTs = new Date().getTime()

          return appliedAtTs < currentTs
        })
      }
    },
    hasLawVoted() {
      const law = this.law.filter((l) => this.tablaw === l.lawnum)
      if (law.length > 0) {
        return law[0].voted
      }
      return false
    },
    listVoteLaws() {
      return this.law.filter((law) => {
        const appliedAtTs = new Date(law.appliedAt).getTime()
        const currentTs = new Date().getTime()

        return appliedAtTs > currentTs
      })
    },
    isElection() {
      // les elections se déroulent tout les vendredi de 18h à dimanche 20h
      const currentDate = new Date()

      const day = currentDate.getDay() // 0 = dimanche, 5 = vendredi, 6 = samedi
      const hours = currentDate.getHours()

      // Vendredi à partir de 18h
      if (day === 5) return true

      // Samedi (toute la journée)
      if (day === 6) return true

      // Dimanche avant 20h
      if (day === 0 && hours < 20) return true

      return false
    },
    isToVote() {
      // les elections se déroulent tout les vendredi de 18h à dimanche 20h
      const currentDate = new Date()

      const day = currentDate.getDay() // 0 = dimanche, 5 = vendredi, 6 = samedi
      const hours = currentDate.getHours()

      // Samedi (toute la journée)
      if (day === 6) return true

      // Dimanche avant 20h
      if (day === 0 && hours < 20) return true

      return false
    },
    isToCandidate() {
      if (this.isCandidat) {
        return true
      }

      // les elections se déroulent tout les vendredi de 18h à dimanche 20h
      const currentDate = new Date()

      const day = currentDate.getDay() // 0 = dimanche, 5 = vendredi, 6 = samedi

      // Vendredi à partir de 18h
      if (day === 5) return false

      return true
    },
  },
  methods: {
    async toVoteLaw() {
      if (this.hasLawVoted) {
        return
      }

      if (typeof this.voteLaw !== 'number') {
        this.$q.notify({
          type: 'negative',
          message: 'Vous devez voter pour une loi !',
        })
        return
      }

      // const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)
      const { data, error } = await useHttp<any>('/core/democracy/law/vote/' + this.getUsername + '/' + this.tablaw, {
        method: 'POST',
        body: {
          vote: this.voteLaw,
        },
      })

      if (error.value) {
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
        this.refresh()
        this.refreshLaw()
        this.tablaw = null
      }
    },
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

      if (error.value) {
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
