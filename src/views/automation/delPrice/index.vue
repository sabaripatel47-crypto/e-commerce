<template>
  <div class="automation_delPrice">
    <div class="form">
      <el-form label-width="100px" size="medium">
        <el-form-item label="输入定价">
          <el-input v-model="initial"></el-input>
        </el-form-item>
        <el-form-item label="满">
          <el-input v-model="full"></el-input>
        </el-form-item>
        <el-form-item label="减">
          <el-input v-model="reduce"></el-input>
        </el-form-item>
        <el-form-item label="件数">
          <el-input v-model="amount" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="总价">
          <el-input v-model="totalPrice" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="预估到手价">
          <el-input v-model="final" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DelPrice',
  data() {
    return {
      initial: null,
      full: null,
      reduce: null,
    }
  },
  computed: {
    amount() {
      let amount = 0
      amount = Math.ceil(this.full / this.initial)
      return amount
    },
    totalPrice() {
      let totalPrice = 0
      totalPrice = (this.initial * this.amount).toFixed(2)
      return totalPrice
    },
    final() {
      let final = 0
      final = ((this.totalPrice - this.reduce) / this.amount).toFixed(2)
      return final
    },
  },
}
</script>

<style scoped>
.automation_delPrice {
  padding: 40px;
}
.form {
  width: 400px;
  margin: auto;
}
</style>