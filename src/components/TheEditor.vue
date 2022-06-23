<template>
  <div class="flex flex-col flex-grow">
    <div class="flex flex-col flex-grow overflow-auto">
      <editor-content :editor="editor" />
    </div>

    <div class="h-16 bg-gray-100 border-t border-gray-300 text-right">
      <button
        class="bg-none border border-gray-900 rounded py-1 px-4 mr-4 mt-3 hover:bg-gray-900 hover:text-white"
        @click="store.saveNote()"
      >
        Save Note
      </button>
    </div>
  </div>
</template>

<script setup>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useNoteyStore } from "@/stores/notey";

const store = useNoteyStore();
const editor = computed(() => store.editor);

onMounted(() => {
  store.editor = new Editor({
    content: "",
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "prose my-6 mx-auto focus:outline-none",
      },
    },
  });
});

onBeforeUnmount(() => {
  store.destroyEditor();
});
</script>
