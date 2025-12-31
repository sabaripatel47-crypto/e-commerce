<template>
  <div>
    <PurchaseRecordDetails :fromType.sync="fromType"></PurchaseRecordDetails>
  </div>
</template>

<script>
// procurementBoard
import PurchaseRecordDetails from '../purchaseRecordDetails/index'
export default {
  name: 'ProcurementBoard',
  components: { PurchaseRecordDetails },
  data() {
    return {
      fromType: 'procurementBoard',
    }
  },
  async created() {},
  methods: {
    // 时间change
    changeTime(e) {
      console.log('e', e)
    },
  },
}
</script>

<style>
</style>