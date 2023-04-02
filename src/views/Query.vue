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
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'assignmentName'">
              <span>
                {{ record.assignmentName }}
                <a-button
                  type="text"
                  size="small"
                  @click="() => downloadAttachments(record.assignmentId)"
                >
                  <template #icon><download-outlined /></template>
                </a-button>
              </span>
            </template>
            <template v-else-if="column.key === 'submittedAt'">
              <a-tooltip>
                <template #title>
                  {{ record.submittedAt }}
                </template>
                {{ moment(record.submittedAt).format('MM-DD HH:mm') }}
              </a-tooltip>
            </template>
            <template v-else-if="column.key === 'grade'">
              {{ GradeDisplayStrings[record.grade] }}
            </template>
            <template v-else-if="column.key === 'needCorrection' || column.key === 'hasCorrected'">
              <a-tag
                v-for="item in text"
                :key="item"
                :color="hasCorrected.has(item.display) ? 'green' : 'blue'"
              >
                {{ item.display }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import moment from "moment";
import { Modal } from "ant-design-vue";
import { DownloadOutlined } from "@ant-design/icons-vue";
import { onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getSubmissionSummary,
  getAttachmentsUrl,
  GradeDisplayStrings,
  SubmissionDto,
} from "../DAL";
import { localStorageVariable, invokeDownload } from "../utils";

const router = useRouter();

let studentId = localStorageVariable("studentId", "");
const isAdmin = localStorageVariable("isAdmin", "false");
if (isAdmin.value === "true") studentId = ref(studentId.value);
if (studentId.value === "") router.push({ name: "Login", params: { returnIfSuccess: '1' } });

const columns = [
  {
    title: "作业",
    dataIndex: "assignmentName",
    key: 'assignmentName',
  },
  {
    title: "提交时间",
    dataIndex: "submittedAt",
    key: 'submittedAt',
  },
  {
    title: "评分",
    dataIndex: "grade",
    key: 'grade',
  },
  {
    title: "需要订正",
    dataIndex: "needCorrection",
    key: 'needCorrection',
  },
  {
    title: "接受的订正",
    dataIndex: "hasCorrected",
    key: 'hasCorrected',
  },
  {
    title: "评语",
    dataIndex: "comment",
    key: 'comment',
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

async function downloadAttachments(assignmentId: string) {
  invokeDownload(
    await getAttachmentsUrl(studentId.value, assignmentId)
  );
}

onMounted(query);

watch(studentId, query)
</script>

<style scoped>
</style>
