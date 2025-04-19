<template lang="pug">
q-card.col-4.shadow-24.row(:style="{minWidth: '400px'}" flat)
  q-toolbar.text-black.bg-primary
    q-icon(name='mdi-minecraft' size='2em')
    q-toolbar-title Authentification Admin&nbsp;
  form(@submit.prevent='submit')
    q-card-section.col.column.items-center.justify-center
      q-input(v-model="formData.username" label="Username" type="text" filled)
      q-input(v-model="formData.password" label="Password" type="password" auto-complete='current-password' filled)
    q-card-actions.column.justify-between
      .col.q-my-sm.flex.items-center
        q-btn(@click.prevent='submit' type='submit' color='primary' size="lg") Se connecter
</template>

<script lang="ts">
export default {
  async setup() {
    definePageMeta({
      layout: 'simple-centered',
      auth: false,
    })
    const $q = useQuasar()
    const pending = ref(false)
    const formData = ref({
      username: '',
      password: '',
    })

    const submit = async () => {
      pending.value = true
      try {
        await useAuth().loginWith('local', {
          body: formData.value,
        })
        $q.notify({
          type: 'positive',
          message: 'Connexion réussie',
        })
        await useRouter().push('/')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erreur de connexion',
        })
      } finally {
        pending.value = false
      }
    }

    return {
      formData,

      pending,
      submit,
    }
  },
}
</script>
