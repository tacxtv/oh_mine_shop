<template lang="pug">
q-drawer.q-pb-md.q-pl-md(
  v-model='drawer'
  side='left' :mini='true' :breakpoint='0' :mini-width='72'
  :style="{background: $q.dark.isActive ? 'var(--q-dark-page) !important' : ''}"
  persistent
)
  q-card.full-height.bg-transparent(flat)
    .row.no-wrap.column.full-height
      q-card.bg-secondary.full-height.overflow-y-auto.flex.column.q-custom-mini-scrollbar(flat style='flex-flow: column; overflow-x: hidden;')
        q-list(dark)
          q-item.rounded-borders.text-white(v-for="item in main" clickable v-ripple :to="item.to" :key="item.name" active-class="text-primary")
            q-item-section(avatar)
              q-icon(:name="item.icon || 'mdi-square-rounded'")
            q-tooltip.text-body2(anchor="center left" self="center right") {{ item.name }}
        q-space
        q-separator
        q-list(dark)
          q-item.rounded-borders.text-white(v-for="item in bottom" clickable v-ripple :to="item.to" :key="item.name" active-class="text-primary")
            q-item-section(avatar)
              q-icon(:name="item.icon || 'mdi-square-rounded'")
            q-tooltip.text-body2(anchor="center left" self="center right") {{ item.name }}
</template>

<script lang="ts">
export default {
  name: 'LayoutDefaultDrawerComponent',
  data() {
    return {
      main: [
        { name: 'Accueil', to: '/', icon: 'mdi-view-dashboard' },
        { name: 'Banque', to: '/bank', icon: 'mdi-bank' },
        // { name: 'Hôtel de ventes', to: '/store', icon: 'mdi-store' },
        // { name: 'Défis de la semaine', to: '/defi/upload', icon: 'mdi-bullseye-arrow' },
      ],
      bottom: [
        // { name: 'Inventaire', to: '/inventory', icon: 'mdi-archive' }
      ],
    }
  },
  setup() {
    const drawer = inject('drawer')

    return { drawer }
  },
}
</script>
