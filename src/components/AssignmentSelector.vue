<template>
  <a-select
    v-model:value="assignmentId"
    :options="options"
    :loading="loading"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { onMounted, watch, Ref, ref } from "vue";
import { AssignmentDto, getAssignmentList } from "@/DAL";

const props = defineProps<{
  modelValue: number | string,
  name?: string,
  disabled?: boolean,
}>();

const emits = defineEmits(["update:modelValue", "update:name", "update:info"]);

const assignmentId = ref(Number(props.modelValue))
watch(assignmentId, () => {
  emits('update:modelValue', assignmentId.value);
  emits('update:name', assignmentMap.get(assignmentId.value)?.name);
  emits('update:info', assignmentMap.get(assignmentId.value));
});

const loading = ref(true);
const options: Ref<{ value: number; label: string }[]> = ref([]);

let assignmentList: AssignmentDto[] = [];
let assignmentMap: Map<number, AssignmentDto> = new Map();

onMounted(async () => {
  assignmentList = await getAssignmentList();
  loading.value = false;
  assignmentList.forEach(x => {
    assignmentMap.set(x.id, x)
    options.value.push({ value: x.id, label: x.name })
  });
  if (!assignmentMap.has(assignmentId.value))
    assignmentId.value = assignmentList[0].id;
  emits('update:name', assignmentMap.get(assignmentId.value)?.name);
});
</script>
