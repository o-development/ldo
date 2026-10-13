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
    { path: "", component: LandingPage },
    { path: "/use-solid-auth", component: SolidAuth },
    { path: "/use-match-subject", component: MatchSubject },
    { path: "/use-resource", component: UseResource },
    { path: "/use-root-container-for", component: UseRootContainerFor },
  ],
});

// // Log BEFORE any navigation starts
// router.beforeEach((to, from, next) => {
//   console.log(`[Router] Attempting move: ${from.fullPath} ➡️ ${to.fullPath}`);
//   console.log("[Router] Target Route Specs:", to);
//   next(); // Don't forget to call next()!
// });

// // Log AFTER a navigation finishes successfully
// router.afterEach((to, from) => {
//   console.log(`[Router] Navigation Completed successfully to: ${to.fullPath}`);
// });

// // Log if something CRASHES or gets rejected during routing
// router.onError((error) => {
//   console.error("[Router] Error occurred during routing:", error);
// });
