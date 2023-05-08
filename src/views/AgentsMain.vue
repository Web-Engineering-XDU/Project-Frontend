<template>
  <div class="about">
    <n-h1>Your agents</n-h1>
    <n-divider />
    <n-data-table
      remote
      ref="table"
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      :row-key="rowKey"
      @update:page="handlePageChange"
    />
    <n-button @click="$router.push('/agents/add')">New Agent</n-button>
  </div>
</template>
<script setup lang="tsx">
import { useCounterStore } from "@/stores/counter";
import { ref, reactive } from "vue";
import type { Agent, Response } from "@/types/index";
import type { AxiosResponse } from "axios";
const data = ref<Agent[]>([]);
const loading = ref(true);
const store = useCounterStore();
const axios = store.Axios;
const pagination = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 10,
  prefix({ itemCount }: any) {
    return `Total is ${itemCount}.`;
  },
});
const rowKey = (rowData: Agent) => {
  return rowData.id;
};
const columns = ref([
  {
    title: "Name",
    key: "name",
    render: (rowData: Agent) => {
      return (
        <>
          <n-a style="height:50%;">{rowData.name}</n-a>
          <div style="height:50%;">
            <n-text style="font-size:12px" depth="3">
              {rowData.typeName}
            </n-text>
          </div>
        </>
      );
    },
  },
  {
    title: "Age",
    key: "age",
    render: (rowData: Agent) => {
      return <span>{DateCount(rowData.createAt)}</span>;
    },
  },
  {
    title: "Enabled",
    key: "enable",
    render: (rowData: Agent) => {
      return (
        <n-tag type={rowData.enable ? "success" : "error"} round>
          {rowData.enable ? "Yes" : "No"}
        </n-tag>
      );
    },
  },
  {
    key: "actions",
    render: () => {
      return <span>Actions</span>;
    },
  },
]);
const handlePageChange = (currentPage: any) => {
  if (!loading.value) {
    loading.value = true;
    query(currentPage, pagination.pageSize).then(
      (datax: AxiosResponse<Response<Agent>>) => {
        data.value = datax.data.result.content;
        pagination.page = currentPage;
        pagination.pageCount = datax.data.result.count / pagination.pageSize;
        // @ts-ignore-next-line
        pagination.itemCount = datax.data.result.totalCount;
        loading.value = false;
      }
    );
  }
};
const query = (page: number, pageSize: number) => {
  return axios.get("/agent", {
    params: {
      page,
      number: pageSize,
    },
  });
};
const DateCount = (date: string) => {
  const x = Date.now() - Date.parse(date);
  if (x > 31536000000) return Math.floor(x / 31536000000) + " y";
  else if (x > 2592000000) return Math.floor(x / 2592000000) + " m";
  else if (x > 86400000) return Math.floor(x / 86400000) + " d";
  else if (x > 3600000) return Math.floor(x / 3600000) + " h";
  else return Math.floor(x / 60000) + " m";
};
query(1, pagination.pageSize).then((datax: AxiosResponse<Response<Agent>>) => {
  console.log(data);
  data.value = datax.data.result.content;
  console.log(data.value);
  pagination.page = 1;
  pagination.pageCount = datax.data.result.count / pagination.pageSize;
  // @ts-ignore-next-line
  pagination.itemCount = datax.data.result.count;
  loading.value = false;
});
axios.get("/agent").then((res) => {
  console.log(res.data);
});
</script>
<style scoped>
.about {
  padding-top: 20px;
}
</style>
