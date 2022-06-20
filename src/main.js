import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";
import "./registerServiceWorker";
import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      editor: null,
      database: null,
      notes: [],
      activeNote: {},
      isOffline: !navigator.onLine,
    };
  },
  mutations: {
    updateEditor(state, editor) {
      state.editor = editor;
    },

    updateDatabase(state, database) {
      state.database = database;
    },

    updateNotes(state, notes) {
      state.notes = notes;
    },

    updateActiveNote(state, activeNote) {
      state.activeNote = activeNote;
    },

    updateIsOffline(state, isOffline) {
      state.isOffline = isOffline;
    },
  },
  actions: {
    init({ dispatch }) {
      dispatch("initDatabase").then(() => {
        dispatch("initNotes");
      });
    },

    initDatabase({ commit }) {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open("notes");

        db.onerror = (e) => {
          reject("Error opening the database.");
        };

        db.onsuccess = (e) => {
          commit("updateDatabase", e.target.result);
          resolve();
        };

        db.onupgradeneeded = (e) => {
          if (e.oldVersion === 1) {
            e.target.result.deleteObjectStore("notes");
          }
          e.target.result.createObjectStore("notes", { keyPath: "created" });
        };
      });
    },

    initNotes({ commit, state }) {
      state.database
        .transaction("notes")
        .objectStore("notes")
        .getAll().onsuccess = (e) => {
        commit("updateNotes", e.target.result.reverse());
      };
    },

    saveNote({ commit, state }) {
      let noteStore = state.database
        .transaction("notes", "readwrite")
        .objectStore("notes");
      let noteRequest = noteStore.get(state.activeNote.created);

      noteRequest.onerror = (e) => {
        console.error("Error saving the note in the database.");
      };

      noteRequest.onsuccess = async (e) => {
        let note = e.target.result;
        note.content = state.editor.getHTML();

        let updateRequest = noteStore.put(note);

        updateRequest.onerror = (e) => {
          console.error("Error storing the updated note in the database.");
        };

        updateRequest.onsuccess = (e) => {
          let notes = state.notes;
          let noteIndex = notes.findIndex((n) => n.created === note.created);
          notes[noteIndex] = note;

          commit("updateNotes", notes);
        };
      };
    },

    addNewNote({ commit, state }) {
      let transaction = state.database.transaction("notes", "readwrite");

      let now = new Date();
      let note = {
        content: "",
        created: now.getTime(),
      };

      let notes = state.notes;
      notes.unshift(note);
      commit("updateNotes", notes);

      commit("updateActiveNote", note);

      transaction.objectStore("notes").add(note);
    },

    destroyEditor({ commit, state }) {
      state.editor.destroy();
      commit("updateEditor", null);
    },
  },
});

createApp(App).use(store).mount("#app");

store.dispatch("init");
