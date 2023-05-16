<template>
    <div class="about">
    <div v-if="route.query.id!=undefined" style="padding-bottom: 20px;">
        <n-skeleton v-if="loading" text style="width:200px" /> 
      <n-page-header v-else :title="'Events of '+route.query.name" @back="$router.go(-1)"></n-page-header>
    </div>
        <n-h1 v-else>Your events</n-h1>
        <n-divider  v-if="route.query.id==undefined"/>
        <n-data-table remote ref="table" :columns="columns" :data="data" :loading="loading" :pagination="pagination"
            :row-props="rowProps" :row-key="rowKey" @update:page="handlePageChange"></n-data-table>
        <n-dropdown placement="bottom-start" trigger="manual" :x="x" :y="y" :options="options" :show="showDropdown"
            :on-clickoutside="onClickoutside" @select="handleSelect" />
    </div>
</template>
<script setup lang="tsx">
import { ref, onMounted, reactive, nextTick } from "vue";
import { useCounterStore } from "../stores/counter";
import type { AxiosResponse } from "axios";
import type { Event, Response, SimpleResponse } from "../types/index";
import type { DataTableColumn, DropdownDividerOption, DropdownOption } from "naive-ui";
import { useRouter,useRoute } from "vue-router";
const route=useRoute()
console.log(route.query.id)
const router = useRouter();
const axios = useCounterStore().Axios;
const showDropdown = ref(false)
const loading = ref(true);
const x = ref(0)
const y = ref(0)
const pointer = ref(0)
const data = ref<Event[]>([]);
const onClickoutside = () => {
    showDropdown.value = false
}
const pagination = reactive({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    prefix({ itemCount }: any) {
        return `Total is ${itemCount}.`;
    },
});
const rowProps = (row: Event) => {
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
const rowKey = (rowData: Event) => {
    return rowData.id;
};
const columns: DataTableColumn[] = [
    {
        title: "Source",
        key: "src",
        width: 54,
        render: (rowData: any) => {
            return <n-a onClick={()=>router.push('/agents/'+rowData.srcAgentId)}>{rowData.srcAgentName}</n-a>;
        },
    },
    {
        title: "Created At",
        key: "createAt",
        width: 70,
        render: (rowData: any) => {
            //格式化日期
            return  new Date(rowData.createAt).toLocaleString();
        },
    },
    {
        title: "Payload",
        key: "payload",
        width: 100,
        render: (rowData: any) => {
            return <n-ellipsis>{rowData.jsonStr}</n-ellipsis>;
        },
    },

];
const handleSelect = (key: string) => {
    switch (key) {
        case 'del':

            break
        case 'show':

            break
    }
    showDropdown.value = false
}
const options: Array<DropdownOption | DropdownDividerOption> = [
    {
        label: 'Show',
        key: 'show',
    },
    {
        type: 'divider',

        key: 'divider',
    },
    {
        key: 'del',
        label: () => <><n-text type='error'>Delete</n-text></>
    }
]
const query = (page: number, pageSize: number) => {
    return axios.get("/event", {
        params: {
            page,
            number: pageSize,
            id: route.query.id?route.query.id:undefined,
        },
    });
};
query(1, pagination.pageSize).then((datax: AxiosResponse<Response<Event>>) => {
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
const handlePageChange = (currentPage: any) => {
    if (!loading.value) {
        loading.value = true;
        query(currentPage, pagination.pageSize).then(
            (datax: AxiosResponse<Response<Event>>) => {
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
</script>
<style scoped>
.about {
    padding-top: 20px;
}
</style>