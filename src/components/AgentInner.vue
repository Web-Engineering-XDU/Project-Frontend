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
          <template #checked> Events Destroyed Sometime </template>
          <template #unchecked>
            <div style="text-align: center; padding-left: 13px">
              Events Never Destroyed
            </div>
          </template>
        </n-switch>
      </n-form-item>
      <n-form-item :key="4" v-if="agent.eventForever && !isScheduleAgent(agent)" label="Event Max Age"><n-input-number
          :min="0" style="margin-right: 6px; width: calc(33% - 4px)" v-model:value="time[0]"
          placeholder="Day"></n-input-number><n-input-number :min="0" style="margin-right: 6px; width: calc(33% - 4px)"
          v-model:value="time[1]" placeholder="Minute"></n-input-number><n-input-number :min="0"
          style="width: calc(33% - 4px)" v-model:value="time[2]" placeholder="Second"></n-input-number></n-form-item>
      <n-form-item :key="5" label="Description"><n-input type="textarea" v-model:value="agent.description"></n-input>
      </n-form-item>
      <n-h3 style="margin-top: -10px" :key="6">Props</n-h3>
      <template v-for="(item, key) of agent!.propJsonStr" :key="key">
        <template v-if="typeof item == 'object'">
          <template v-if="((item as any) instanceof Array)">
            <n-form-item :ref="key == 'urls' ? 'urlsRef' : undefined"
              v-if="typeof item[0] !== 'object' && key != 'selectors'" :label="splitUpper(key)"
              :rule="key == 'urls' ? ruleUrl : undefined">
              <n-dynamic-input v-model:value="agent.propJsonStr[key]" :placeholder="splitUpper('pleaseInput')" :min="1" />
            </n-form-item>
            <n-form-item v-else :label="splitUpper(key)">
              <n-dynamic-input v-model:value="agent.propJsonStr[key]" :min="0" :on-create="onCreate">
                <template #default="{ value }">
                  <n-input v-model:value="value.varName" :placeholder="splitUpper('varName')" />
                  <n-input v-model:value="value.selectorType" :placeholder="splitUpper('selectorType')"
                    style="margin-left: 10px" />
                  <n-input v-model:value="value.selectorContent" :placeholder="splitUpper('selectorContent')"
                    style="margin-left: 10px" />
                </template>
              </n-dynamic-input>
            </n-form-item>
          </template>
          <template v-else>
            <n-form-item :label="splitUpper(key)">
              <n-dynamic-input v-if="key == 'header'" v-model:value="tempHeader" :min="0" preset="pair"
                key-placeholder="Key" value-placeholder="Value">
              </n-dynamic-input>
              <n-dynamic-input v-if="key == 'template'" v-model:value="tempTemplate" :min="0" preset="pair"
                key-placeholder="Key" value-placeholder="Value">
              </n-dynamic-input>
            </n-form-item>
          </template>
        </template>
        <n-form-item :ref="key == 'cron' ? 'cronRef' : undefined" v-else :label="splitUpper(key)"
          :rule="key == 'cron' ? rule : undefined"><n-select v-if="key == 'docType' || key == 'method'"
            v-model:value="agent.propJsonStr[key]" :options="key == 'docType' ? typeOpt : methodOpt"
            :filterable="key == 'method'" :tag="key == 'method'"></n-select>
          <n-input :type="key == 'body' ? 'textarea' : ''" v-else-if="typeof item == 'string'"
            v-model:value="agent.propJsonStr[key]" /><n-switch v-model:value="agent.propJsonStr[key]"
            v-else-if="typeof item == 'boolean'"></n-switch></n-form-item>
      </template>
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
    <n-button type="primary" @click="save">Save</n-button>
    <n-button style="margin-left: 10px">Dry Run</n-button>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from "vue";
