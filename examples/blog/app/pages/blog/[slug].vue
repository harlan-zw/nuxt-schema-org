<script lang="ts" setup>
useSchemaOrg([
  defineArticle({
    headline: 'My Blog Post',
    description: 'An example blog post with Schema.org structured data.',
    image: '/og.png',
    datePublished: '2025-01-01',
    dateModified: '2025-01-15',
    author: {
      name: 'John Doe',
      url: 'https://example.com/about',
    },
  }),
])
</script>

<template>
  <article>
    <h1>My Blog Post</h1>
    <p>This page has Article structured data.</p>
  </article>
</template>
