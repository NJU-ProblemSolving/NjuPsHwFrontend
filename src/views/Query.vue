<template>
  <a-row>
    <a-col
      span="20"
      offset="2"
      class="main"
    >
      <a-card title="作业情况汇总">
        <a-descriptions>
          <a-descriptions-item label="学号">
            <a-input
              v-if="isAdmin === 'true'"
              v-model:value="studentId"
            />
            <p v-else>
              {{ studentId }}
            </p>
          </a-descriptions-item>
        </a-descriptions>
        <a-table
          :columns="columns"
          row-key="assignmentId"
          :data-source="summary"
          :pagination="false"
        >
          <template #time="{ record }">
            <a-tooltip>
              <template #title>
                {{ record.submittedAt }}
              </template>
              {{ moment(record.submittedAt).format('MM-DD HH:mm') }}
            </a-tooltip>
          </template>
          <template #grade="{ record }">
            {{ GradeDisplayStrings[record.grade] }}
          </template>
          <template #list="{ text }">
            <a-tag
              v-for="item in text"
              :key="item"
              :color="hasCorrected.has(item.display) ? 'green' : 'blue'"
            >
              {{ item.display }}
            </a-tag>
          </template>
        </a-table>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import moment from "moment";
import { Modal } from "ant-design-vue";
import { onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getSubmissionSummary,
  GradeDisplayStrings,
  SubmissionDto,
} from "../DAL";
import { localStorageVariable } from "../utils";

const router = useRouter();

let studentId = localStorageVariable("studentId", "");
const isAdmin = localStorageVariable("isAdmin", "false");
if (isAdmin.value === "true") studentId = ref(studentId.value);
if (studentId.value === "") router.push({ name: "Login", params: { returnIfSuccess: '1' } });

const columns = [
  {
    title: "作业",
    dataIndex: "assignmentName",
  },
  {
    title: "提交时间",
    dataIndex: "submittedAt",
    slots: { customRender: "time" },
  },
  {
    title: "评分",
    dataIndex: "grade",
    slots: { customRender: "grade" },
  },
  {
    title: "需要订正",
    dataIndex: "needCorrection",
    slots: { customRender: "list" },
  },
  {
    title: "接受的订正",
    dataIndex: "hasCorrected",
    slots: { customRender: "list" },
  },
  {
    title: "评语",
    dataIndex: "comment",
  },
];

const summary: Ref<SubmissionDto[]> = ref([]);
const hasCorrected = new Set<string>();

async function query() {
  try {
    let res = await getSubmissionSummary(studentId.value);
    res.flatMap(x => x.hasCorrected).forEach(x => hasCorrected.add(x.display));
    summary.value = res;
  } catch (error: any) {
    console.error(error)
    if (error.response?.status == 401) {
      router.push({ name: "Login", params: { returnIfSuccess: '1' } });
    } else if (error.response?.status === 403) {
      Modal.error({
        title: error.message,
        content: "需要管理员权限",
      });
    } else {
      Modal.error({
        title: "出现意外的错误：" + error.message,
        content: await error.response?.text() ?? "",
      });
    }
  }
}

onMounted(query);

watch(studentId, query)
</script>

<style scoped>
</style>
