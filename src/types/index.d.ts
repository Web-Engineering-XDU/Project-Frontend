
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
/*{
    "title": "feed标题",
    "link": "feed链接",
    "description": "feed简介",
    "author": "feed管理者",
    "template": {
      "title": "{{*item标题}}",
      "link": "{{*item链接}}",
      "description": "{{*item简介}}",
      "author": "{{*item内容原作者}}"
    }
  }*/
export interface RssAgent{
    title: string,
    link: string,
    description: string,
    author: string,
    template: {
        title: string,
        link: string,
        description: string,
        author: string
    }
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
    srcAgentName: string,
}