<template lang="pug">
  q-card.fit(flat :style="{ flex: 1 }")
    q-splitter(v-model="splitterModel" style="height: 100%")
      template(#before)
        q-tabs(
          v-model="tab"
          align="justify"
          vertical
        )
          q-tab(name="village" label="Le village" icon="mdi-city")
          q-tab(name="loi" label="Proposer une loi" icon="mdi-file-document-edit")
      template(#after)
        q-tab-panels(
          v-model="tab"
        )
          q-tab-panel(name="village")
            div village
          q-tab-panel(name="loi")
            q-card.fit(flat :style="{ flex: 1 }")
              q-card-section.text-center
                h2.text-h4.q-mb-md.q-mt-none Proposer une loi
                q-input(
                  label="Déposée par"
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
      splitterModel: 20,
      tab: 'village',
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

      try {
        await $http.$post('/core/democracy/law/create', {
          body: {
            title: this.title,
            content: this.content,
            abrogatedLawnums: this.abrogatedLawnums,
            proposedBy: this.proposedBy,
          },
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors de la proposition de loi !',
        })

        return
      }

      this.$q.notify({
        type: 'positive',
        message: 'Votre proposition de loi a été envoyée !',
      })
      this.$router.push('/democracy/vote')
    },
  },
}
</script>
