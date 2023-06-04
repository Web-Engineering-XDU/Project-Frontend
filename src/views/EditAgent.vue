<template>
    <div class="about">
        <n-h1>Modify a {{ agent?.typeId==1?'Schedule Agent':agent?.typeId==2?'Http Agent': 'Rss Agent' }}</n-h1>
        <n-divider />
    <div class="form-box">
      <div style="width: 100%">
        <AgentInner mode="edit" :id="agent.typeId" :ids="Number(id)" :data="agent"  v-if="ok"/>
      </div>
      <n-divider/>
      <n-button @click="$router.go(-1)"
        >Back<template #icon>
          <n-icon> <ArrowBack /> </n-icon></template
      ></n-button>
    </div>
    <div style="width: calc(100% - 500px); display: inline-block"></div>
  </div>

</template>
<script setup lang="ts">
import { useCounterStore } from "@/stores/counter";
import { useRoute } from "vue-router";
import type { Agent, AgentNew, Response, HttpAgent, ScheduleAgent,RssAgent } from "@/types/index";
import { ArrowBackFilled as ArrowBack } from "@vicons/material";
import type { AxiosResponse } from "axios";
import { reactive, ref } from "vue";
const axios = useCounterStore().Axios;
const route = useRoute();
/*export interface AgentNew<T> {
    name: string
    enable: boolean
    typeId: number
    description: string
    eventForever: boolean
    eventMaxAge: number
    propJsonStr: T
}*/
const agent = reactive<AgentNew<ScheduleAgent>>({
    typeId: 1,
    name: '',
    enable: false,
    description: '',
    eventForever: true,
    eventMaxAge: 0,
    propJsonStr:{
        cron:"",
    }
});
const ok=ref(false)
const id = route.params.id;
axios.get('/agent', {
    params: {
        id: id, number: 1, page: 1
    }
}).then((res:AxiosResponse<Response<Agent>>) => {
    if(res.data.code == 200){
        switch(res.data.result.content[0].typeId){
            case 1:
                Object.assign(agent, reactive<AgentNew<ScheduleAgent>>(toJSON(res.data.result.content[0]) as AgentNew<ScheduleAgent>))
                break
            case 2:
                Object.assign(agent, reactive<AgentNew<HttpAgent>>(toJSON(res.data.result.content[0]) as AgentNew<HttpAgent>))
                break
            case 4:
                Object.assign(agent, reactive<AgentNew<RssAgent>>(toJSON(res.data.result.content[0]) as AgentNew<RssAgent>))
                break
        }
        ok.value=true
    }
})
const toJSON=(obj:any)=>{
    obj.propJsonStr=JSON.parse(obj.propJsonStr)
    if(id=='1'){
        return obj as AgentNew<ScheduleAgent>
    }
    else if(id=='2'){
        return obj as AgentNew<HttpAgent>
    }
    else {
        return obj as AgentNew<RssAgent>
    }
}
</script>
<style scoped>
.form-box {
  width: 600px;
  max-width: 90vw;
  flex-wrap: wrap;
  display: inline-flex;
  justify-content: flex-start;
  margin: 0 auto;
}
.about {
  padding-top: 20px;
}</style>