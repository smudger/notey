<template>
  <div class="flex flex-col flex-grow">
    <div class="flex flex-col flex-grow overflow-auto">
      <editor-content class="flex h-full" :editor="editor" />
    </div>
  </div>
</template>

<script setup>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useNoteyStore } from "@/stores/notey";
import throttle from 'lodash.throttle';

const store = useNoteyStore();
const editor = computed(() => store.editor);

onMounted(() => {
  store.editor = new Editor({
    onUpdate: throttle(store.saveNote, 200),
    content: "",
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "flex-1 prose py-6 mx-auto focus:outline-none",
      },
    },
  });
});

onBeforeUnmount(() => {
  store.destroyEditor();
});
</script>
