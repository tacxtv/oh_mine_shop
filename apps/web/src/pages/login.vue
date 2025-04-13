<template lang="pug">
q-card.col-4.shadow-24.row(:style="{minWidth: '400px'}" flat)
  q-toolbar.text-black(:class="{ 'bg-primary': !hasError, 'bg-negative': hasError }")
    q-icon(name='mdi-minecraft' size='2em')
    q-toolbar-title
      | Authentification Minecraft&nbsp;
      small(v-if='hasError') (en erreur)
  q-card-section.col.column.items-center.justify-center(v-if='hasError')
    q-icon(name='mdi-alert-circle' size='72px')
    h5.q-mt-md.q-mb-none.text-center Erreur lors de l'authentification
    pre.q-mt-md.q-mb-none.text-center(v-if='hasError' v-text='errorText')

  q-card-section.col.column.items-center.justify-center(v-else :style="{minHeight: '250px'}")
    q-spinner(size='96px')
    h5.q-mt-md.q-mb-none.text-center Redirection vers la page d'authentification...

  q-toolbar
    q-space
    q-btn(:href='hasError ? "/login" : "/"' :label='hasError ? "Retour" : "Accueil"' :color='hasError ? "negative" : "primary"' :class="{ 'text-black': !hasError }")
</template>

<script lang="ts">
import { FetchError } from 'ofetch'

export default {
  async setup() {
    definePageMeta({
      layout: 'simple-centered',
      auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
      },
    })

    const q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const auth = useAuth()

    const hasError = ref(false)
    const errorText = ref('')

    if (!route.query.code) {
      window.location.href = '/api/core/auth/minecraft'
      return
    }

    try {
      await auth.loginWith('local', {
        redirect: 'manual',
        body: { ...route.query },
      })
    } catch (error) {
      hasError.value = true
      errorText.value = (error as Error).message

      if (error instanceof FetchError) {
        errorText.value = error.response?._data?.message || error.message

        if (error!.response!.status >= 500) {
          await router.push('/login')
          router.go(0)

          return
        }
      }

      q.notify({
        type: 'negative',
        message: `Erreur de connexion - ${errorText.value}`,
      })
    }

    return {
      hasError,
      errorText,

      q,
      route,
      router,
      auth,
    }
  },
}
</script>
