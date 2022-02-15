<template>
  <a-select
    v-model:value="modelValue"
    :options="options"
    :loading="loading"
  ></a-select>
</template>

<script setup lang="ts">
import { onMounted, reactive, Ref, ref } from "vue";
import { getAssignmentList, submitAssignment } from "../DAL";

const props = defineProps({
  modelValue: Number,
});

const emits = defineEmits(["update:modelValue"]);

const loading = ref(true);
const options = ref([]);

onMounted(() =>
  getAssignmentList().then((list) => {
    loading.value = false;
    options.value = list.map((x) => ({ value: x.id, label: x.name }));
  })
);
</script>
