<template>
    <div>
        <n-modal v-model:show="showModal">
            <n-card style="width: 600px" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <n-h2>Dry Run</n-h2>
                <n-divider style="margin-top:-10px" />
                <n-form-item style="margin-top:-10px" label="Extra Props"><n-dynamic-input v-model:value='eProps'
                        preset="pair"></n-dynamic-input></n-form-item>
                <n-button type="primary" @click="handleDryRun">Dry Run</n-button>
            </n-card>
        </n-modal>
    </div>
</template>
<script setup lang="tsx">
import { ref, watch } from "vue";
import hljs from 'highlight.js';
import { useCounterStore } from "@/stores/counter";
import { useMessage,useDialog } from 'naive-ui'
import type { AxiosResponse } from "axios";
import type { Response } from "@/types";
import { NCode } from "naive-ui";
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)
const axios = useCounterStore().Axios
const showModal = ref(false)
const message = useMessage()
const showModalRe = ref(false)
const dialog = useDialog()
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
    const obj: any = {}
    for (const element of eProps.value) {
        if ((element as any).key != '' && (element as any).value != '')
            obj[(element as any).key!] = (element as any).value
    }
    const tempAgent=JSON.parse(JSON.stringify(props.agentInfo))
    if(tempAgent.propJsonStr.selectors[0].varName==''&&tempAgent.propJsonStr.selectors[0].selectorType==''&&tempAgent.propJsonStr.selectors[0].selectorContent==''){
        tempAgent.propJsonStr.selectors=[]
      }
    axios.post('/agent/dry-run', {
        agentPropJsonStr: typeof tempAgent.propJsonStr == 'string' ? tempAgent.propJsonStr : JSON.stringify(tempAgent.propJsonStr),
        agentTypeId: tempAgent.typeId,
        event: obj
    }).then((res) => {
        if (res.data.code == 200)
            dialog.info({
                title: 'Dry Run Result',
                content:()=><n-config-provider hljs={hljs}><NCode word-wrap language="json" code={JSON.stringify(res.data.result, null, 2)}></NCode></n-config-provider>
            })
        else
            message.error('Dry run failed:' + res.data.msg)
    })
}
</script>
<style scoped></style>