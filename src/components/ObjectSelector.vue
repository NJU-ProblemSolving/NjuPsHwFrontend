<template>
  <a-select
    :value="index"
    :options="options"
    mode="multiple"
    :token-separators="[',', ' ', ';']"
    @update:value="updateIndex"
  />
</template>

<script setup lang="ts">
import { onMounted, watch, Ref, ref } from "vue";

const props = defineProps<{
  list: Array<any>
  modelValue: Array<any>,
  nameSelector: (obj: any) => string,
  equalComparer?: (x: any, y: any) => boolean,
}>();

const emits = defineEmits(['update:modelValue'])

const cachedList: Array<any> = JSON.parse(JSON.stringify(props.list))
const options = cachedList.map((x, i) => ({
  value: i,
  label: props.nameSelector(x),
}))

const index: Ref<Array<number>> = ref([]);
const updateIndex = (value: Array<number>) => {
  index.value = value
  emits('update:modelValue', value.map(x => cachedList[x]))
}
const updateIndexByProps = () => {
  index.value = []
  let changed = false;
  props.modelValue.forEach(x => {
    let i = -1;
    const equalComparer = props.equalComparer
    if (typeof equalComparer !== 'undefined')
      i = cachedList.findIndex((y) => equalComparer(x, y))
    else
      i = cachedList.indexOf(x);
    if (i !== -1) {
      index.value.push(i)
    } else {
      changed = true;
    }
  });
  if (changed) updateIndex(index.value)
}
watch(props.modelValue, updateIndexByProps);
onMounted(updateIndexByProps);

</script>