import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";
import { createPinia } from "pinia";
import { useNoteyStore } from "@/stores/notey";
import { registerSW } from "virtual:pwa-register";

const pinia = createPinia();

createApp(App).use(pinia).mount("#app");

const store = useNoteyStore();
store.init();

registerSW();
