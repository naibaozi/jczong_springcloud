<template>
  <h1>{{ msg }}</h1>
  <button @click="goTest">前往测试页</button>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const msg = ref('Hello, World!')
const goTest = () => {
  router.push('/test')
}

</script>


<style scoped>

</style>