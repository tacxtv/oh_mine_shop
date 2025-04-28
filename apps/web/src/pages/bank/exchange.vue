<template lang="pug">
  q-card(flat :style="{ flex: 1 }")
    .fit.flex
      .flex.justify-center.items-center.column.q-ma-md(:style='{flex: 1}')
        q-select.full-width(filled)
      .flex.justify-center.items-center.column.q-ma-md(:style='{flex: 1}')
        q-input.full-width(
          filled
        )
          template(#append)
            q-icon(name='mdi-cash')
      .flex.justify-center.items-center.column.q-ma-md(:style='{flex: 1}')
        q-select.full-width(filled)
</template>

<script lang="ts"></script>
