<template>
  <a-row>
    <a-col span="20" offset="2" class="main">
      <a-card title="作业情况汇总">
        <a-descriptions>
          <a-descriptions-item label="学号">{{
            studentId
          }}</a-descriptions-item>
          <a-descriptions-item label="姓名">{{
            studentName
          }}</a-descriptions-item>
        </a-descriptions>
        <a-table
          :columns="columns"
          :row-key="(record) => record.assignmentId"
          :data-source="summary"
          :pagination="false"
        >
          <template #grade="{ record }">
            {{ GradeDisplayStrings[record.grade] }}
          </template>
          <template #list="{ text }">
            <a-tag v-for="item in text" :key="item" color="blue">
              {{ item }}
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
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getSubmissionSummary, GradeDisplayStrings } from "../DAL";
import { localStorageVariable } from "../utils";

const router = useRouter();

const studentId = localStorageVariable("studentId", "");
const studentName = localStorageVariable("studentName", "");
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
const summary = ref([]);
onMounted(() => {
  getSubmissionSummary(studentId.value).then(
    (value) => (summary.value = value)
  );
});
</script>
