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
export interface Response<T> {
    code: number
    msg: string
    result: {
        content: Array<T>
        count: number
        totalCount:number
    }
}
