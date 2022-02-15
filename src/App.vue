<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="title">问题求解作业平台</div>
      <a-menu theme="dark" mode="horizontal">
        <a-menu-item key="0" @click="router.push('/login')">登录</a-menu-item>
        <a-menu-item key="1" @click="router.push('/submit')">提交</a-menu-item>
        <a-menu-item key="2" @click="router.push('/query')">查询</a-menu-item>
        <a-menu-item
          key="3"
          v-if="isAdmin === 'true'"
          @click="router.push('/review')"
          >评阅</a-menu-item
        >
      </a-menu>
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      21级问题求解助教团队
    </a-layout-footer>
  </a-layout>
</template>

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

<script setup lang="ts">
import { useRouter } from "vue-router";
import { localStorageVariable } from "./utils";
const router = useRouter();
const isAdmin = localStorageVariable("isAdmin", "false");
</script>
