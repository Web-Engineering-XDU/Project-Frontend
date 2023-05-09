<template>
  <n-form-item
    v-for="(item, key) of agent!.propJsonStr"
    :key="key"
    :label="splitUpper(key)"
    :rule="key == 'cron' ? rule : undefined"
    ><n-input
      v-if="typeof item == 'string'"
      v-model:value="agent!.propJsonStr[key]" /><n-switch
      v-model:value="agent!.propJsonStr[key]"
      v-else-if="typeof item == 'boolean'"
    ></n-switch
  ></n-form-item>
</template>
<script setup lang="ts">
import type { AgentNew, HttpAgent, ScheduleAgent } from "@/types";
import { ref, type PropType, watch } from "vue";
const props=defineProps({
    agent: Object as PropType<AgentNew<ScheduleAgent | HttpAgent>>,
});
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

const splitUpper = (str: string) => {
  //把首字母大写并按大写字母用空格分割
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};
const rule = ref({
  trigger: ["blur"],
  validator() {
    if (!cronValidate((props.agent!.propJsonStr as ScheduleAgent).cron)) {
      return new Error("Syntax Error");
    }
  },
});
</script>
