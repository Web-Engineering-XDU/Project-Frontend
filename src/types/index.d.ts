import { selectors } from './index.d';
import { Agent } from './../../types/index';

export interface Agent {
    id: number
    enable: boolean
    typeId: number
    eventForever: boolean
    eventMaxAge: number
    propJsonStr: string
    allowInput: boolean
    allowOutput: boolean
    name: string
    description: string
    createAt: string
    typeName: string
}
export interface Response<T> extends SimpleResponse {
    result: {
        content: Array<T>
        count: number
        totalCount: number
    }
}
export interface SimpleResponse {
    code: number
    msg: string
}
export interface AgentNew<T> {
    name: string
    enable: boolean
    typeId: number
    description: string
    eventForever: boolean
    eventMaxAge: number
    propJsonStr: T
}
export interface ScheduleAgent {
    cron: string

}
export interface selectors {
    varName: string,
    selectorType: string,
    selectorContent: string
}
export interface HttpAgent {
    onUpdate: bool,
    mergeEvent: bool,
    urls: string[],
    method: string,
    header: {
        [propName: string]: string
    },
    body: string,
    template: {
        [propName: string]: string
    },
    docType: 'html' | 'json',
    selectors: selectors[]
}
export interface Relations {
    agentId: number,
    dsts: number[],
    srcs: number[]
}
export interface Event{
    createdAt: string,
    deleteAt: string,
    error: boolean,
    id: number,
    jsonStr: string,
    log: string,
    srcAgentId: number
}