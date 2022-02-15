<template>
  <a-row>
    <a-col span="20" offset="2" class="main">
      <a-card title="作业情况汇总">
        <a-descriptions>
          <a-descriptions-item label="学号">
            <a-input
              v-if="isAdmin === 'true'"
              v-model:value="studentId"
            ></a-input>
            <p v-else>{{ studentId }}</p>
          </a-descriptions-item>
        </a-descriptions>
        <a-table
          :columns="columns"
          row-key="assignmentId"
          :data-source="summary"
          :pagination="false"
        >
          <template #grade="{ record }">
            {{ GradeDisplayStrings[record.grade] }}
          </template>
          <template #list="{ text }">
            <a-tag v-for="item in text" :key="item" color="blue">
              {{ item.display }}
            </a-tag>
          </template>
        </a-table>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getSubmissionSummary,
  GradeDisplayStrings,
  StudentSubmissionSummary,
} from "../DAL";
import { localStorageVariable } from "../utils";

const router = useRouter();

let studentId = localStorageVariable("studentId", "");
const isAdmin = localStorageVariable("isAdmin", "false");
if (isAdmin.value === "true") studentId = ref(studentId.value);
if (studentId.value === "") router.push("/login");

const columns = [
  {
    title: "作业",
    dataIndex: "assignmentId",
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
const summary: Ref<StudentSubmissionSummary[]> = ref([]);

onMounted(() => {
  getSubmissionSummary(studentId.value).then((value) => {
    summary.value = value;
  });
});

watch(studentId, () => {
  getSubmissionSummary(studentId.value).then((value) => {
    summary.value = value;
  });
})
</script>
