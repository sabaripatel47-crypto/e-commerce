<template>
  <div class="baseData_sku">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" v-model="reqParams.keywords" class="handle-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addList()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="skuList" style="width: 100%" max-height="480">
        <el-table-column show-overflow-tooltip fixed="left" type="index" label="序号" width="70"></el-table-column>
        <!-- <el-table-column show-overflow-tooltip prop="skuCode" label="SKU编码" width="120"></el-table-column> -->
        <!-- <el-table-column show-overflow-tooltip prop="skuCode" label="SKU名称" width="120"></el-table-column> -->
        <el-table-column show-overflow-tooltip prop="code" label="产品编号" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="productName" label="产品名称" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="type" label="产品类别" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="level" label="产品级别" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="skuSpecifications" label="SKU规格" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="skuModel" label="SKU型号" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="skuPrice" label="SKU单价" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="skuDescription" label="SKU说明" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="material" label="材质" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="capacity" label="容量（cm）" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="length" label="长（cm）" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="width" label="宽（cm）" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="height" label="高（cm）" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="color" label="颜色" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="grossWeight" label="毛重（Kg）" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="netWeight" label="净重（Kg）" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="size" label="尺码" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="characteristic" label="特色" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="otherSpecifications" label="其他规格" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="otherModel" label="其他型号" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="combinationCode" label="组合编码" width="120"></el-table-column>
        <el-table-column show-overflow-tooltip prop="pictureUrl" label="图片上传" width="120">
          <template v-slot="{row}">
            <div class="imgList">
              <div class="demo-image__preview" v-for="item in row.pictureUrl" :key="item">
                <el-image
                  style="width: 30; height: 30px"
                  :src="item"
                  :preview-src-list="row.pictureUrl"
                ></el-image>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="state" label="SKU状态" width="120">
          <template v-slot="{row}">
            <span>{{ row.state==='0'?'正常':'关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editSku(row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteSku(row.id)">删除</el-button>
            <el-button size="mini" type="text" icon="el-icon-view" @click="getSkuDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="reqParams.pageNum"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>
    <!-- 新增弹层 -->
    <Dialog v-if="showAddDialog" :row.sync="row" :showAddDialog.sync="showAddDialog"></Dialog>
    <!-- 详情弹层 -->
    <el-dialog title="SKU详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="产品编号">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailList.productName }}</el-descriptions-item>
        <el-descriptions-item label="产品类别">{{ detailList.type }}</el-descriptions-item>
        <el-descriptions-item label="产品级别">{{ detailList.level }}</el-descriptions-item>
        <!-- <el-descriptions-item label="SKU编码">{{ detailList.skuCode }}</el-descriptions-item> -->
        <el-descriptions-item label="SKU规格">{{ detailList.skuSpecifications }}</el-descriptions-item>
        <el-descriptions-item label="SKU型号">{{ detailList.skuModel }}</el-descriptions-item>
        <el-descriptions-item label="SKU单价">{{ detailList.skuPrice }}</el-descriptions-item>
        <el-descriptions-item label="SKU说明">{{ detailList.skuDescription }}</el-descriptions-item>
        <el-descriptions-item label="材质">{{ detailList.material }}</el-descriptions-item>
        <el-descriptions-item label="容量（cm）">{{ detailList.capacity }}</el-descriptions-item>
        <el-descriptions-item label="长（cm）">{{ detailList.length }}</el-descriptions-item>
        <el-descriptions-item label="宽（cm）">{{ detailList.width }}</el-descriptions-item>
        <el-descriptions-item label="高（cm）">{{ detailList.height }}</el-descriptions-item>
        <el-descriptions-item label="颜色">{{ detailList.color }}</el-descriptions-item>
        <el-descriptions-item label="毛重（Kg）">{{ detailList.grossWeight }}</el-descriptions-item>
        <el-descriptions-item label="净重（Kg）">{{ detailList.netWeight }}</el-descriptions-item>
        <el-descriptions-item label="尺码">{{ detailList.size }}</el-descriptions-item>
        <el-descriptions-item label="特色">{{ detailList.characteristic }}</el-descriptions-item>
        <el-descriptions-item label="其他规格">{{ detailList.otherSpecifications }}</el-descriptions-item>
        <el-descriptions-item label="其他型号">{{ detailList.otherModel }}</el-descriptions-item>
        <el-descriptions-item label="组合编码">{{ detailList.combinationCode }}</el-descriptions-item>
        <el-descriptions-item label="图片上传">
          <span v-for="item in detailList.pictureUrl">
            <img style="width: 30; height: 30px" :src="item" alt />
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="SKU状态">{{ detailList.state ==='0'?'正常':'关闭' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script>
import { getSkuList, skuDetail, deleteSku } from '@/api/baseData/sku'
import Dialog from './components/Dialog'
export default {
  name: 'Commoditysku',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      skuList: [],
      showAddDialog: false,
      row: {},
      detailList: {},
      reqParams: {
        keywords: '',
        pageNum: 1,
        pageSize: 20,
      },
    }
  },
  created() {
    this.getList()
  },
  watch: {
    '$route.query.id': {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          console.log(val)
          this.reqParams.code = val
          this.getList()
        }
      },
    },
  },
  methods: {
    // 清空数据
    clearRow() {
      this.row = {}
    },
    // 获取列表信息
    async getList() {
      const res = await getSkuList(this.reqParams)
      this.skuList = res.data.records
      this.total = res.data.total
      // console.log(this.skuList)
    },

    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editSku(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getSkuDetail(id) {
      this.showDetail = true
      const res = await skuDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteSku(id) {
      this.$to(
        this.$confirm('确定删除此sku？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteSku(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除sku成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },
  },
}
</script>

<style scoped>
.baseData_sku {
  padding: 40px;
}
.imgList {
  display: flex;
}
.one {
  width: 30px;
  height: 30px;
}
img {
  width: 100%;
  height: 100%;
}

::v-deep .el-image-viewer__wrapper {
  position: fixed;
  top: 100px;
  left: 300px;
  bottom: 100px;
  right: 300px;
}
::v-deep .el-image-viewer__img {
  margin-left: 0px;
  margin-top: 0px;
  max-height: 80%;
  max-width: 50%;
}
</style>