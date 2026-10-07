<template>
  <SchemaOrgArticle as="article" headline="Slot Article">
    <template #default="{ headline }">
      <h1>{{ headline }}</h1>
    </template>
  </SchemaOrgArticle>
</template>
