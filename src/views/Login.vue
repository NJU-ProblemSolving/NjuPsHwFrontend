<template>
  <a-row justify="center">
    <a-col
      :xs="24"
      :md="14"
      :lg="10"
      :xl="8"
    >
      <a-card title="登录">
        <a-form :label-col="{ span: 8 }">
          <a-form-item
            label="用户Token"
            :validate-status="tokenStatus"
            :help="tokenHelp"
          >
            <a-input v-model:value="token" />
            <a-button
              type="link"
              @click="resetVisible = true"
            >
              忘记Token？
            </a-button>
          </a-form-item>
          <template v-if="studentId !== ''">
            <a-form-item label="学号">
              <div>{{ studentId }}</div>
            </a-form-item>
            <a-form-item label="姓名">
              <div>{{ studentName }}</div>
            </a-form-item>
            <a-form-item
              v-if="isAdmin === 'false'"
              label="助教"
            >
              <div>{{ reviewerName }}</div>
            </a-form-item>
          </template>
          <a-form-item :wrapper-col="{ offset: 8 }">
            <a-button
              type="primary"
              :loading="loading"
              @click="tryLogin"
            >
              登录
            </a-button>
            <a-button type="link">
              <a href="/signin-oidc">从OJ登录</a>
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
  <a-modal
    v-model:visible="resetVisible"
    title="重置登录 Token"
    :confirm-loading="resetLoading"
    @ok="handleReset"
  >
    <a-form :label-col="{ span: 8 }">
      <a-form-item
        label="学号"
        :help="resetHelp"
      >
        <a-input v-model:value="studentId" />
      </a-form-item>
    </a-form>
    <p>重置后的 Token 将会发送到邮箱中。</p>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { tryLoginByToken, resetToken } from "../DAL";
import { useRoute, useRouter } from "vue-router";
import { localStorageVariable } from "../utils";
import { message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const token = localStorageVariable("token", "");
const tokenStatus = ref("");
const tokenHelp = ref("");
const studentId = localStorageVariable("studentId", "");
const studentName = localStorageVariable("studentName", "");
const isAdmin = localStorageVariable("isAdmin", "false");
const reviewerName = localStorageVariable("reviewerName", "");

const loading = ref(false);

const resetVisible = ref(false);
const resetLoading = ref(false);
const resetHelp = ref("");
const handleReset = async () => {
  resetLoading.value = true;
  try {
    await resetToken(studentId.value);
    resetHelp.value = "";
  } catch (error: any) {
    resetHelp.value = error.message + ": " + (await error.response?.text() ?? "");
  }
  resetLoading.value = false;
};

if (token.value !== '') {
  onMounted(tryLogin)
}

async function tryLogin() {
  try {
    loading.value = true;
    let info = await tryLoginByToken(token.value);
    studentId.value = info.id.toString();
    studentName.value = info.name;
    isAdmin.value = info.isAdmin.toString();
    reviewerName.value = info.reviewerName;
    tokenStatus.value = "";
    tokenHelp.value = "";
    if (route.params['returnIfSuccess'] === '1')
      router.back();
    else
      message.success("登录成功");
  } catch (error: any) {
    studentId.value = "";
    studentName.value = "";
    isAdmin.value = "false";
    if (error.response?.status == 401) {
      tokenStatus.value = "error";
      tokenHelp.value = "Token不存在或已过期";
    } else {
      tokenStatus.value = "error";
      tokenHelp.value = error.message + "  " + (await error.response?.text());
    }
  } finally {
    loading.value = false;
  }
}
</script>
