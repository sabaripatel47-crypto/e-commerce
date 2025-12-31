<template>
  <div>
    <ProductSpu :entrance="entrance"></ProductSpu>
  </div>
</template>
<script>
import ProductSpu from '@/views/bulletinboard/components/ProductSpu.vue'

export default {
  name: 'Product',
  data() {
    return {
      entrance: 'menu',
    }
  },
  components: { ProductSpu },
  async created() {},
  methods: {},
}
</script>
<style lang="scss" scoped></style>
