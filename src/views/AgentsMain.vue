<template>
  <div class="about">
    <n-h1>Your agents</n-h1>
    <n-divider />
    <n-data-table remote ref="table" :columns="columns" :data="data" :loading="loading" :pagination="pagination"
      :row-props="rowProps" :row-key="rowKey" @update:page="handlePageChange" />
    <n-dropdown placement="bottom-start" trigger="manual" :x="x" :y="y" :options="options" :show="showDropdown"
      :on-clickoutside="onClickoutside" @select="handleSelect" />
    <n-button @click="$router.push('/agents/add')">New Agent</n-button>
    <DryRun v-model:show="showModal" :agentInfo="(agentInfo as Agent)" />
  </div>
</template>
<script setup lang="tsx">
import { useCounterStore } from "@/stores/counter";
import { ref, reactive, nextTick } from "vue";
import type { Agent, Response, SimpleResponse } from "@/types/index";
import type { AxiosResponse } from "axios";
import { useMessage, type DropdownOption, type DropdownDividerOption } from "naive-ui";
import { Edit } from "@vicons/carbon";
import { useRouter } from 'vue-router'
import DryRun from "@/components/DryRun.vue";
const router = useRouter()
const data = ref<Agent[]>([]);
const loading = ref(true);
const store = useCounterStore();
const axios = store.Axios;

const agentInfo = ref<Agent>({
  id: 0,
  enable: false,
  typeId: 0,
  eventForever: false,
  eventMaxAge: 0,
  propJsonStr: "",
  allowInput: false,
  allowOutput: false,
  name: "",
  description: "",
  createAt: "",
  typeName: "",
});
const showModal = ref(false)
const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const message = useMessage()
const pointer = ref(0)
const rowProps = (row: Agent) => {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      showDropdown.value = false
      nextTick().then(() => {
        pointer.value = row.id
        showDropdown.value = true
        x.value = e.clientX
        y.value = e.clientY
      })
    }
  }
}
const handleSelect = (key: string) => {
  switch (key) {
    case 'del':
      axios.delete('/agent', {
        params: {
          id: pointer.value
        }
      }).then((res: AxiosResponse<SimpleResponse>) => {
        if (res.data.code == 200) {
          message.success('Agent Deleted')
          
          if(pagination.page>=pagination.pageCount&&pagination.page>1){
            pagination.page = pagination.page - 1
            handlePageChange(pagination.page);
            return
          }
          handlePageChange(pagination.page);
        }
      })
      break
    case 'edit':
      router.push('/agents/' + pointer.value + '/edit')
      break
    case 'dry':
      agentInfo.value = (data.value.find((x) => x.id == pointer.value) as Agent)
      showModal.value = true
      break
  }
  showDropdown.value = false
}
const options: Array<DropdownOption | DropdownDividerOption> = [
  {
    label: 'Edit agent',
    key: 'edit',
  },
  {
    label: 'Dry Run',
    key: 'dry',
  },
  {
    type: 'divider',

    key: 'divider',
  },
  {
    key: 'del',
    label: () => <><n-text type='error'>Delete agent</n-text></>
  }
]

const onClickoutside = () => {
  showDropdown.value = false
}

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
          <n-a style="height:50%;" onClick={()=>router.push('/agents/'+rowData.id)}>{rowData.name}</n-a>
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

]);
const handlePageChange = (currentPage: any) => {
  if (!loading.value) {
    loading.value = true;
    query(currentPage, pagination.pageSize).then(
      (datax: AxiosResponse<Response<Agent>>) => {
        if (datax.data.code == 200) {
          if (datax.data.result.count == 0) {
            pagination.page = 1;
            pagination.pageCount = 1;
            // @ts-ignore-next-line
            pagination.itemCount = 0;
            data.value = datax.data.result.content;
            loading.value = false;
            return
          }
          data.value = datax.data.result.content;
          pagination.page = currentPage;
          pagination.pageCount = Math.ceil(datax.data.result.count / pagination.pageSize);
          // @ts-ignore-next-line
          pagination.itemCount = datax.data.result.totalCount;
          loading.value = false;
        }
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
  if (datax.data.code == 200) {
    if (datax.data.result.count == 0) {
      pagination.page = 1;
      pagination.pageCount = 1;
      // @ts-ignore-next-line
      pagination.itemCount = 0;
      loading.value = false;
      return
    }
    data.value = datax.data.result.content;
    pagination.page = 1;
    pagination.pageCount = Math.ceil(datax.data.result.count / pagination.pageSize);
    // @ts-ignore-next-line
    pagination.itemCount = datax.data.result.totalCount;
    loading.value = false;
  }
});

</script>
<style scoped>
.about {
  padding-top: 20px;
}
</style>
