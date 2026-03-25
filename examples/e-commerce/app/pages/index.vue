<script lang="ts" setup>
useSchemaOrg([
  defineWebSite(),
  defineWebPage(),
])
</script>

<template>
  <div>
    <h1>My Store</h1>
    <ul>
      <li>
        <NuxtLink to="/products/example-product">
          Example Product - $29.99
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
