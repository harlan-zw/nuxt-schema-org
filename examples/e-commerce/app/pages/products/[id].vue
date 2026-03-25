<script lang="ts" setup>
useSchemaOrg([
  defineProduct({
    name: 'Example Product',
    description: 'A fantastic product with Schema.org structured data.',
    image: '/product.png',
    offers: [
      {
        price: 29.99,
        priceCurrency: 'USD',
        availability: 'InStock',
      },
    ],
  }),
])
</script>

<template>
  <div>
    <h1>Example Product</h1>
    <p>$29.99</p>
    <p>This page has Product structured data with offers.</p>
  </div>
</template>
