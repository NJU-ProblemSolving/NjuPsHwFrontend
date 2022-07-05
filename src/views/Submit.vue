<template>
  <a-row>
    <a-col span="12" offset="6" class="main">
      <a-card title="提交作业">
        <a-form ref="formRef" :labelCol="{ span: 4 }" :wrapperCol="{ span: 8 }" :model="formState" :rules="rules">
          <a-form-item label="学号" name="studentId">
            <a-input v-if="isAdmin === 'true'" v-model:value="studentId"></a-input>
            <p v-else>{{ studentId }}</p>
          </a-form-item>
          <a-form-item label="作业编号" name="assignmentId">
            <assignment-selector v-model="assignmentId"></assignment-selector>
          </a-form-item>
          <a-form-item label="作业文件" name="fileList">
            <a-upload v-model:fileList="fileList" :beforeUpload="() => false" @change="fileList = fileList.slice(-1)">
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
import { reactive, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { submitAssignment } from "../DAL";
import { localStorageVariable } from "../utils";
import { Modal } from "ant-design-vue";
import AssignmentSelector from '../components/AssignmentSelector.vue'

const router = useRouter();

let studentId = localStorageVariable("studentId", "");
const studentName = localStorageVariable("studentName", "");
const isAdmin = localStorageVariable("isAdmin", "false");
if (isAdmin.value === "true") studentId = ref(studentId.value);
if (studentId.value === "") router.push("/login");

const assignmentId = ref("");

const fileList: Ref<Array<{ originFileObj: File }>> = ref([]);

const formRef = ref();
const formState = reactive({ assignmentId, fileList });
const rules = {
  assignmentId: [{ required: true, message: "请选择提交的作业编号" }],
  fileList: [{ required: true, message: "请上传作业文件" }],
};

const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      console.log(fileList.value);
      submitAssignment(
        studentId.value,
        assignmentId.value,
        fileList.value[0].originFileObj
      ).catch((err) => {
        console.log(err)
        Modal.error({
          title: () => err.message,
          content: () => err.data ?? "",
        })
      }
      );
      formRef.value.resetFields();
    })
    .catch(() => { });
}
</script>
