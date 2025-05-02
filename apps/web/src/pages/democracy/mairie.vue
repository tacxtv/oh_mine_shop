<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    q-card-section.text-center
      h2.text-h4.q-mb-md.q-mt-none Proposer une loi
      q-input(
        label="Nom du maire"
        :model-value="proposedBy"
        readonly
        filled
      )
      q-input(
        label="Titre de la loi"
        v-model="title"
        filled
      )
      q-select(
        label="Numéro de(s) loi abrogée"
        v-model='abrogatedLawnums'
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
      small.text-negative.q-mr-sm ATTENTION : Vous ne pourrez pas modifier votre loi une fois proposée
      q-btn(
        label="Proposer"
        color="primary"
        @click="proposal"
        :disable="!content"
      )
</template>

<script lang="ts">
export default {
  data() {
    return {
      title: '',
      content: '',
    }
  },
  computed: {
    proposedBy() {
      const $auth = useAuth()

      return $auth.user?.name
    },
  },
  async setup() {
    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const {
      data: abrogatedLawnums,
      refresh,
      error,
    } = await useHttp<any>('/core/democracy/law/unabbrogated/', {
      transform: (result) => {
        return result?.data || {}
      },
    })

    return {
      error,
      abrogatedLawnums,
      refresh,

      getUsername,
    }
  },
  methods: {
    async proposal() {
      if (!this.content) {
        this.$q.notify({
          type: 'negative',
          message: 'Vous devez proposer une loi !',
        })

        return
      }

      const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)

      try {
        await $http.$post('/core/democracy/law/' + currentWeekNumber + '/' + this.proposedBy + '/create', {
          body: {
            title: this.title,
            content: this.content,
            abrogatedLawnums: this.abrogatedLawnums,
          },
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors de la proposition de loi !',
        })

        return
      }
    },
  },
}
</script>
