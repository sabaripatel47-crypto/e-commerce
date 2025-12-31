<template>
  <el-dialog top="0vh" :title="`客户名称：${title}`" :visible="showAddDialog" @close="close" width="40%" :close-on-click-modal="false">

    <el-form ref="order" class="demo-order">
      <el-form-item :label="`订单号${item}：`" v-for="(item, index) in orderInput" :key="index">
        <div class="input-group">
          <el-input v-model="order[index]" placeholder="请输入"></el-input>
          <div class="del-icon">
            <i class=" el-icon-circle-close" size="20" @click="delInput(index)" v-show="orderInput>1"></i>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="add-icon">
          <i class=" el-icon-circle-plus-outline" size="20" @click="addInput"></i>
        </div>
      </el-form-item>
    </el-form>

    <div class="sub-tip" v-show="svState">
      <span>{{ tipError }}</span>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="formatParams">提 交</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { dealAdd } from '@/api/customer/record'

export default {
  name: 'Dialog',
  props: {
    showAddDialog: {
      type: Boolean,
      required: true,
    },
    row: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  created() {
    console.log(' this.row: ', this.row);
    this.title = this.row?.name
    this.addParams.uuid = this.row?.uuid
  },
  data() {
    return {
      // 输入框默认数量
      orderInput: 3,
      // 订单号
      order: new Array(3).fill(''),
      title: '',
      // 提交参数
      addParams: {
        "list": [],
        "uuid": ""
      },
      // 保存状态
      svState: false,
      // 错误提示
      tipError: '',

    }
  },

  computed: {
  },
  mounted() {
  },
  methods: {
    //  关闭
    close() {
      this.$emit('close')
    },
    // 提交
    async formatParams() {
      this.addParams.list = []
      console.log('提交', this.order);
      this.order.map((item, index) => {
        if (item) {
          this.addParams.list.push({
            originalOrderId: item
          })
        }
      })
      console.log('this.addParams: ', this.addParams);
      if(this.addParams.list.length === 0){
        this.svState = true
        this.tipError = '订单号不能为空'
        return
      }
      this.submitOrdser()

    },
    // 提交
    async submitOrdser() {
      let res;
      try {
        res = await dealAdd(this.addParams)
        console.log('res: ', res);
        if (res.code === 200) {
          this.svState = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$emit('close')
        }
      } catch (error) {
        console.log('error: ', error);
        this.svState = true
        this.tipError = error.toString().replace("Error: ", "");
      }
      console.log('res: ', res);
    },
    // 删除
    delInput(index) {
      if(this.order.length === 1) return
      this.order.splice(index, 1)
      this.orderInput--
    },
    // 新增输入框
    addInput() {
      this.orderInput++;
      this.order.push('')
    }
  },
  components: {
  },
}
</script>

<style scoped lang="scss">
.input-group {
  display: flex;
  align-items: center;

  .del-icon {
    width: 40px;
    height: 40px;
    // border:1px solid red;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
  }
}

.add-icon {
  display: flex;
  justify-content: center;
  font-size: 30px;

}

.sub-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  font-size: 16px;
}
</style>
