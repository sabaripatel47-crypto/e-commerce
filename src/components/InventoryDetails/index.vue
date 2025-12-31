<template>
  <!-- 总库存 -->
  <div>
    <el-dialog :visible.sync="visible" append-to-body @close="closeDialog" width="40%" :center="true">
    <el-table
        border
        :data="tableData"
        center
        >
        <el-table-column
          prop="date"
          label="序号"
          min-width="25"
          type="index"
          align="center"
        ></el-table-column>
        
        <el-table-column prop="warehouseName" label="仓库名称" align="center"></el-table-column>
        <el-table-column prop="warehouseStockNum" label="库存" align="center"></el-table-column>
        

    </el-table>
    </el-dialog>
    
  </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
</template>

<script>
export default {
  name: 'InventoryDetails',
  data () {
    return {
      visible: false
    }
  },
  props:{
    tableData:{
      type:Array,
      default:()=>[]
    }
  },
  methods:{
    openDialog(){
      this.visible = true
    },
    closeDialog(){
      this.visible = false
    }
  }                                                                                                                                                         
}
</script>

<style lang="scss" scoped>
/* 使 el-dialog 在页面中上下居中 */
.el-dialog__wrapper {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  min-height: 100vh; /* 使弹框至少占满整个页面高度 */
}

.el-dialog {
  margin: 0 auto; /* 水平居中 */
}
</style>