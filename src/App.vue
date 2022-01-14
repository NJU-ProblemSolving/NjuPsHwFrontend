<template>
  <a-layout>
    <a-layout-header class="header">
      <div class="title">问题求解作业平台</div>
      <a-menu theme="dark" mode="horizontal">
        <a-menu-item key="1" @click="router.push('/')">提交</a-menu-item>
        <a-menu-item key="2" @click="router.push('/Review')">查询</a-menu-item>
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
.title {
  color: whitesmoke;
  font-size: 1.25rem;
  margin: 0 1rem;
  float: left;
}
.content {
  padding: 20px 50px;
}
#app {
  text-align: center;
  vertical-align: middle;
}
</style>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>
