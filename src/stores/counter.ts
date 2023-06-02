import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const logged= ref(true)
  const Axios=ref(axios.create({
    baseURL:'https://spm.guchen.work:8080/',

  }))
  return { count,logged,Axios }
})
