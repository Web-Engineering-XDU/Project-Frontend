<template>
    <div style="padding-top:20px">
        <n-config-provider :hljs="hljs">
            <n-skeleton v-if="loading" text style="width:200px" />
            <n-page-header v-else :title="'Event ' + event.id + ' Details'" @back="$router.back"></n-page-header>
            <n-list style="padding-top:20px">
                <n-list-item>
                    <n-skeleton v-if="loading" text style="width:220px" />
                    <div v-else><span style="font-weight:800;padding-right:15px">Created At:</span>{{ new
                        Date(event.createAt).toLocaleString() }}</div>
                </n-list-item>
                <n-list-item>
                    <n-skeleton v-if="loading" text style="width:210px" />
                    <div v-else><span style="font-weight:800;padding-right:15px">Life Left:</span>{{ time }}</div>
                </n-list-item>
                <n-list-item>
                    <n-skeleton v-if="loading" text style="width:200px" />
                    <div v-else><span style="font-weight:800;padding-right:15px">Src Agent:</span><n-a
                            @click="router.push('/agents?id=' + event.srcAgentId)">{{ event.srcAgentName }}</n-a></div>
                </n-list-item>
                <n-list-item>
                    <n-skeleton v-if="loading" text style="width:300px;max-width:100%" />
                    <div v-else><span style="font-weight:800;padding-right:15px">Props:</span><n-code word-wrap
                            :code="event.jsonStr != undefined ? JSON.stringify(JSON.parse(event.jsonStr), null, 2) : ''"
                            language="json"></n-code></div>
                </n-list-item>
            </n-list>
        </n-config-provider>
    </div>
</template>
<script setup lang="ts">
import hljs from 'highlight.js';
import type { Event, Response } from '@/types';
import { useCounterStore } from '@/stores/counter';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AxiosResponse } from 'axios';
import { useMessage } from 'naive-ui';
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)
const router = useRouter();
const axios = useCounterStore().Axios;
const loading = ref(true);
const message = useMessage();
const event = ref<Event>({} as Event);
const route = useRoute();
axios
    .get('/event', {
        params: {
            eventId: route.params.id,
            page: 1,
            number: 10
        },
    })
    .then((res: AxiosResponse<Response<Event>>) => {
        if (res.data.code == 200) {
            let success = false;
            if (res.data.result.content.length == 0) {
                message.error('Event not found');
                router.back();
                return;
            }

            event.value = res.data.result.content[0]
            success = true

            if (!success) {
                message.error('Event not found');
                router.back();
                return;
            }
            loading.value = false;
        }
    });
const time = computed(() => {
    const createAt = new Date(event.value.createAt)
    const deleteAt = new Date(event.value.deleteAt)
    const now = new Date()
    //如果deleteAt和createAt相差100年以上，那么就是永久的
    if (deleteAt.getFullYear() - createAt.getFullYear() >= 100) {
        return 'Infinite'
    }
    else {
        //返回deleteAt和现在的时间差
        return timeConvert(deleteAt.getTime() - now.getTime())
    }
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
    if (minute > 0) return minute + ' minutes' + second + ' seconds'
    else return second + ' seconds'
}
</script>