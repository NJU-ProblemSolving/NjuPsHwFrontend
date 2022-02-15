<template>
  <a-row>
    <a-col span="6" class="main">
      <a-card title="登录">
        <a-form :labelCol="{ span: 8 }">
          <a-form-item
            label="用户Token"
            :validateStatus="status"
            :help="statusInfo"
          >
            <a-input v-model:value="token"></a-input>
          </a-form-item>
          <template v-if="studentId !== ''">
            <a-form-item label="学号">
              <div>{{ studentId }}</div>
            </a-form-item>
            <a-form-item label="姓名">
              <div>{{ studentName }}</div>
            </a-form-item>
            <a-form-item label="管理员">
              <div>{{ isAdmin }}</div>
            </a-form-item>
          </template>
          <a-form-item :wrapperCol="{ offset: 8 }">
            <a-button type="primary" @click="tryLogin">登录</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
.main {
  position: absolute;
  margin: auto;
  top: 50%;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(-50%);
}
</style>

<script setup lang="ts">
import { ref } from "vue";
import { tryLoginByToken } from "../DAL";
import { localStorageVariable } from "../utils";

const token = localStorageVariable("token", "");
const status = ref("");
const statusInfo = ref("");
const studentId = localStorageVariable("studentId", "");
const studentName = localStorageVariable("studentName", "");
const isAdmin = localStorageVariable("isAdmin", "false");

async function tryLogin() {
  try {
    let info = await tryLoginByToken(token.value);
    studentId.value = info.id.toString();
    studentName.value = info.name;
    isAdmin.value = info.isAdmin.toString();
    status.value = "";
    statusInfo.value = "";
  } catch (e: any) {
    if (e.response?.status == 401) {
      status.value = "error";
      statusInfo.value = "Token不存在或已过期";
    } else {
      status.value = "error";
      statusInfo.value = e.message;
      console.error(e);
    }
  }
}
</script>
