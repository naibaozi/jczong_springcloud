<template>
  <p>测试页面</p>
  <p>{{ message }}</p>
  <button @click="testPost">测试post</button>
  <button @click="testGet">测试get</button>
</template>


<script setup>

import {getStringTest, postStringTest} from "@/api/test_api.js";
import { ref } from 'vue'



const message = ref('')
const testPost = async () => {
  const res = await postStringTest()
  if (res != null){
    message.value = res
  }
}
const testGet = async () => {
  const res = await getStringTest()
  if (res != null){
    message.value = res
  }
}
</script>


<style scoped>

</style>