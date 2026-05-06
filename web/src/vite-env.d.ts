/// <reference types="vite/client" />

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    showBottomNav?: boolean;
    bottomTab?: "home" | "leaderboard" | "profile" | "progress";
  }
}
