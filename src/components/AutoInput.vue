<script setup lang="tsx">
import { useRender } from '@/useRender'
import { ref, type PropType, reactive, type Ref,watch } from 'vue';
import { NInput, NFormItem, NDynamicInput, NInputNumber, NSwitch } from 'naive-ui'
interface TypeProps {
    [key: string]: number | string | boolean | Array<string> | TypeProps | simpleObject
}
interface simpleObject {
    [key: string]: string
}
const props = defineProps(
    {
        renderData: {
            type: Object as PropType<TypeProps>,
            required: true
        }
    }
)
const splitUpper = (str: string) => {
  //把首字母大写并按大写字母用空格分割
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};
const templist = ref<Ref<record>[]>([])
const x = reactive(JSON.parse(JSON.stringify(props.renderData)))
const isTypeProps = (props: any) => {
    let t = 0
    if (typeof props !== 'object') {
        return false
    }
    while (t < Object.keys(props).length) {
        if (typeof Object.values(props)[t] === 'string') {
            t++
        }
        else if (typeof Object.values(props)[t] === "number") {
            t++
        }
        else if (typeof Object.values(props)[t] === "boolean") {
            t++
        }
        //is array
        else if (typeof Object.values(props)[t] === "object" && Array.isArray(Object.values(props)[t])) {
            t++
        }
        //is TypeProps
        else if (typeof Object.values(props)[t] === "object" && !Array.isArray(Object.values(props)[t])) {
            if (isTypeProps(Object.values(props)[t])||(Object.values(props).length == 0 || typeof Object.values(props)[0] == 'string')) {
                t++
            }
        }
    }
    return t === Object.keys(props).length
}
const isSimpleObject = (xs: any) => {
    if (typeof xs === "object" && !Array.isArray(Object.values(xs)[0])) {
        console.log(1)
        if (Object.values(xs).length == 0) {
            console.log(2)
            return true
        }
    }
}
watch(
    () => props.renderData,
    (newVal: TypeProps) => {
        console.log('sdx')
        if((JSON.stringify(newVal))==(JSON.stringify(x))){
            return
        }
        console.log('sd')
        Object.assign(x, reactive(newVal))
        //给templist内部重新赋值
        for(let i in templist.value){
            const result=search(templist.value[i].value.location,templist.value[i].value.key,x)
            if(result==false){
                continue
            }
            else{
                const xresult=result as TypeProps
                //根据xresult给templist.value[i].record重新赋值
                templist.value[i].value.record=[]
                for(let j in xresult[templist.value[i].value.key] as TypeProps){
                    templist.value[i].value.record.push({key:j,value:(xresult as any)[templist.value[i].value.key][j]})
                }
            }
        }
    }
    , { deep: true }
)
const emit = defineEmits(['update:renderData'])
watch(
    () => x,
    (newVal: TypeProps) => {
        if((JSON.stringify(newVal))==(JSON.stringify(props.renderData))){
            return
        }
        emit('update:renderData', JSON.parse(JSON.stringify(newVal)))
        console.log('update')
    },
    { deep: true }
)
const tempTemp=ref<Ref<record>[]>([])
watch(
    () => templist.value,
    (newVal: Ref<record>[]) => {
        console.log('Started')
        //阻止循环调用
        if(templist.value.length==0){
            return
        }
        if(JSON.stringify(templist.value)==JSON.stringify(tempTemp.value)){
            return
        }
        let i=false;
        templist.value.forEach((item,index)=>{
            if(item.value.record.length>0){
                i=true
            }
        })
        if(!i)
        {
            return
        }
        for(let i of newVal){
            //递归查找对应location和key的变量
            const result=search(i.value.location,i.value.key,x)
            console.log(result)
            if(result==false){
                continue
            }
            else{
                const xresult=result as TypeProps
                xresult[i.value.key]={}
                for(let j of i.value.record){
                    if(j.key==''){
                        continue
                    }
                    (xresult[i.value.key] as any)[j.key]=j.value
                }
            }
        }
        tempTemp.value=JSON.parse(JSON.stringify(templist.value))

    },
    { deep: true }
)
const search=(location:TypeProps,key:string,total:TypeProps):boolean|TypeProps=>{
    //递归查找对应location和key的变量
    let t=0
    //递归
    const keys=Object.keys(location)
    if(location==total&&keys.includes(key)){
        return location
    }
    while(t<keys.length){
        if(isTypeProps(location[keys[t]])){
            return search(location,key,location[keys[t]] as TypeProps)
        }
    }
    return false
}
interface keyValue {
    key: string,
    value: string
}
interface record {
    location: TypeProps,
    key: string,
    record: keyValue[]
}
const inTempList = (key: string, props: TypeProps) => {
    let t = 0
    while (t < templist.value.length) {
        if (templist.value[t].value.key == key && templist.value[t].value.location == props) {
            return true
        }
        t++
    }
    return false
}
const renderFn = (props: TypeProps) => {
    let t = 0
    let rend = <div></div>
    while (t < Object.keys(props).length) {
        const temp = Object.keys(props)[t]
        if (typeof Object.values(props)[t] === 'string') {
            rend = <>{rend} <NFormItem label={splitUpper(temp)}><NInput value={props[temp] as string} onUpdate:value={(E: any) => props[temp] = E}></NInput></NFormItem></>

            t++
        }
        else if (typeof Object.values(props)[t] === "number") {
            rend = <>{rend} <NFormItem label={splitUpper(temp)}><NInputNumber value={props[temp] as number} onUpdate:value={(E: any) => props[temp] = E}></NInputNumber></NFormItem></>

            t++
        }
        else if (typeof Object.values(props)[t] === "boolean") {
            rend = <>{rend} <NFormItem label={splitUpper(temp)}><NSwitch value={props[temp] as number} onUpdate:value={(E: any) => props[temp] = E}></NSwitch></NFormItem></>
            t++
        }
        //is array<string>
        else if (typeof Object.values(props)[t] === "object" && Array.isArray(Object.values(props)[t])) {
            rend = <>{rend} <NFormItem label={splitUpper(temp)}><NDynamicInput value={props[temp] as Array<any>} onUpdate:value={(E: any) => props[temp] = E}></NDynamicInput></NFormItem></>
            t++
        }
        //is TypeProps
        else if (isTypeProps(Object.values(props)[t])) {
            if (isSimpleObject(Object.values(props)[t]) || inTempList(temp, props)) {
                if (!inTempList(temp, props)) {
                    const tempSet = ref<record>({ location: props, key: temp, record: [] })
                    rend = <>{rend}<NFormItem label={splitUpper(temp)}><NDynamicInput preset='pair' value={tempSet.value.record} onUpdate:value={(e: any) => tempSet.value.record = e}></NDynamicInput></NFormItem></>
                    templist.value.push(tempSet)
                }
                else {
                    let s = 0
                    while (s < templist.value.length) {
                        if (templist.value[s].value.key == temp && templist.value[s].value.location == props) {
                            rend = <>{rend}<NFormItem label={splitUpper(temp)}><NDynamicInput preset='pair' value={templist.value[s].value.record} onUpdate:value={(e: any) => templist.value[s].value.record = e}></NDynamicInput></NFormItem></>
                            break
                        }
                        s++
                    }
                }
                t++
            }
            else {
                rend = <>{rend}<NFormItem label={splitUpper(temp)}><div style='padding-left:10px'>{renderFn(props[temp] as TypeProps)} </div></NFormItem></>
                t++
            }
        }
        //is simpleObject
        else {
            //push error
            new Error('props type error')
        }
    }
    return rend
}
useRender(() => {
    return <div>{renderFn(x)}</div>
})
</script>

