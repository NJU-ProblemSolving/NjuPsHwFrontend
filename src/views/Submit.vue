<template>
  <a-row>
    <a-col
      span="12"
      offset="6"
      class="main"
    >
      <a-card title="提交作业">
        <a-form
          ref="formRef"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 8 }"
          :model="formState"
          :rules="rules"
        >
          <a-form-item
            label="学号"
            name="studentId"
          >
            <a-input
              v-if="isAdmin === 'true'"
              v-model:value="studentId"
            />
            <div v-else>
              {{ studentId }}
            </div>
          </a-form-item>
          <a-form-item
            label="作业编号"
            name="assignmentId"
          >
            <assignment-selector
              v-model="assignmentId"
              v-model:info="assignmentInfo"
            />
          </a-form-item>
          <a-form-item
            label="截止时间"
            name="deadline"
          >
            <a-tooltip>
              <template #title>
                {{ assignmentInfo.deadline }}
              </template>
              {{ assignmentInfo.deadline ? moment(assignmentInfo.deadline).format('MM-DD HH:mm') : '' }}
            </a-tooltip>
          </a-form-item>
          <a-form-item
            label="作业文件"
            name="fileList"
          >
            <a-upload
              v-model:fileList="fileList"
              :before-upload="() => false"
              @change="fileList = fileList.slice(-1)"
            >
              <a-button>选择文件</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 4 }">
            <a-button
              type="primary"
              :loading="requesting"
              @click="onSubmit"
            >
              提交
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import moment from "moment";
import { reactive, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { AssignmentDto, submitAssignment } from "../DAL";
import { localStorageVariable } from "../utils";
import { Modal, message } from "ant-design-vue";
import AssignmentSelector from '../components/AssignmentSelector.vue'

const router = useRouter();

let studentId = localStorageVariable("studentId", "");
const isAdmin = localStorageVariable("isAdmin", "false");
if (isAdmin.value === "true") studentId = ref(studentId.value);
if (studentId.value === "") {
  const token = localStorageVariable("token", "");
  if(token.value.length==0)
    Modal.error({title: "请先登录",});
  router.push({ name: "Login", params: { returnIfSuccess: '1' } });
}

const assignmentId = ref("");
const assignmentInfo: Ref<AssignmentDto> = ref({id: 0, name: '', deadline: new Date(2022, 1, 1), numberOfProblems: 0});
const requesting = ref(false);

const fileList: Ref<Array<{ originFileObj: File }>> = ref([]);

const formRef = ref();
const formState = reactive({ assignmentId, fileList });
const rules = {
  assignmentId: [{ required: true, message: "请选择提交的作业编号" }],
  fileList: [{ required: true, message: "请上传作业文件" }],
};

const onSubmit = async () => {
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  console.log(assignmentInfo.value)
  if (assignmentInfo.value.deadline) {
    if (new Date() >= assignmentInfo.value.deadline) {
      let ok = await new Promise(res =>
        Modal.confirm({
          title: '确认提交',
          content: '你正在提交一份已经截止的作业，这将会被视为过时补交并扣除一定的分数。确定吗？',
          onOk: () => res(true),
          onCancel: () => res(false),
        })
      );
      if (!ok) {
        return;
      }
    }
  }

  console.log(fileList.value);
  try {
    requesting.value = true;
    await submitAssignment(
      studentId.value,
      assignmentId.value,
      fileList.value[0].originFileObj
    );
    formRef.value.resetFields();
    message.success('提交成功');
    router.push({ name: "Query" });
  } catch (error: any) {
    Modal.error({
      title: error.message,
      content: await error.response?.text() ?? "",
    })
  } finally {
    requesting.value = false;
  }
}
</script>

<style scoped>

</style>
