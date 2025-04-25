<template lang="pug">
  q-card.flex.full-width(flat :style="{ flex: 1 }")
    q-card-section(style='position: relative;bottom: 0;top: 0;max-height: 100%; min-width: 288px;')
      q-tabs(v-model="mod" outside-arrows vertical style='max-height: 100%;position: absolute;top:0;bottom: 0;')
        q-tab(v-for='mod in mods' :key="mod.name" :name="mod.name")
          div.flex.row.items-center
            q-avatar.q-mr-sm(square color="secondary" text-color="white" size='25px') {{ getModIcon(mod.name) }}
            q-item-label {{ mod.name }}
            q-badge.q-ml-xs(color='info') {{ mod.count }}

    q-card-section(:style="{ flex: 1 }")
      q-table(
        flat bordered
        title="Articles"
        :rows="search"
        :columns="searchColumns"
        row-key="name"
      )
        template(#header="props")
          q-tr(:props="props")
            q-th(auto-width)
            q-th(v-for="col in props.cols" :key="col.name" :props="props") {{ col.label }}
        template(#body="props")
          q-tr.cursor-pointer(:props="props" @click="props.expand = !props.expand")
            q-td(auto-width)
              q-btn(size="sm" color="accent" square rounded dense @click="props.expand = !props.expand" :icon="props.expand ? 'mdi-minus' : 'mdi-plus'")
            q-td(v-for="col in props.cols" :key="col.name" :props="props")
              div(v-if="col.name === 'icon'")
                q-img(
                  :src="props.row._data.texture"
                  :alt="props.row.name"
                  width="50px"
                  height="50px"
                )
              div(v-else) {{ props.row[col.field] }}
          //- q-tr(colspan='100%')
          //-   pre(v-html="JSON.stringify(props.row.items, null, 2)" :style="{ padding: '10px' }")
          q-tr(v-show="props.expand" :props="props" v-for="item in props.row.items" :key="item.name + item.stack")
            q-td(auto-width)
            q-td(v-for="col in props.cols" :key="col.name" :props="props")
              div(v-if="col.name === 'actions'")
                q-btn(size="sm" color="positive" round dense @click="buyItem(props.row, item)" icon="mdi-cart")
              div(v-else) {{ item[col.field] }}
</template>

<script lang="ts">
export default {
  data() {
    return {
      searchColumns: [
        { name: 'icon', label: 'Icon', align: 'left', field: '_data.texture' },
        { name: 'mod', label: 'Mod', align: 'left', field: 'mod' },
        { name: 'name', label: 'Name', align: 'left', field: 'name' },
        { name: 'stack', label: 'Stack', align: 'center', field: 'stack' },
        { name: 'price', label: 'Price', align: 'center', field: 'price' },
        { name: 'actions', label: 'Actions', align: 'center' },
      ],
    }
  },
  async setup() {
    const mod = computed({
      get: () => {
        return useRoute().query.mod || 'all'
      },
      set: (value) => {
        const $router = useRouter()
        $router.replace({ query: { mod: value } })
      },
    })

    const getUsername = computed(() => {
      const $auth = useAuth()

      return $auth.user?.name
    })

    const {
      data: mods,
      refresh: refreshMods,
      error: errorMods,
    } = await useHttp<any>('/core/article/mods', {
      transform: (result) => {
        return result?.data || []
      },
    })

    const {
      data: search,
      refresh: refreshSearch,
      error: errorSearch,
    } = await useHttp<any>('/core/article/search', {
      query: { mod },
      transform: (result) => {
        return result?.data || []
      },
    })

    const {
      data: average,
      refresh: refreshAverage,
      error: errorAverage,
    } = await useHttp<any>('/core/article/average', {
      query: { mod },
      transform: (result) => {
        return result?.data || []
      },
    })

    return {
      errorMods,
      errorSearch,
      errorAverage,
      mods,
      search,
      average,
      refreshSearch,
      refreshAverage,
      refreshMods,

      getUsername,
      mod,
    }
  },
  methods: {
    async buyItem(row, item) {
      console.log('buyItem', row, item)
      await useHttp<any>(`/core/article/${this.getUsername}/buy/${item.name}`, {
        method: 'POST',
        body: item,
        transform: (result) => {
          return result?.data || []
        },
      })
    },
    getModIcon(mod: string) {
      const names = mod.split('_').slice(0, 2)

      return names
        .map((name) => {
          return name.charAt(0).toUpperCase()
        })
        .join(' ')
    },
  },
}
</script>
