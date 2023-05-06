import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const logged= ref(false)
  const Axios=axios.create({
    baseURL:'http://localhost:3000'
  })
  return { count,logged,Axios }
})
