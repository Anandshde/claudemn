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
import AdminLoginView from "@/views/admin/AdminLoginView.vue";
import AdminDashboardView from "@/views/admin/AdminDashboardView.vue";
import AdminCourseView from "@/views/admin/AdminCourseView.vue";
import AdminLessonEditView from "@/views/admin/AdminLessonEditView.vue";
import { getToken, ADMIN_UNAUTHED_EVENT } from "@/admin/auth";

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
  {
    path: "/admin/login",
    component: AdminLoginView,
    meta: { showBottomNav: false },
  },
  {
    path: "/admin",
    component: AdminDashboardView,
    meta: { showBottomNav: false, requiresAdmin: true },
  },
  {
    path: "/admin/courses/:slug",
    component: AdminCourseView,
    meta: { showBottomNav: false, requiresAdmin: true },
  },
  {
    path: "/admin/courses/:slug/lessons/:lessonSlug",
    component: AdminLessonEditView,
    meta: { showBottomNav: false, requiresAdmin: true },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !getToken()) {
    return { path: "/admin/login", query: { next: to.fullPath } };
  }
});

// Global redirect-to-login when an admin call returns 401.
if (typeof window !== "undefined") {
  window.addEventListener(ADMIN_UNAUTHED_EVENT, () => {
    if (router.currentRoute.value.path.startsWith("/admin")) {
      router.push({
        path: "/admin/login",
        query: { next: router.currentRoute.value.fullPath },
      });
    }
  });
}
