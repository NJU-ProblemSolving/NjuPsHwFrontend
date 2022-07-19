<template>
  <div>
    <a-row>
      <a-col span="12">
        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 6 }">
          <a-form-item label="评阅人">
            <a-select v-model:value="reviewerId" :options="reviewerOptions" :disabled="requesting"></a-select>
          </a-form-item>
          <a-form-item label="作业">
            <assignment-selector v-model="assignmentId" v-model:name="assignmentName" :disabled="requesting">
            </assignment-selector>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col span="12">
        <a-button type="primary" @click="downloadReview">下载作业压缩包</a-button>
      </a-col>
    </a-row>

    <a-table v-show="dataSource.length > 0" :columns="columns" :data-source="dataSource" row-key="studentId"
      expended-row-key="studentId">
      <template #grade="{ record }">
        <a-select style="width: 60px" v-model:value="record.grade" :options="gradeOptions">
        </a-select>
      </template>
      <template #needCorrection="{ record }">
        <object-selector v-model="record.needCorrection" :list="needCorrectionList" :nameSelector="x => x.display"
          :equalComparer="problemEquals" style="width: 100%;"></object-selector>
      </template>
      <template #hasCorrected="{ record }">
        <object-selector v-model="record.hasCorrected"
          :list.once="uniqueProblemList((mistakes[record.studentId] ?? []).concat(record.hasCorrected))" :nameSelector="x => x.display"
          :equalComparer="problemEquals" style="width: 100%;">
        </object-selector>
      </template>
      <template #expandedRowRender="{ record }">
        <a-row type="flex" justify="space-around">
          <a-col span="11" sm="24">
            <a-input addon-before="额外评语" v-model:value="record.comment" />
          </a-col>
          <a-col span="11" sm="24">
            <a-input addon-before="跟踪评价" v-model:value="record.track" />
          </a-col>
        </a-row>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, reactive, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { debounce, zeroPadding, invokeDownload, localStorageVariable, Lock } from "../utils";
import sha1 from "sha1";
import {
  getMistakeInfo,
  getReviewInfo,
  postReviewInfo,
  ReviewInfo,
  GradeDisplayStrings,
  apiPrefix,
  ProblemDTO,
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
    if (error.response?.status == 401) {
      router.push({ name: "Login", params: { returnIfSuccess: '1' } });
    } else if (error.response?.status === 403) {
      Modal.error({
        title: () => error.message,
        content: () => "需要管理员权限",
      });
    } else {
      Modal.error({
        title: () => error.message,
        content: () => error.response?.data  ?? "出现意外的错误，建议刷新页面与服务器重新同步",
      });
      if (typeof error.toJSON !== "undefined") console.error(error.toJSON);
      else console.error(error);
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

const mistakes: { [key: number]: Array<ProblemDTO> } = reactive({});

onMounted(() =>
  MyRequestWrapper(async () => {
    let req = [
      getMistakeInfo().then((list) =>
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
const problemEquals = (x: ProblemDTO, y: ProblemDTO) =>
  x.assignmentId === y.assignmentId && x.problemId == y.problemId;
const uniqueProblemList = (a: Array<ProblemDTO>): Array<ProblemDTO> => {
  let set = new Set()
  let max = Math.max(...a.map(x => x.problemId)) + 10
  return a.filter(x => {
    let id = x.assignmentId * max + x.problemId
    let res = !set.has(id)
    if (res) set.add(id)
    return res
  })
}

let dataSource: Ref<ReviewInfo[]> = ref([]);
let dataChanged: ReviewInfo[] = [];
const fetchReview = async () => {
  dataSource.value = [];
  const resp = await getReviewInfo(assignmentId.value, reviewerId.value)
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
  UpdateFingerPrint();
};

const lastSync = ref("");
const localFingerPrint = ref("");
const UpdateFingerPrint = () => {
  localFingerPrint.value = sha1(
    JSON.stringify(dataSource.value).replace(/,'mistakes':\[.*?\]/g, "")
  );
  const now = new Date();
  lastSync.value =
    `${now.getMonth() + 1}.${now.getDate()} ` +
    zeroPadding(now.getHours(), 2) +
    zeroPadding(now.getMinutes(), 2) +
    zeroPadding(now.getSeconds(), 2);
};
const SendChanges = debounce(async () => {
  const dataToSend = dataChanged;
  dataChanged = [];
  await MyRequestWrapper(() =>
    postReviewInfo(assignmentId.value, dataToSend)
      .then(() => {
        UpdateFingerPrint();
      })
      .catch((e) => {
        const NotChanged = dataToSend.filter((row) =>
          dataChanged.every((changed) => row.studentId !== changed.studentId)
        );
        dataChanged = dataChanged.concat(NotChanged);
        throw e;
      })
  );
}, 500);

function downloadReview() {
  invokeDownload(
    apiPrefix +
    `Review/Archieve?assignmentId=${assignmentId.value}&reviewerId=${reviewerId.value}`,
    `${assignmentId}.zip`
  );
}
</script>
