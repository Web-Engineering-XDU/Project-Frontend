import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const logged= ref(true)
  const Axios=ref(axios.create({
    baseURL:'http://43.142.105.98:8080/'
  }))
  return { count,logged,Axios }
})
