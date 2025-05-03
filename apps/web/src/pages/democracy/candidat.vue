<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    q-card-section.text-center
      h2.text-h4.q-mb-md.q-mt-none Devenir candidat
      q-input(
        label="Nom du candidat"
        :model-value="proposedBy"
        readonly
        filled
      )
      q-editor(
        v-model="content"
        label="Candidature"
        filled
        style="min-height: 35vh"
      )
    q-card-actions
      q-space
      small.text-negative.q-mr-sm ATTENTION : Vous ne pourrez pas modifier votre candidature une fois proposée
      q-btn.bg-orange.text-white.text-bold(
        label="Proposer"
        color="primary"
        @click="candidate"
        :disable="!content || isToCandidate"
      )
</template>

<script lang="ts">
export default {
  data() {
    return {
      content: '',
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
  computed: {
    isCandidat() {
      return this.candidature.candidatures.some((candidat) => candidat.proposedBy === this.getUsername)
    },
    proposedBy() {
      const $auth = useAuth()

      return $auth.user?.name
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
    async candidate() {
      if (!this.content) {
        this.$q.notify({
          type: 'negative',
          message: 'Vous devez proposer une candidature !',
        })

        return
      }

      const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)

      try {
        await $http.$post('/core/democracy/candidature/' + currentWeekNumber + '/' + this.proposedBy + '/create', {
          body: {
            content: this.content,
          },
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors de la proposition de candidature !',
        })

        return
      }

      this.$q.notify({
        type: 'positive',
        message: 'Candidature proposée !',
      })

      this.$router.push('/democracy/vote')
    },
  },
}
</script>
