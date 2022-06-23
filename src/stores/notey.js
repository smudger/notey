import { defineStore } from "pinia";

export const useNoteyStore = defineStore("notey", {
  state: () => ({
    editor: null,
    database: null,
    notes: [],
    activeNote: {},
    isOffline: !navigator.onLine,
  }),
  actions: {
    init() {
      this.initDatabase().then(() => {
        this.initNotes();
      });
    },

    initDatabase() {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open("notes");

        db.onerror = () => {
          reject("Error opening the database.");
        };

        db.onsuccess = (e) => {
          this.database = e.target.result;
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

    initNotes() {
      this.database
        .transaction("notes")
        .objectStore("notes")
        .getAll().onsuccess = (e) => {
        this.notes = e.target.result.reverse();
      };
    },

    saveNote() {
      let noteStore = this.database
        .transaction("notes", "readwrite")
        .objectStore("notes");
      let noteRequest = noteStore.get(this.activeNote.created);

      noteRequest.onerror = () => {
        console.error("Error saving the note in the database.");
      };

      noteRequest.onsuccess = async (e) => {
        let note = e.target.result;
        note.content = this.editor.getHTML();

        let updateRequest = noteStore.put(note);

        updateRequest.onerror = () => {
          console.error("Error storing the updated note in the database.");
        };

        updateRequest.onsuccess = () => {
          let notes = this.notes;
          let noteIndex = notes.findIndex((n) => n.created === note.created);
          notes[noteIndex] = note;

          this.notes = notes;
        };
      };
    },

    addNewNote() {
      let transaction = this.database.transaction("notes", "readwrite");

      let now = new Date();
      let note = {
        content: "",
        created: now.getTime(),
      };

      let notes = this.notes;
      notes.unshift(note);
      this.notes = notes;

      this.openNote(note);

      transaction.objectStore("notes").add(note);
    },

    openNote(note) {
      this.editor.commands.setContent(note.content);
      this.activeNote = note;
    },

    destroyEditor() {
      this.editor.destroy();
      this.editor = null;
    },
  },
});
