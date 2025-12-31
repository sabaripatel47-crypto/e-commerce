<template>
  <div>
    <ProductSku :entrance="entrance"></ProductSku>
  </div>
</template>
<script>
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'

export default {
  name: 'SkuDate',
  data() {
    return {
      entrance: 'menu',
    }
  },
  components: { ProductSku },
  async created() {},
  methods: {},
}
</script>
<style lang="scss" scoped></style>
