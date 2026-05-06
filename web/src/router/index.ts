import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import CourseView from "@/views/CourseView.vue";
import HomeView from "@/views/HomeView.vue";
import LeaderboardView from "@/views/LeaderboardView.vue";
import LessonView from "@/views/LessonView.vue";
import ProfileView from "@/views/ProfileView.vue";
import ProgressView from "@/views/ProgressView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: HomeView,
    meta: { showBottomNav: true, bottomTab: "home" },
  },
  {
    path: "/leaderboard",
    component: LeaderboardView,
    meta: { showBottomNav: true, bottomTab: "leaderboard" },
  },
  {
    path: "/profile",
    component: ProfileView,
    meta: { showBottomNav: true, bottomTab: "profile" },
  },
  {
    path: "/progress",
    component: ProgressView,
    meta: { showBottomNav: true, bottomTab: "progress" },
  },
  {
    path: "/courses/:slug",
    component: CourseView,
    meta: { showBottomNav: false },
  },
  {
    path: "/courses/:courseSlug/lessons/:lessonSlug",
    component: LessonView,
    meta: { showBottomNav: false },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
