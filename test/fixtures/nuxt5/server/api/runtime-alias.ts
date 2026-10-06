import { useSchemaOrgConfig } from '#schema-org/server'
import { useSchemaOrgConfig as useNestedSchemaOrgConfig } from '#schema-org/server/utils/config'
import { defineEventHandler } from 'nuxt/server'
export default defineEventHandler(() => ({ version: useSchemaOrgConfig().version, nestedVersion: useNestedSchemaOrgConfig().version }))
