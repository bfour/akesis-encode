<template>
  <q-page class="column items-center justify-center">
    <q-img
      src="logo.png"
      spinner-color="white"
      style="height: 150px; max-width: 150px"
      aria-label="Akesis Encode logo"
      class="logo"
    />
    <SuggestionsComponent />
  </q-page>
</template>

<script setup lang="ts">
import SuggestionsComponent from 'src/components/SuggestComponent.vue';
defineOptions({
  name: 'IndexPage',
});
</script>

<style>
.logo {
  margin-bottom: 22px;
}
</style>
