import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'

export const SchemaOrgDebug = defineComponent({
  name: 'SchemaOrgDebug',
  props: {
    console: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const schemaRaw = ref('')
    let observer: MutationObserver

    onMounted(() => {
      nextTick(() => {
        let $el = document.querySelector('script[type="application/ld+json"]')
        if (!$el)
          return

        const fetchSchema = () => {
          $el = document.querySelector('script[type="application/ld+json"]')
          schemaRaw.value = $el?.textContent || ''
        }

        // Create an observer instance linked to the callback function
        observer = new MutationObserver(fetchSchema)

        // Start observing the target node for configured mutations
        observer.observe(document.body, {
          childList: true,
          characterData: true,
          attributes: true,
          subtree: true,
        })

        fetchSchema()
      })
    })

    if (props.console) {
      watch(schemaRaw, (val) => {
        // eslint-disable-next-line no-console
        console.info('[SchemaOrgDebug]', JSON.parse(unref(val)))
      })
    }

    onBeforeUnmount(() => {
      observer?.disconnect()
    })

    return () => {
      return h('div', {
        style: {
          display: 'inline-block',
        },
      }, [h('div', {
        style: {
          backgroundColor: '#282839',
          color: '#c5c6c9',
          padding: '5px',
          borderRadius: '5px',
          width: '900px',
          height: '600px',
          overflowY: 'auto',
          boxShadow: '3px 4px 15px rgb(0 0 0 / 10%)',
        },
        tabindex: 0,
      }, [
        h('pre', { style: { textAlign: 'left' } }, schemaRaw.value),
      ])])
    }
  },
})
