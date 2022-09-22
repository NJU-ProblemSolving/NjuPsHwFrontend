<template>
  <div>
    <a-row>
      <a-col span="12">
        <a-form
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 6 }"
        >
          <a-form-item label="评阅人">
            <a-select
              v-model:value="reviewerId"
              :options="reviewerOptions"
              :disabled="requesting"
            />
          </a-form-item>
          <a-form-item label="作业">
            <assignment-selector
              v-model="assignmentId"
              v-model:name="assignmentName"
              :disabled="requesting"
            />
          </a-form-item>
        </a-form>
      </a-col>
      <a-col span="12">
        <a-button
          type="primary"
          @click="downloadReview"
        >
          下载作业压缩包
        </a-button>
      </a-col>
    </a-row>

    <a-table
      v-show="dataSource.length > 0"
      :columns="columns"
      :data-source="dataSource"
      row-key="studentId"
      expended-row-key="studentId"
    >
      <template #grade="{ record }">
        <a-select
          v-model:value="record.grade"
          style="width: 60px"
          :options="gradeOptions"
        />
      </template>
      <template #needCorrection="{ record }">
        <object-selector
          v-model="record.needCorrection"
          :list="needCorrectionList"
          :name-selector="(x: MistakeDto) => x.display"
          :equal-comparer="problemEquals"
          style="width: 100%;"
        />
      </template>
      <template #hasCorrected="{ record }">
        <object-selector
          v-model="record.hasCorrected"
          :list="uniqueProblemList((mistakes[record.studentId] ?? []).concat(record.hasCorrected))"
          :name-selector="(x: MistakeDto) => x.display"
          :equal-comparer="problemEquals"
          style="width: 100%;"
        />
      </template>
      <template #expandedRowRender="{ record }">
        <a-row
          type="flex"
          justify="space-around"
        >
          <a-col
            span="11"
            sm="24"
          >
            <a-input
              v-model:value="record.comment"
              addon-before="额外评语"
            />
          </a-col>
          <a-col
            span="11"
            sm="24"
          >
            <a-input
              v-model:value="record.track"
              addon-before="跟踪评价"
            />
          </a-col>
        </a-row>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, reactive, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { debounce, invokeDownload, localStorageVariable, Lock } from "../utils";
import {
  getMistakes,
  getReview,
  updateReview,
  getReviewArchieveUrl,
  ReviewInfoDto,
  GradeDisplayStrings,
  MistakeDto,
  reviewers,
} from "../DAL";
import AssignmentSelector from "../components/AssignmentSelector.vue";
import ObjectSelector from "../components/ObjectSelector.vue";
import { Modal } from "ant-design-vue";

const router = useRouter();

const requesting = ref(false);
const reqLock = new Lock();
const MyRequestWrapper = async <T>(
  func: () => Promise<T>
): Promise<T | undefined> => {
  try {
    await reqLock.lock();
    requesting.value = true;
    return await func();
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
        title: "出现意外的错误，建议刷新页面与服务器重新同步",
        content: await error.response?.text() ?? "",
      });
    }
  } finally {
    requesting.value = false;
    reqLock.unlock();
  }
};

const reviewerId = localStorageVariable("reviewerId", "1");
const reviewerOptions = reviewers.map(x => ({ value: x.id, label: x.name }));

const assignmentId = localStorageVariable("assignmentId", "");
const assignmentName = ref('')

const mistakes: { [key: number]: Array<MistakeDto> } = reactive({});

onMounted(() =>
  MyRequestWrapper(async () => {
    let req = [
      getMistakes().then((list) =>
        list.forEach((x) => (mistakes[x.studentId] = x.mistakes))
      ),
    ];
    if (assignmentId.value != "") {
      req.push(fetchReview());
    }
    await Promise.all(req);
  })
);

watch(reviewerId, () => MyRequestWrapper(fetchReview));
watch(assignmentId, () => MyRequestWrapper(fetchReview));

const columns = [
  {
    title: "学号",
    dataIndex: "studentId",
    key: "studentId",
  },
  {
    title: "姓名",
    dataIndex: "studentName",
    key: "studentName",
  },
  {
    title: "评分",
    dataIndex: "grade",
    key: "grade",
    slots: { customRender: "grade" },
  },
  {
    title: "需订正",
    dataIndex: "needCorrection",
    key: "needCorrection",
    slots: { customRender: "needCorrection" },
  },
  {
    title: "已订正",
    dataIndex: "hasCorrected",
    key: "hasCorrected",
    slots: { customRender: "hasCorrected" },
  },
];

const gradeOptions = GradeDisplayStrings.map((v, idx) => ({
  label: v,
  value: idx,
}));
const needCorrectionList = computed(() =>
  Array.from({ length: 15 }, (_, i) => ({
    assignmentId: Number(assignmentId.value),
    problemId: i + 1,
    display: `${assignmentName.value}.${i + 1}`,
  }))
);
const problemEquals = (x: MistakeDto, y: MistakeDto) =>
  x.assignmentId === y.assignmentId && x.problemId == y.problemId;
const uniqueProblemList = (a: Array<MistakeDto>): Array<MistakeDto> => {
  let set = new Set()
  let max = Math.max(...a.map(x => x.problemId)) + 10
  return a.filter(x => {
    let id = x.assignmentId * max + x.problemId
    let res = !set.has(id)
    if (res) set.add(id)
    return res
  })
}

let dataSource: Ref<ReviewInfoDto[]> = ref([]);
let dataChanged: ReviewInfoDto[] = [];
const fetchReview = async () => {
  dataSource.value = [];
  const resp = await getReview(assignmentId.value, reviewerId.value)
  resp.sort((a, b) => a.studentId - b.studentId);
  dataSource.value = resp.map((row) => {
    const rowRef = reactive(row);
    watch(rowRef, (v) => {
      dataChanged = dataChanged.filter(
        (row) => row.studentId !== v.studentId
      );
      dataChanged.push(v);
      SendChanges();
    });
    return rowRef;
  });
};

const SendChanges = debounce(async () => {
  const dataToSend = dataChanged;
  dataChanged = [];
  await MyRequestWrapper(() =>
    updateReview(assignmentId.value, dataToSend)
      .catch(error => {
        const NotChanged = dataToSend.filter((row) =>
          dataChanged.every((changed) => row.studentId !== changed.studentId)
        );
        dataChanged = dataChanged.concat(NotChanged);
        throw error;
      })
  );
}, 500);

async function downloadReview() {
  invokeDownload(
    await getReviewArchieveUrl(assignmentId.value, reviewerId.value),
    `${assignmentId}.zip`
  );
}
</script>
