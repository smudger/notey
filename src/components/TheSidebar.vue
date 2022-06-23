<template>
  <div
    class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100"
  >
    <div class="h-0 overflow-auto flex-grow">
      <div class="flex items-center h-8 px-3 group mt-4">
        <div class="flex items-center flex-grow focus:outline-none">
          <a
            href="#"
            class="ml-2 leading-none font-medium text-sm"
            @click.prevent="showAllNotes"
            >All Notes</a
          >
        </div>

        <button
          aria-label="Add New Note"
          class="flex items-center justify-center h-6 w-6 ml-1 rounded hover:bg-gray-300"
          @click="store.addNewNote()"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>

      <div class="mt-4">
        <a
          v-for="note in notes"
          :key="note.created"
          href="#"
          class="flex items-center h-8 text-sm pl-8 pr-3"
          @click.prevent="store.openNote(note)"
        >
          <span class="ml-2 leading-none">{{
            new Date(note.created).toLocaleString()
          }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useNoteyStore } from "@/stores/notey";

const store = useNoteyStore();
const notes = computed(() => store.notes);

let showAllNotes = () => {
  store.editor.commands.clearContent();
  store.activeNote = {};
};
</script>
