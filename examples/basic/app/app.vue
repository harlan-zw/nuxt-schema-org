<script lang="ts" setup>
useSchemaOrg([
  defineWebSite(),
  defineWebPage(),
])
</script>

<template>
  <div>
    <h1>Schema.org Basic Example</h1>
    <p>This example adds WebSite and WebPage structured data.</p>
    <p>Inspect the page source to see the JSON-LD script tag.</p>
  </div>
</template>
