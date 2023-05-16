<template>
    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <n-h2>Dry Run</n-h2>
        <n-divider style="margin-top:-10px" />
            <n-form-item style="margin-top:-10px"  label="Extra Props"><n-dynamic-input v-model:value='eProps' preset="pair"></n-dynamic-input></n-form-item>
            <n-button type="primary" @click="handleDryRun">Dry Run</n-button>
        </n-card>
    </n-modal>
</template>
<script setup lang="tsx">
import { ref, watch } from "vue";
import { useCounterStore } from "@/stores/counter";
import {useMessage} from 'naive-ui'
import type { AxiosResponse } from "axios";
import type { Response } from "@/types";
const axios = useCounterStore().Axios
const showModal = ref(false)
const message=useMessage()
const props = defineProps({
    agentInfo: {
        type: Object,
        required: true
    },
    show: Boolean
})
const eProps = ref([])
const emit = defineEmits(["update:show"])
const emitUpdateShow = () => {
    emit("update:show", false)
}
watch(() => props.show, (val) => {
    showModal.value = val

})
watch(showModal, (val) => {
    if (!val)
        emitUpdateShow()
})
const handleDryRun = () => {
    //转eProps为对象
    const obj :any= {}
    for (const element of eProps.value) {
        if((element as any).key!=''&&(element as any).value!='')
        obj[(element as any).key!] = (element as any).value
    }
    axios.post('/agent/dry-run', {
        agentPropJsonStr:typeof props.agentInfo.propJsonStr=='string'?props.agentInfo.propJsonStr:JSON.stringify(props.agentInfo.propJsonStr),
        agentTypeId: props.agentInfo.typeId,
        event: obj
    }).then((res) => {
        if(res.data.code==200)
        message.info('Dry run success:'+JSON.stringify(res.data.result))
        else
        message.error('Dry run failed:'+res.data.msg)
    })
}
</script>
<style scoped></style>