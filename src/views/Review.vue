<template>
  <div>
    <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 3 }">
      <a-form-item label="评阅人">
        <a-select
          v-model:value="reviewerId"
          :options="reviewerOptions"
        ></a-select>
      </a-form-item>
      <a-form-item label="作业">
        <a-select
          v-model:value="assignmentId"
          :options="assignmentOptions"
          :loading="assignmentLoading"
        ></a-select>
      </a-form-item>
    </a-form>

    <a-table
      :columns="columns"
      :data-source="dataSource"
      row-key="studentId"
      expended-row-key="studentId"
    >
      <template #grade="{ record }">
        <a-select
          style="width: 60px"
          v-model:value="record.grade"
          :options="gradeOptions"
        >
        </a-select>
      </template>
      <template #needCorrection="{ record }">
        <a-select
          style="width: 130px"
          v-model:value="record.needCorrection"
          mode="multiple"
          :token-separators="[',', ' ', ';']"
          :options="needCorrectionOptions"
        >
        </a-select>
      </template>
      <template #hasCorrected="{ record }">
        <a-select
          style="width: 130px"
          v-model:value="record.hasCorrected"
          mode="multiple"
          :token-separators="[',', ' ', ';']"
          :options="record.mistakes"
        >
        </a-select>
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
import { ref, reactive, watch, computed, getCurrentInstance, Ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'vue-router';
import { debounce, localStorageVariable } from '../utils';
import sha1 from 'sha1';
import {
  getReviewInfo,
  postReviewInfo,
  ReviewInfo,
  tryLoginByToken,
  GradeDisplayStrings,
  getAssignmentList,
} from '../DAL';
import { Modal } from 'ant-design-vue';

const router = useRouter();

const requesting = ref(false);
const MyRequestWrapper = async <T>(
  func: () => Promise<T>
): Promise<T | undefined> => {
  try {
    if (requesting.value === true) {
      throw Error('Multiple request');
    }

    requesting.value = true;
    return await func();
  } catch (error: any) {
    if (error.response?.status == 401) {
      router.push('/Login');
    } else {
      Modal.error({
        title: () => error.message,
        content: () => error.data ?? '',
      });
      if (typeof error.toJSON === 'undefined')
      console.error(error.toJSON());
    }
  } finally {
    requesting.value = false;
  }
};

const reviewerId = localStorageVariable('reviewerId', '1');
const reviewerOptions = [
  {
    value: '1',
    label: '李晗',
  },
  {
    value: '2',
    label: '桑百惠',
  },
  {
    value: '3',
    label: '赵超懿',
  },
  {
    value: '4',
    label: '姚梦雨',
  },
];

const assignmentId = localStorageVariable('assignmentId', '');
const assignmentLoading = ref(true);
const assignmentOptions = reactive([]);
MyRequestWrapper(() =>
  getAssignmentList().then((list) => {
    assignmentOptions.values = list.map((x) => ({ value: x }));
    assignmentLoading.value = false;
  })
);

const columns = [
  {
    title: '学号',
    dataIndex: 'studentId',
    key: 'studentId',
  },
  {
    title: '姓名',
    dataIndex: 'studentName',
    key: 'studentName',
  },
  {
    title: '评分',
    dataIndex: 'grade',
    key: 'grade',
    slots: { customRender: 'grade' },
  },
  {
    title: '需订正',
    dataIndex: 'needCorrection',
    key: 'needCorrection',
    slots: { customRender: 'needCorrection' },
  },
  {
    title: '已订正',
    dataIndex: 'hasCorrected',
    key: 'hasCorrected',
    slots: { customRender: 'hasCorrected' },
  },
];

const gradeOptions = GradeDisplayStrings.map((v, idx) => ({
  label: v,
  value: idx,
}));
const needCorrectionOptions = computed(() => {
  return Array.from({ length: 15 }, (_, i) => ({
    value: `${assignmentId.value}-${i + 1}`,
  }));
});

let dataSource: Ref<ReviewInfo[]> = ref([]);
let dataChanged: ReviewInfo[] = [];
MyRequestWrapper(() =>
  getReviewInfo(assignmentId.value, reviewerId.value).then((resp) => {
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
  })
);

const lastSync = ref('');
const localFingerPrint = ref('');
const UpdateFingerPrint = () => {
  localFingerPrint.value = sha1(
    JSON.stringify(dataSource.value).replace(/,'mistakes':\[.*?\]/g, '')
  );
  const now = new Date();
  lastSync.value =
    `${now.getMonth() + 1}.${now.getDate()} ` +
    `${('0' + now.getHours()).substr(-2)}:` +
    `${('0' + now.getMinutes()).substr(-2)}:` +
    `${('0' + now.getSeconds()).substr(-2)}`;
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
        const NoModifyDuringRequest = dataToSend.filter((row) =>
          dataChanged.every((changed) => row.studentId !== changed.studentId)
        );
        dataChanged = dataChanged.concat(NoModifyDuringRequest);
      })
  );
}, 3000);
</script>
