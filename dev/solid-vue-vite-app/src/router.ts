import {
  createWebHistory,
  createRouter,
  // createWebHashHistory,
} from "vue-router";
import SolidAuth from "./UseSolidAuth.vue";
import MatchSubject from "./UseMatchSubject.vue";
import LandingPage from "./LandingPage.vue";
import UseResource from "./UseResource.vue";
import UseRootContainerFor from "./UseRootContainerFor.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: LandingPage },
    { path: "/use-solid-auth", component: SolidAuth },
    { path: "/use-match-subject", component: MatchSubject },
    { path: "/use-resource", component: UseResource },
    { path: "/use-root-container-for", component: UseRootContainerFor },
  ],
});
