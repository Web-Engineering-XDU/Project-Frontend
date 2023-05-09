<template>
  <div style="width: 100%" class="home">
    <TransitionGroup enter-active-class="animate__animated animate__fadeIn">
      <n-form-item ref="nameRef" :rule="valiName" :key="1" label="Name"
        ><n-input v-model:value="agent.name"></n-input
      ></n-form-item>
      <n-form-item :key="2" label="Enabled"
        ><n-switch
          size="large"
          :rail-style="
            () => {
              return { width: '234px' };
            }
          "
          v-model:value="agent.enable"
        >
          <template #checked>
            <div style="text-align: center; padding-right: 25px">Run When Triggered</div>
          </template>
          <template #unchecked>
            <div style="text-align: center; padding-left: 55px">Run Never</div>
          </template>
        </n-switch></n-form-item
      >
      <n-form-item :key="3" v-if="id == 2" label="Event Forever"
        ><n-switch size="large" v-model:value="agent.eventForever">
          <template #checked> Events Destroyed Sometime </template>
          <template #unchecked>
            <div style="text-align: center; padding-left: 13px">
              Events Never Destroyed
            </div>
          </template>
        </n-switch>
      </n-form-item>
      <n-form-item :key="4" v-if="agent.eventForever && id == 2" label="Event Max Age"
        ><n-input
          style="margin-right: 6px; width: calc(33% - 4px)"
          v-model:value="time[0]"
          placeholder="Day"
        ></n-input
        ><n-input
          style="margin-right: 6px; width: calc(33% - 4px)"
          v-model:value="time[1]"
          placeholder="Minute"
        ></n-input
        ><n-input
          style="width: calc(33% - 4px)"
          v-model:value="time[2]"
          placeholder="Second"
        ></n-input
      ></n-form-item>
      <n-form-item :key="5" label="Description"
        ><n-input type="textarea" v-model:value="agent.description"></n-input>
      </n-form-item>
      <n-h3 style="margin-top: -10px" :key="6">Props</n-h3>
      <template v-for="(item, key) of agent!.propJsonStr" :key="key">
        <template v-if="typeof item == 'object'">
          <template v-if="((item as any) instanceof Array)">
            <n-form-item
              v-if="typeof item[0] !== 'object' && key != 'selectors'"
              :label="splitUpper(key)"
            >
              <n-dynamic-input
                v-model:value="agent.propJsonStr[key]"
                :placeholder="splitUpper('pleaseInput')"
                :min="1"
              />
            </n-form-item>
            <n-form-item v-else :label="splitUpper(key)">
              <n-dynamic-input
                v-model:value="agent.propJsonStr[key]"
                :min="0"
                :on-create="onCreate"
              >
                <template #default="{ value }">
                  <n-input
                    v-model:value="value.varName"
                    :placeholder="splitUpper('varName')"
                  />
                  <n-input
                    v-model:value="value.selectorType"
                    :placeholder="splitUpper('selectorType')"
                    style="margin-left: 10px"
                  />
                  <n-input
                    v-model:value="value.selectorContent"
                    :placeholder="splitUpper('selectorContent')"
                    style="margin-left: 10px"
                  />
                </template>
              </n-dynamic-input>
            </n-form-item>
          </template>
          <template v-else>
            <n-form-item :label="splitUpper(key)">
              <n-dynamic-input
                v-if="key == 'header'"
                v-model:value="tempHeader"
                :min="0"
                preset="pair"
                key-placeholder="Key"
                value-placeholder="Value"
              >
              </n-dynamic-input>
              <n-dynamic-input
                v-if="key == 'template'"
                v-model:value="tempTemplate"
                :min="0"
                preset="pair"
                key-placeholder="Key"
                value-placeholder="Value"
              >
              </n-dynamic-input>
            </n-form-item>
          </template>
        </template>
        <n-form-item
          :ref="key == 'cron' ? 'cronRef' : undefined"
          v-else
          :label="splitUpper(key)"
          :rule="key == 'cron' ? rule : undefined"
          ><n-input
            v-if="typeof item == 'string'"
            v-model:value="agent.propJsonStr[key]" /><n-switch
            v-model:value="agent.propJsonStr[key]"
            v-else-if="typeof item == 'boolean'"
          ></n-switch
        ></n-form-item>
      </template>
    </TransitionGroup>
    <n-button type="primary" @click="save">Save</n-button>
    <n-button style="margin-left: 10px">Dry Run</n-button>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { useCounterStore } from "@/stores/counter";
