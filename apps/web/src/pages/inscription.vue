<template lang="pug">
q-card.col-4.shadow-24.row(:style="{minWidth: '400px'}" flat)
  q-toolbar.text-black.bg-primary
    q-icon(name='mdi-minecraft' size='2em')
    q-toolbar-title Inscription à Miratopia&nbsp;
  q-card-section.col.column.items-center.justify-center
    p Bienvenue sur Miratopia, tu es sur le point de créer un compte et de t'inscrire sur le serveur Minecraft Miratopia.
    p Dans cette saison, les aventuriers sont appelés à coloniser de nouvelles terres et à en découvrir les mystères. Un tout nouvel univers à explorer t'attend, avec des défis uniques à relever.
    p Au programme :
      ul
        li Un nouveau monde à explorer, riche en secrets et surprises.
        li Des quêtes variées, avec narration, objectifs, et récompenses.
        li Une économie en jeu pour acheter et vendre entre joueurs.
        li Des récompenses exclusives à débloquer.
        li Un défi chaque semaines pour plus de compétitivité.
        li Des événements chaque week-end, funs, compétitifs, et variés.

    p Le serveur propose également un village semi-RP, avec des rôles à incarner et un système de lois votées par la communauté, tout en laissant de la place pour les joueurs préférant un gameplay plus libre et relax.
    p Rejoins une communauté active et bienveillante, et découvre un serveur qui évolue chaque semaine avec du contenu inédit.
    br
    b.text-center Ouverture le 25 avril 2025.
  q-toolbar
    q-space
    q-btn(href='/login' label="S'inscrire" color='positive')
</template>

<script lang="ts">
export default {
  name: 'Inscription',
  setup() {
    definePageMeta({
      layout: 'simple-centered',
      auth: false,
    })
  },
}
</script>
