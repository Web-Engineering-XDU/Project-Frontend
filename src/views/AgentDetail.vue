<template>
  <div style="padding-top:20px">
    <n-config-provider :hljs="hljs">
      <n-skeleton v-if="loading" text style="width:200px" /> 
      <n-page-header v-else :title="agent?.name + ' Details'" @back="$router.push('/agents')"></n-page-header>
      <n-list style="padding-top:20px">
        <n-list-item>
        <n-skeleton v-if="loading" text style="width:200px" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Type:</span>{{  agent.typeName }}</div>
        </n-list-item>
        <n-list-item>
          <n-skeleton v-if="loading" text style="width:200px" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Enable:</span>{{  agent.enable }}</div>
        </n-list-item>
        <n-list-item>
          <n-skeleton v-if="loading" text style="width:220px" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Created At:</span>{{  new Date(agent.createAt).toLocaleString() }}</div>
        </n-list-item>
        <n-list-item>
          <n-skeleton v-if="loading" text style="width:210px" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Event Max Age:</span>{{ agent.eventForever ? 'Forever' : 
          timeConvert(agent.eventMaxAge) }}</div>
        </n-list-item>
        <n-list-item>
          <n-skeleton v-if="loading" text style="width:300px;max-width:100%" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Description:</span>{{ agent.description }}</div>
        </n-list-item>
        <n-list-item>
          <n-skeleton v-if="loading" text style="width:200px" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Events created:</span><n-a @click="router.push('/events?id='+route.params.id+'&name='+agent.name)">{{  count }}</n-a></div>
        </n-list-item>
        <n-list-item>
          <n-skeleton v-if="loading" text style="width:300px;max-width:100%" /> 
          <div v-else><span style="font-weight:800;padding-right:15px">Props:</span><n-code
              :code="agent.propJsonStr != undefined ? JSON.stringify(JSON.parse(agent.propJsonStr), null, 2) : ''"
              language="json"></n-code></div>
        </n-list-item>
      </n-list>
    </n-config-provider>
  </div>
</template>
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import type { Agent, Response,Event } from '@/types'
import type { AxiosResponse } from 'axios'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)
const loading = ref(true)
const message=useMessage()
const router=useRouter()
const axios = useCounterStore().Axios
const route = useRoute()
const agent = ref({} as Agent)
const count=ref(0)
axios.get('/agent', { params: { id: route.params.id,page:1,number:1 } }).then((res: AxiosResponse<Response<Agent>>) => {
  if(res.data.result.count==0){
    message.error('Agent Not Found')
    router.replace('/agents')
    return
  }
  agent.value = res.data.result.content[0]
  axios.get('/event', { params: {id: route.params.id } }).then((res: AxiosResponse<Response<Event>>) => {
    count.value=res.data.result.totalCount
    loading.value = false
    console.log(res.data)
  })
})
const timeConvert = (time: number) => {
  //number is nanosecond, convert to day hour minute,if no day,show hour minute,if no hour,show minute,if zero,show Never Keeped,注意是nanosecond,如果minute是0，那么返回秒
  if (time == 0) return 'Never Keeped'
  let day = Math.floor(time / (24 * 3600 * 1000000000))
  let hour = Math.floor((time - day * 24 * 3600 * 1000000000) / (3600 * 1000000000))
  let minute = Math.floor((time - day * 24 * 3600 * 1000000000 - hour * 3600 * 1000000000) / (60 * 1000000000))
  let second = Math.floor((time - day * 24 * 3600 * 1000000000 - hour * 3600 * 1000000000 - minute * 60 * 1000000000) / (1000000000))
  if (day > 0) return day + ' days ' + hour + ' hours ' 
  if (hour > 0) return hour + ' hours ' + minute + ' minutes'
  if (minute > 0) return minute + ' minutes'+second + ' seconds'
  else return second + ' seconds'
}
</script>