import { useCounterStore } from "@/stores/counter";
import type { AgentNew, HttpAgent, ScheduleAgent, Relations, Response } from "@/types";
import { useMessage, type SelectOption } from "naive-ui";
import RangeRenderVue from "./RangeRender.vue";
import { useRouter } from "vue-router";
import type { AxiosResponse } from "axios";
interface simple {
  Id: number,
  Name: string
}
const loading = reactive([false, false]);
const options = reactive<SelectOption[][]>([[], []]);
interface keyValue {
  key: string;
  value: string;
}
const isHttpAgent = (
  Agent: AgentNew<HttpAgent> | AgentNew<ScheduleAgent>
): Agent is AgentNew<HttpAgent> => {
  return Agent.typeId == 2;
};
const isScheduleAgent = (
  Agent: AgentNew<HttpAgent> | AgentNew<ScheduleAgent>
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
      id: props.ids,
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
      total[type] = res.data.result.totalCount+len
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
function init<T extends number>(id: T): AgentNew<ScheduleAgent> | AgentNew<HttpAgent> {
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
  } else {
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
        selectors: [],
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
  if (isHttpAgent(agent)) {
    for (const key in agent.propJsonStr.header) {
      tempHeader.value.push({
        key: key,
        value: agent.propJsonStr.header[key],
      });
    }
    for (const key in agent.propJsonStr.template) {
      tempTemplate.value.push({
        key: key,
        value: agent.propJsonStr.template[key],
      });
    }

  }
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
const initRelation=()=>{
  
}
queryRelation('', 0, 1).then(() => {
  loading[0] = false
})
queryRelation('', 1, 1).then(() => {
  loading[1] = false
})
const save = () => {
  nameRef.value
    .validate()
    .then(() => {
      if (isScheduleAgent(agent))
        cronRef.value[0]
          .validate()
          .then(() => {
            const agentReal: AgentNew<string> = {
              name: agent.name,
              enable: agent.enable,
              typeId: agent.typeId,
              description: agent.description,
              eventForever: agent.eventForever,
              eventMaxAge: agent.eventMaxAge,
              propJsonStr: JSON.stringify(agent.propJsonStr),
            };
            if (props.mode == 'add')
              axios.put("/agent", agentReal).then((res) => {
                if (res.data.code == 200) {
                  message.success("Save success!");
                  setTimeout(() => {
                    router.push("/agents");
                  }, 50);
                }
              });
            else if (props.mode == 'edit')
              axios.post("/agent", Object.assign({}, agentReal, { id: props.ids })).then((res) => {
                if (res.data.code == 200) {
                  message.success("Update success!");
                  setTimeout(() => {
                    router.push("/agents");
                  }, 50);
                }
              });
          })
          .catch(() => { });
      else if (isHttpAgent(agent)) {
        urlsRef.value[0].validate().then(() => {
          agent.propJsonStr.header = {};
          agent.propJsonStr.template = {};
          tempHeader.value.forEach((item) => {
            agent.propJsonStr.header[item.key] = item.value;
          });
          tempTemplate.value.forEach((item) => {
            agent.propJsonStr.template[item.key] = item.value;
          });

          const agentReal: AgentNew<string> = {
            name: agent.name,
            enable: agent.enable,
            typeId: agent.typeId,
            description: agent.description,
            eventForever: agent.eventForever,
            eventMaxAge: agent.eventMaxAge,
            propJsonStr: JSON.stringify(agent.propJsonStr),
          };
          if (props.mode == 'add')
            axios.put("/agent", agentReal).then((res) => {
              if (res.data.code == 200) {
                message.success("Save success!");
                setTimeout(() => {
                  router.push("/agents");
                }, 50);
              }
            });
          else if (props.mode == 'edit')
            axios.post("/agent", Object.assign({}, agentReal, { id: props.ids })).then((res) => {
              if (res.data.code == 200) {
                message.success("Update success!");
                setTimeout(() => {
                  router.push("/agents");
                }, 50);
              }
            });
        }).catch(() => { });

      }
    })
    .catch(() => { });
};
watch(relation, (val) => {
  
}, { deep: true })
</script>
<style scoped>
.home {
  --animate-duration: 0.8s;
}
</style>
