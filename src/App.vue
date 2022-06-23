<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div
      v-if="isOffline"
      class="absolute top-0 left-0 opacity-75 z-10 w-full text-center py-2 bg-red-300 border-b border-red-700 text-white"
    >
      Sorry, it looks like you're offline.
    </div>

    <TheSidebar />

    <TheEditor v-show="Object.keys(activeNote).length" />

    <TheNotes v-show="!Object.keys(activeNote).length" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import TheSidebar from "@/components/TheSidebar.vue";
import TheEditor from "@/components/TheEditor.vue";
import TheNotes from "@/components/TheNotes.vue";
import { computed } from "vue";
import { useNoteyStore } from "@/stores/notey";

const store = useNoteyStore();
const activeNote = computed(() => store.activeNote);
const isOffline = computed(() => store.isOffline);

onMounted(() => {
  window.addEventListener("offline", () => {
    store.isOffline = true;
  });
  window.addEventListener("online", () => {
    store.isOffline = false;

    // sync their data with an external API
  });
});
</script>
