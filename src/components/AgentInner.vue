<template>
  <div style="width: 100%" class="home">
    <TransitionGroup enter-active-class="animate__animated animate__fadeIn">
      <n-form-item ref="nameRef" :rule="valiName" :key="1" label="Name"><n-input
          v-model:value="agent.name"></n-input></n-form-item>
      <n-form-item :key="2" label="Enabled"><n-switch size="large" :rail-style="() => {
        return { width: '234px' };
      }
        " v-model:value="agent.enable">
          <template #checked>
            <div style="text-align: center; padding-right: 25px">Run When Triggered</div>
          </template>
          <template #unchecked>
            <div style="text-align: center; padding-left: 55px">Run Never</div>
          </template>
        </n-switch></n-form-item>
      <n-form-item :key="3" v-if="!isScheduleAgent(agent)" label="Event Forever"><n-switch size="large"
          v-model:value="agent.eventForever">
          <template #checked>
            <div style="text-align: center; padding-right: 13px"> Events Never Destroyed</div>
          </template>
          <template #unchecked>
            <div>
              Events Destroyed Sometime
            </div>
          </template>
        </n-switch>
      </n-form-item>
      <n-form-item :key="4" v-if="!agent.eventForever && !isScheduleAgent(agent)" label="Event Max Age"><n-input-number
          :min="0" style="margin-right: 6px; width: calc(33% - 4px)" v-model:value="time[0]"
          placeholder="Day"></n-input-number><n-input-number :min="0" style="margin-right: 6px; width: calc(33% - 4px)"
          v-model:value="time[1]" placeholder="Minute"></n-input-number><n-input-number :min="0"
          style="width: calc(33% - 4px)" v-model:value="time[2]" placeholder="Second"></n-input-number></n-form-item>
      <n-form-item :key="5" label="Description"><n-input type="textarea" v-model:value="agent.description"></n-input>
      </n-form-item>
      <n-h3 style="margin-top: -10px" :key="6">Props</n-h3>
      <auto-input v-if="showIn" :key="7" :render-data="(agent.propJsonStr as any)" @update:render-data="(e) => agent.propJsonStr = e" />
      <n-h3 style="margin-top: -10px" :key="111">Relations</n-h3>
      <n-form-item :label="'Destination'" :key="121"><n-select v-model:value="relation.dsts" multiple filterable
          :options="options[0]" :loading="loading[0]" clearable remote :clear-filter-after-select="false"
          :reset-menu-on-options-change="false" @blur="blur(0)" @search="(e: string) => handleSearch(e, 0)"
          @scroll="(e: Event) => handleScroll(e, 0)"></n-select></n-form-item>
      <n-form-item v-if="!isScheduleAgent(agent)" :key="122" :label="'Source'"><n-select v-model:value="relation.srcs"
          multiple filterable :options="options[1]" :loading="loading[1]" clearable remote
          :reset-menu-on-options-change="false" @blur="blur(1)" :clear-filter-after-select="false"
          @search="(e: string) => handleSearch(e, 1)" @scroll="(e: Event) => handleScroll(e, 1)"></n-select></n-form-item>
    </TransitionGroup>
    <n-button type="primary" @click="saveWrapper">Save</n-button>
    <n-button style="margin-left: 10px" @click="syncAndShow">Dry Run</n-button>
    <DryRun :agent-info="agent" v-model:show="show" />
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from "vue";
import { useCounterStore } from "@/stores/counter";
import type { AgentNew, HttpAgent, ScheduleAgent, Relations, Response, RssAgent } from "@/types";
import { useMessage, type SelectOption } from "naive-ui";
import DryRun from './DryRun.vue'
import AutoInput from './AutoInput.vue'
import { useRouter } from "vue-router";
import type { AxiosResponse } from "axios";
const showIn=ref(true)
interface simple {
  Id: number,
  Name: string
}
const loading = reactive([false, false]);
const show = ref(false)
const options = reactive<SelectOption[][]>([[], []]);
interface keyValue {
  key: string;
  value: string;
}