import type { AgentNew, HttpAgent, ScheduleAgent } from "@/types";
import { useMessage } from "naive-ui";
import RangeRenderVue from "./RangeRender.vue";
import { useRouter } from "vue-router";
interface keyValue {
  key: string;
  value: string;
}
const axios = useCounterStore().Axios;
const message = useMessage();
const tempHeader = ref<keyValue[]>([]);
const tempTemplate = ref<keyValue[]>([]);
const props = defineProps({
  id: Number,
});
const nameRef = ref();
const valiName = ref({
  trigger: ["blur"],
  required: true,
  validator() {
    if (agent.name == "") {
      return new Error("Name cannot be empty");
    }
  },
});
const cronRef = ref();
const time = ref(["", "", ""]);
function init<T extends number>(id: T): AgentNew<ScheduleAgent | HttpAgent> {
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
        header: { sd: "s" },
        body: "",
        template: {},
        docType: "",
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
console.log((agent.propJsonStr as HttpAgent).urls instanceof Array);
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
    console.log(JSON.stringify(agent.propJsonStr));
  }
);
watch(
  () => time,
  (val: any) => {
    //以nanosecond存储
    agent.eventMaxAge =
      val[0] * 24 * 60 * 60 * 1000 * 1000 * 1000 +
      val[1] * 60 * 1000 * 1000 * 1000 +
      val[2] * 1000 * 1000 * 1000;
  },
  { deep: true }
);
const save = () => {
  nameRef.value
    .validate()
    .then(() => {
      if (props.id == 1)
        cronRef.value[0]
          .validate()
          .then(() => {
            if (props.id == 2) {
              agent.propJsonStr.header = {};
              agent.propJsonStr.template = {};
              tempHeader.value.forEach((item) => {
                agent.propJsonStr.header[item.key] = item.value;
              });
              tempTemplate.value.forEach((item) => {
                agent.propJsonStr.template[item.key] = item.value;
              });
            }
            //Add Content-Type: application/x-www-form-urlencoded in axios
            const agentReal: AgentNew<string> = {
              name: agent.name,
              enable: agent.enable,
              typeId: agent.typeId,
              description: agent.description,
              eventForever: agent.eventForever,
              eventMaxAge: agent.eventMaxAge,
              propJsonStr: JSON.stringify(agent.propJsonStr),
            };
            axios.put("/agent", agentReal).then((res) => {
              if (res.data.code == 200) {
                message.success("Save success!");
                setTimeout(() => {
                  router.push("/agents");
                }, 50);
              }
            });
          })
          .catch(() => {});
      else {
        if (props.id == 2) {
          agent.propJsonStr.header = {};
          agent.propJsonStr.template = {};
          tempHeader.value.forEach((item) => {
            agent.propJsonStr.header[item.key] = item.value;
          });
          tempTemplate.value.forEach((item) => {
            agent.propJsonStr.template[item.key] = item.value;
          });
        }
        //Add Content-Type: application/x-www-form-urlencoded in axios
        const agentReal: AgentNew<string> = {
          name: agent.name,
          enable: agent.enable,
          typeId: agent.typeId,
          description: agent.description,
          eventForever: agent.eventForever,
          eventMaxAge: agent.eventMaxAge,
          propJsonStr: JSON.stringify(agent.propJsonStr),
        };
        axios.put("/agent", agentReal).then((res) => {
          if (res.data.code == 200) {
            message.success("Save success!");
            setTimeout(() => {
              router.push("/agents");
            }, 50);
          }
        });
      }
    })
    .catch(() => {});
};
</script>
<style scoped>
.home {
  --animate-duration: 0.8s;
}
</style>
