<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'

definePageMeta({
  description: 'High quality hamburgers delivered fresh to you.',
})
useHead({
  title: 'Harlan Hamburgers 🍔',
})
</script>

<template>
  <div>
    <div class="max-w-[30rem] my-10">
      <h2 class="text-3xl mb-5">
        The best burgers in town!
      </h2>
      <div class="text-xl font-light mb-5">
        <p class="mb-3">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aperiam, aspernatur consequuntur corporis debitis eaque eveniet incidunt inventore provident quam, quas quasi tempore vel! Dolorum est pariatur quas quos sint?
        </p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores aspernatur, at beatae debitis, dolores eum eveniet hic maiores minus optio quaerat sunt vel voluptate? Cupiditate quas quidem reiciendis tempora velit?</p>
      </div>
    </div>
    <div class="mb-5">
      🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔🍔
    </div>
  </div>
</template>
