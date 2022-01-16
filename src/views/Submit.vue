<template>
  <a-row>
    <a-col span="12" offset="6" class="main">
      <a-card title="提交作业">
        <a-form
          ref="formRef"
          :labelCol="{ span: 4 }"
          :wrapperCol="{ span: 8 }"
          :model="formState"
          :rules="rules"
        >
          <a-form-item label="学号" name="studentId">
            {{ studentId }}
          </a-form-item>
          <a-form-item label="作业编号" name="assignmentId">
            <a-select
              v-model:value="assignmentId"
              :options="assignmentOptions"
              :loading="assignmentLoading"
            ></a-select>
          </a-form-item>
          <a-form-item label="作业文件" name="fileList">
            <a-upload v-model:fileList="fileList" :beforeUpload="() => false">
              <a-button>选择文件</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item :wrapperCol="{ offset: 4 }">
            <a-button type="primary" @click="onSubmit">提交</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getAssignmentList, submitAssignment } from "../DAL";
import { localStorageVariable } from "../utils";
import { Modal } from "ant-design-vue";

const router = useRouter();

const studentId = localStorageVariable("studentId", "");
const studentName = localStorageVariable("studentName", "");
if (studentId.value === "") router.push("/login");

const assignmentId = ref("");
const assignmentLoading = ref(true);
const assignmentOptions = ref([]);

onMounted(() =>
  getAssignmentList().then((list) => {
    assignmentLoading.value = false;
    assignmentOptions.value = list.map((x) => ({ value: x.id }));
  })
);

const fileList = ref([]);

const formRef = ref();
const formState = reactive({ assignmentId, fileList });
const rules = {
  assignmentId: [{ required: true, message: "请选择提交的作业编号" }],
  fileList: [{ required: true, message: "请上传作业文件" }],
};

function onSubmit() {
  console.log("hhh");
  formRef.value
    .validate()
    .then(() => {
      submitAssignment(
        studentId.value,
        assignmentId.value,
        fileList.value[0].originFileObj
      ).catch((err) =>
        Modal.error({
          title: () => err.message,
          content: () => err.data ?? "",
        })
      );
      formRef.value.resetFields();
    })
    .catch(() => {});
}
</script>