const isHttpAgent = (
  Agent: AgentNew<HttpAgent> | AgentNew<ScheduleAgent>|AgentNew<RssAgent>
): Agent is AgentNew<HttpAgent> => {
  return Agent.typeId == 2;
};
const isRssAgent = (
  Agent: AgentNew<HttpAgent> | AgentNew<ScheduleAgent>|AgentNew<RssAgent>
): Agent is AgentNew<RssAgent> => {
  return Agent.typeId == 4;
};
const isScheduleAgent = (
  Agent: AgentNew<HttpAgent> | AgentNew<ScheduleAgent>|AgentNew<RssAgent>
): Agent is AgentNew<ScheduleAgent> => {
  return Agent.typeId == 1;
};
const axios = useCounterStore().Axios;
const message = useMessage();
const tempHeader = ref<keyValue[]>([]);
const tempTemplate = ref<keyValue[]>([]);
const relation = reactive<Relations>({
  agentId: 0,
  dsts: [],
  srcs: []
})
const props = defineProps({
  id: Number,
  mode: String,
  data: Object,
  ids: Number
});
const syncAndShow = () => {
  //把未和agent同步的agent信息更新
  show.value = true
}

const urlsRef = ref();
const nameRef = ref();
const query = reactive<Array<string>>(['', ''])
const valiName = ref({
  trigger: ["blur"],
  required: true,
  validator() {
    if (agent.name == "") {
      return new Error("Name cannot be empty");
    }
  },
});
const blur = (s: number) => {
  setTimeout(() => {
    handleSearch('', s)
  }, 200);
}
const typeOpt = [
  {
    label: "HTML",
    value: "html",
    disabled: true,
  },
  {
    label: "JSON",
    value: "json",
  },
];
const handleSearch = (quer: string, a: number) => {
  if (!quer.length) {
    options[a] = []
    query[a] = ''
    queryRelation(quer, a, 1).then(() => {
      loading[a] = false
    })
    return
  }
  query[a] = quer
  queryRelation(quer, a, 1).then(() => {
    loading[a] = false
  })
}
const handleScroll = (e: Event, a: number) => {
  const target = e.target as HTMLDivElement
  const scrollDistance = target.scrollHeight - target.scrollTop - target.clientHeight
  if (scrollDistance < 50 && !loading[a]) {
    const top = target.scrollTop
    queryRelation(query[a], a, Math.floor(options[a].length / 10) + 1, true, top).then(() => {
      loading[a] = false
      //滚轮回到原位


    })
  }
}
const total = reactive([0, 0])
const queryRelation = async (query: string, type: number, page: number, mode: boolean = false, dis = 0, pagesize = 10): Promise<boolean> => {
  loading[type] = true
  if (mode && options[type].length == total[type])
    return Promise.resolve(false)
  const res: AxiosResponse<Response<simple>> = await axios.get('/agent/relationable', {
    params: {
      id: props.ids != undefined ? props.ids : 0,
      keyword: query,
      type: type == 1 ? 'prev' : 'next',
      page: page,
      number: pagesize
    }
  });
  if (res.data.code == 200) {
    //keep selected options 
    const selected = options[type].filter((item) => {
      return relation[type == 1 ? 'srcs' : 'dsts'].includes(item.value as number)
    })
    let len = 0;
    selected.forEach((item) => {
      //如果query这个字符串在item.label中，则len不变，否则len+1，忽略大小写
      if (item.label!.toString().toLowerCase().includes(query.toLowerCase()))
        len++
    })
    //mode 为true则push，否则覆盖
    if (!mode) {
      options[type] = res.data.result.content.map((item) => {
        return {
          label: item.Name,
          value: item.Id
        }
      })
      total[type] = res.data.result.totalCount + len
    }
    if (mode)
      options[type].push(...res.data.result.content.map((item) => {
        return {
          label: item.Name,
          value: item.Id
        }
      }))
    //Remove selected by another type
    options[type].forEach((item) => {
      if (relation[type == 1 ? 'dsts' : 'srcs'].includes(item.value as number)) {
        item.disabled = true
      }
    })
    //在options里面去除selected里面有的
    options[type] = options[type].filter((item) => {
      return !selected.some((item2) => {
        return item.value == item2.value
      })
    })
    //在头部插入selected
    options[type].unshift(...selected)
    //去重


    return Promise.resolve(true);
  }

  else
    return Promise.resolve(false);
}
const ruleUrl = ref({
  trigger: ['blur'],
  required: true,
  validator() {
    let temp = true;
    (agent.propJsonStr as HttpAgent).urls.forEach((item) => {
      if (item == '')
        temp = false
    })
    if (!temp || (agent.propJsonStr as HttpAgent).urls.length == 0)
      return new Error('Urls can not be empty')
  }
})
const cronRef = ref();
const time = reactive<Number[]>([null as unknown as number, null as unknown as number, null as unknown as number]);
function init<T extends number>(id: T): AgentNew<ScheduleAgent> | AgentNew<HttpAgent>|AgentNew<RssAgent> {
  if (id === 1) {
    return reactive<AgentNew<ScheduleAgent>>({
      name: "",
      enable: false,
      typeId: 1,
      description: "",
      eventForever: false,
      eventMaxAge: 0,
      propJsonStr: {
        cron: "",
      },
    });
  } else if(id==2) {
    return reactive<AgentNew<HttpAgent>>({
      name: "",
      enable: false,
      typeId: 2,
      description: "",
      eventForever: false,
      eventMaxAge: 0,
      propJsonStr: {
        onUpdate: false,
        mergeEvent: false,
        urls: [""],
        method: "GET",
        header: {},
        body: "",
        template: {},
        docType: "json",
        selectors: [{
            varName:"",
            selectorType:"",
            selectorContent:""
        }],
      },
    });
  }
  else {
    return reactive<AgentNew<RssAgent>>({
      name: "",
      enable: false,
      typeId: 4,
      description: "",
      eventForever: false,
      eventMaxAge: 0,
      propJsonStr: {
        title: "",
        description: "",
        link: "",
        author: "",
        template: {
          title: "",
          description: "",
          link: "",
          author: "",
          created: "",
        },
      },
    });
  }
}
const cronValidate = (cron: string) => {
  const cronSplit = cron.split(" ");
  if (cronSplit.length != 6) {
    return false;
  }
  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronSplit;
  const secondReg = /^(\*|([0-5]?\d)(-[0-5]?\d)?(\/\d+)?(,[0-5]?\d(-[0-5]?\d)?(\/\d+)?)*|\?|L|\*\/\d+)$/;
  const minuteReg = /^(\*|([0-5]?\d)(-[0-5]?\d)?(\/\d+)?(,[0-5]?\d(-[0-5]?\d)?(\/\d+)?)*|\?|L|\*\/\d+)$/;
  const hourReg = /^(\*|([0-1]?\d|2[0-3])(-([0-1]?\d|2[0-3]))?(\/\d+)?(,([0-1]?\d|2[0-3])(-([0-1]?\d|2[0-3]))?(\/\d+)?)*|\?|L|\*\/\d+)$/;
  const dayOfMonthReg = /^(\*|([1-2]?\d|3[0-1])(-([1-2]?\d|3[0-1]))?(\/\d+)?(,([1-2]?\d|3[0-1])(-([1-2]?\d|3[0-1]))?(\/\d+)?)*|\?|L|\*\/\d+)$/;
  const monthReg = /^(\*|([1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(-([1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(\/\d+)?(,([1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(-([1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(\/\d+)?)*|\?|L|\*\/\d+)$/;
  const dayOfWeekReg = /^(\*|([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT)(-([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT))?(\/\d+)?(,([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT)(-([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT))?(\/\d+)?)*|\?|L|\*\/\d+)$/;
  if (
    second.match(secondReg) &&
    minute.match(minuteReg) &&
    hour.match(hourReg) &&
    dayOfMonth.match(dayOfMonthReg) &&
    month.match(monthReg) &&
    dayOfWeek.match(dayOfWeekReg)
  ) {
    return true;
  } else {
    return false;
  }
};
function onCreate() {
  return {
    varName: "",
    selectorType: "",
    selectorContent: "",
  };
}
//闭包
const methodOpt = [
  {
    label: 'GET',
    value: 'GET',
  },
  {
    label: 'POST',
    value: 'POST',
  },
  {
    label: 'PUT',
    value: 'PUT',
  },
  {
    label: 'DELETE',
    value: 'DELETE',
  },
]
const splitUpper = (str: string) => {
  //把首字母大写并按大写字母用空格分割
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};
const router = useRouter();
const rule = ref({
  trigger: ["blur"],
  required: true,
  validator() {
    if (!cronValidate((agent.propJsonStr as ScheduleAgent).cron)) {
      return new Error("Syntax Error");
    }
  },
});
const agent = init(props.id!);
if (props.mode == 'edit') {
  //把props.data按键值对赋值给agent
  Object.assign(agent, JSON.parse(JSON.stringify(props.data)));
  //把header和template放回对应临时变量
}

watch(
  () => props.id,
  (val: any) => {
    const x = {
      name: "",
      enable: false,
      description: "",
      eventForever: false,
      eventMaxAge: 0,
    };
    x.name = agent.name;
    x.enable = agent.enable;
    x.description = agent.description;
    x.eventForever = agent.eventForever;
    x.eventMaxAge = agent.eventMaxAge;
    Object.assign(agent, init(val));
    //重置tempTemplate和tempHeader
    tempHeader.value = [];
    tempTemplate.value = [];
    agent.name = x.name;
    agent.enable = x.enable;
    agent.description = x.description;
    agent.eventForever = x.eventForever;
    agent.eventMaxAge = x.eventMaxAge;
  }
);
watch(
  () => time,
  (val: any) => {
    const a = val[0] == null ? 0 : val[0];
    const b = val[1] == null ? 0 : val[1];
    const c = val[2] == null ? 0 : val[2];
    //以nanosecond存储
    agent.eventMaxAge =
      a * 24 * 60 * 60 * 1000 * 1000 * 1000 +
      b * 60 * 1000 * 1000 * 1000 +
      c * 1000 * 1000 * 1000;

  },
  { deep: true }
);
interface relationT {
  agentId: number,
  dsts: agentT[],
  srcs: agentT[]
}
interface simR {
  code: number,
  msg: string,
  result: relationT
}
interface agentT {
  Id: number,
  Name: string,
}
const initRelation = () => {
  if (props.mode == 'edit') {
    axios.get("/agent-relation/for-edit", { params: { id: props.ids } }).then((res: AxiosResponse<simR>) => {
      if (res.data.code == 200) {
        relation.agentId = res.data.result.agentId
        relation.dsts = res.data.result.dsts.map((item) => {
          return item.Id
        })
        relation.srcs = res.data.result.srcs.map((item) => {
          return item.Id
        })
        options[0] = res.data.result.dsts.map((item) => {
          return {
            label: item.Name,
            value: item.Id
          }
        })
        options[1] = res.data.result.srcs.map((item) => {
          return {
            label: item.Name,
            value: item.Id
          }
        })
        queryRelation('', 0, 1).then(() => {
          loading[0] = false
        })
        if (!isScheduleAgent(agent))
          queryRelation('', 1, 1).then(() => {
            loading[1] = false
          })
      }
    })
  }
  else {
    queryRelation('', 0, 1).then(() => {
      loading[0] = false
    })
    if (!isScheduleAgent(agent))
      queryRelation('', 1, 1).then(() => {
        loading[1] = false
      })
  }
}
initRelation()
const save = async (): Promise<number | string> => {
  try {
    await nameRef.value.validate().catch(() => {
      return Promise.reject('Name cannot be empty');
    });
    if (isScheduleAgent(agent)) {
      if (cronValidate(agent.propJsonStr.cron)) {
        const agentReal: AgentNew<string> = {
          name: agent.name,
          enable: agent.enable,
          typeId: agent.typeId,
          description: agent.description,
          eventForever: agent.eventForever,
          eventMaxAge: agent.eventMaxAge,
          propJsonStr: JSON.stringify(agent.propJsonStr),
        };

        if (props.mode === 'add') {
          const res = await axios.put("/agent", agentReal);
          if (res.data.code === 200) {
            return Promise.resolve(res.data.result.id);
          } else {
            return Promise.reject(res.data.msg);
          }
        } else if (props.mode === 'edit') {
          const res = await axios.post("/agent", Object.assign({}, agentReal, { id: props.ids }));
          if (res.data.code === 200) {
            return Promise.resolve(0);
          } else {
            return Promise.reject(res.data.msg);
          }
        } else {
          return Promise.reject();
        }
      } else {
        message.error('Invalid Cron');
        return Promise.reject();
      }
    } else if (isHttpAgent(agent)) {
      if(agent.propJsonStr.urls.length==0||agent.propJsonStr.urls[0]==''){
        message.error('Urls can not be empty')
        return Promise.reject()
      }
      const tempA=agent.propJsonStr
      if(agent.propJsonStr.selectors[0].varName==''&&agent.propJsonStr.selectors[0].selectorType==''&&agent.propJsonStr.selectors[0].selectorContent==''){
        tempA.selectors=[]
      }
      const agentReal: AgentNew<string> = {
        name: agent.name,
        enable: agent.enable,
        typeId: agent.typeId,
        description: agent.description,
        eventForever: agent.eventForever,
        eventMaxAge: agent.eventMaxAge,
        propJsonStr: JSON.stringify(tempA),
      };

      if (props.mode === 'add') {
        const res = await axios.put("/agent", agentReal);
        if (res.data.code === 200) {
          return Promise.resolve(res.data.result.id);
        } else {
          return Promise.reject(res.data.msg);
        }
      } else if (props.mode === 'edit') {
        const res = await axios.post("/agent", Object.assign({}, agentReal, { id: props.ids }));
        if (res.data.code === 200) {
          return Promise.resolve(0);
        } else {
          return Promise.reject(res.data.msg);
        }
      } else {
        return Promise.reject();
      }
    }else if(isRssAgent(agent)) {
      
      const agentReal: AgentNew<string> = {
          name: agent.name,
          enable: agent.enable,
          typeId: agent.typeId,
          description: agent.description,
          eventForever: agent.eventForever,
          eventMaxAge: agent.eventMaxAge,
          propJsonStr: JSON.stringify(agent.propJsonStr),
        };

        if (props.mode === 'add') {
          const res = await axios.put("/agent", agentReal);
          if (res.data.code === 200) {
            return Promise.resolve(res.data.result.id);
          } else {
            return Promise.reject(res.data.msg);
          }
        } else if (props.mode === 'edit') {
          const res = await axios.post("/agent", Object.assign({}, agentReal, { id: props.ids }));
          if (res.data.code === 200) {
            return Promise.resolve(0);
          } else {
            return Promise.reject(res.data.msg);
          }
        } else {
          return Promise.reject();
        }
    }
    else {
      return Promise.reject();
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const saveWrapper = () => {
  save().then(async (resx: number | string) => {
    //Update relation
    if (resx == -1)
      return
    relation.agentId = (resx == 0 ? props.ids as number : resx) as number
    //如果srcs或dsts为空，设置为[0]
    const tempRelation = JSON.parse(JSON.stringify(relation))
    if (tempRelation.srcs.length == 0)
      tempRelation.srcs = []
    if (tempRelation.dsts.length == 0)
      tempRelation.dsts = []
    await axios.post('/agent-relation', tempRelation).then((res: AxiosResponse<Response<null>>) => {
      if (res.data.code == 200) {
        if (resx != 0) {
          message.success('Add Success')
          router.back()
        }
        else {
          message.success('Update Success')
          router.back()
        }
      }
    })



  }).catch((resxx) => { resxx!=''&&resxx!=undefined?message.error(resxx):null });
}
watch(()=>agent.typeId,()=>{
  
  showIn.value=false
  nextTick().then(()=>{
    showIn.value=true
  })
})
watch(()=>props.data,(val)=>{
    //把props.data按键值对赋值给agent
    Object.assign(agent, JSON.parse(JSON.stringify(val)));
},{deep:true})
watch(relation, (val) => {

}, { deep: true })
</script>
<style scoped>
.home {
  --animate-duration: 0.8s;
}
</style>
