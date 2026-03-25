<script lang="ts" setup>
useSchemaOrg([
  defineWebSite(),
  defineWebPage(),
])
</script>

<template>
  <div>
    <h1>Blog</h1>
    <ul>
      <li>
        <NuxtLink to="/blog/my-post">
          My Blog Post
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
