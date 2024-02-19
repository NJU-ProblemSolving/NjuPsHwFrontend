<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="title">
        问题求解作业平台
      </div>
      <a-menu
        theme="dark"
        mode="horizontal"
      >
        <a-menu-item
          key="0"
          @click="router.push('/login')"
        >
          登录
        </a-menu-item>
        <a-menu-item
          key="1"
          @click="router.push('/submit')"
        >
          提交
        </a-menu-item>
        <a-menu-item
          key="2"
          @click="router.push('/query')"
        >
          查询
        </a-menu-item>
        <a-menu-item
          v-if="isAdmin === 'true'"
          key="3"
          @click="router.push('/review')"
        >
          评阅
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      <p>22级问题求解助教团队</p>
      <a-space :size="20">
        <span>Client: {{ clientVersion }}</span>
        <span>Server: {{ serverVersion }}</span>
      </a-space>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { localStorageVariable } from "./utils";
import { clientVersion } from "./config";
import { getServerVersion } from "./DAL";
const router = useRouter();
const isAdmin = localStorageVariable("isAdmin", "false");
const serverVersion = ref("");

getServerVersion().then(x => serverVersion.value = x);
</script>

<style>
.layout {
  min-height: 100vh;
}
.title {
  color: whitesmoke;
  font-size: 1.25rem;
  margin: 0 1rem;
  float: left;
}
.content {
  padding: 20px 50px;
}
</style>
