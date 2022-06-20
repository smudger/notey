<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div v-if="isOffline" class="absolute top-0 left-0 opacity-75 z-10 w-full text-center py-2 bg-red-300 border-b border-red-700 text-white">
      Sorry, it looks like you're offline.
    </div>

    <Sidebar />

    <Editor v-show="Object.keys(activeNote).length" />

    <Notes v-show="!Object.keys(activeNote).length" />

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Notes from './components/Notes';
import {useStore} from "vuex";
import {computed} from "vue";

const store = useStore();
const activeNote = computed(() => store.state.activeNote);
const isOffline = computed(() => store.state.isOffline);

onMounted(() => {
  window.addEventListener('offline', () => {
    store.commit('updateIsOffline', true);
  })
  window.addEventListener('online', () => {
    store.commit('updateIsOffline', false);

    // sync their data with an external API
  })
});
</script>
