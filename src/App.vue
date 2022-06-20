<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div v-if="isOffline" class="absolute top-0 left-0 opacity-75 z-10 w-full text-center py-2 bg-red-300 border-b border-red-700 text-white">
      Sorry, it looks like you're offline.
    </div>

    <div class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100">
      <div class="h-0 overflow-auto flex-grow">
        <div class="flex items-center h-8 px-3 group mt-4">
          <div class="flex items-center flex-grow focus:outline-none">
            <a @click.prevent="showAllNotes" href="#" class="ml-2 leading-none font-medium text-sm">All Notes</a>
          </div>

          <button @click="addNewNote" class="flex items-center justify-center h-6 w-6 ml-1 rounded hover:bg-gray-300">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <a v-for="note in notes" :key="note.created" href="#" @click.prevent="openNote(note)" class="flex items-center h-8 text-sm pl-8 pr-3">
            <span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-grow" v-if="Object.keys(activeNote).length">
      <div class="flex flex-col flex-grow overflow-auto">
        <editor-content :editor="editor" />
      </div>

      <div class="h-16 bg-gray-100 border-t border-gray-300 text-right">
        <button @click="saveNote" class="bg-none border border-gray-900 rounded py-1 px-4 mr-4 mt-3 hover:bg-gray-900 hover:text-white">
          Save Note
        </button>
      </div>
    </div>

    <div v-else class="flex flex-col flex-grow">
      <div class="flex flex-col flex-grow overflow-auto">
        <div v-for="note in notes" :key="note.created">
          <div class="flex px-4 pt-3 pb-4">
            <div class="prose my-2 mx-auto">
              <div class="text-center">
                <span class="ml-1 text-xs text-gray-500">Created on {{ new Date(note.created).toLocaleString() }}</span>
              </div>

              <div v-html="note.content"></div>
            </div>
          </div>
          <hr class="w-full">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import {onMounted, ref} from "vue";

let notes = ref([])
let activeNote = ref({})
let isOffline = ref(!navigator.onLine)

onMounted(() => {
  window.addEventListener('offline', () => {
    isOffline.value = true;
  })
  window.addEventListener('online', () => {
    isOffline.value = false;

    // sync their data with an external API
  })
});

let getDatabase = async () => {
  return new Promise((resolve, reject) => {
    let db = window.indexedDB.open('notes');

    db.onerror = e => {
      reject('Error opening the database.');
    };

    db.onsuccess = e => {
      resolve(e.target.result);
    };

    db.onupgradeneeded = e => {
      if (e.oldVersion === 1) {
        e.target.result.deleteObjectStore('notes')
      }
      e.target.result.createObjectStore('notes', { keyPath: 'created' })
    };
  })
}

let getNotes = async (database) => {
  return new Promise((resolve, reject) => {
    database.transaction('notes').objectStore('notes').getAll().onsuccess = e => {
      resolve(e.target.result)
    }
  });
}

getDatabase().then(async (database) => {
  notes.value = (await getNotes(database)).reverse()
})

const editor = useEditor({
  content: '',
  extensions: [
      StarterKit
  ],
  editorProps: {
    attributes: {
      class: "prose my-6 mx-auto focus:outline-none"
    }
  }
})

let openNote = (note) => {
  editor.value.commands.setContent(note.content);
  activeNote.value = note;
}

let saveNote = async () => {
  return new Promise(async (resolve, reject) => {
    let noteStore = (await getDatabase())
      .transaction('notes', 'readwrite')
      .objectStore('notes');
    let noteRequest = noteStore.get(activeNote.value.created);

    noteRequest.onerror = e => {
      reject('Error saving the note in the database.')
    };

    noteRequest.onsuccess = async e => {
      let note = e.target.result
      note.content = editor.value.getHTML()

      let updateRequest = noteStore.put(note);

      updateRequest.onerror = e => {
        reject('Error storing the updated note in the database.');
      }

      updateRequest.onsuccess = e => {
        let noteIndex = notes.value.findIndex(n => n.created === note.created)
        notes.value[noteIndex] = note
        resolve();
      }
    }
  })
}

let showAllNotes = () => {
  editor.value.commands.clearContent();
  activeNote.value = {};
}

let addNewNote = () => {
  return new Promise(async (resolve, reject) => {
    let transaction = (await getDatabase()).transaction('notes', 'readwrite');

    transaction.oncomplete = e => {
      resolve();
    }

    let now = new Date();
    let note = {
      content: '',
      created: now.getTime()
    }

    notes.value.unshift(note)
    activeNote.value = note
    transaction.objectStore('notes').add(note)
  })
}
</script>
