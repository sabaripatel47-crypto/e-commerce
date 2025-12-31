<template>
  <el-dialog
    title="榜单详情"
    :visible.sync="dialogVisible"
    fullscreen
    append-to-body
    show-close
    @close="handleClose"
  >
    <el-button
      type="text"
      icon="el-icon-arrow-left"
      class="dialog-back-button"
      @click="handleClose"
    >返回</el-button>
    <div class="column-checkbox">
      <el-checkbox v-model="showSalesAttribute">销售属性</el-checkbox>
      <el-checkbox v-model="showOtherAttribute">其他描述</el-checkbox>
    </div>
    <!-- 上面的榜单列表 -->
    <div class="rank-list-container">
      <el-table
        v-loading="rankListLoading"
        :data="rankList"
        border
        style="width: 100%"
        @row-click="handleRowClick"
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column
          prop="linkTitle"
          label="商品标题"
          min-width="150"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.linkTitle || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="linkId" label="商品ID" min-width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.linkId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rankTitle" label="榜单标题" min-width="150" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.rankTitle || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rankSort" label="排名" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.rankSort || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.price || scope.row.price === 0 ? scope.row.price : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="urlAddress"
          label="链接地址"
          min-width="200"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <a
              v-if="scope.row.urlAddress"
              :href="scope.row.urlAddress"
              target="_blank"
              class="link-text"
            >{{ scope.row.urlAddress }}</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="imageAddress" label="榜单图片" width="100" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.imageAddress"
              style="height: 30px; width: 30px"
              :src="scope.row.imageAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[scope.row.imageAddress]"
            ></el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="systemImageAddress" label="主图" width="100" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.systemImageAddress"
              style="height: 30px; width: 30px"
              :src="scope.row.systemImageAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[scope.row.systemImageAddress]"
            ></el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="otherAddress"
          label="多媒体"
          show-overflow-tooltip
          min-width="150"
          header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.otherAddress && scope.row.otherAddress.length">
              <div v-for="(item, index) in scope.row.otherAddress" :key="index">
                <a :href="item" target="_blank" class="link-text">{{ item }}</a>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showSalesAttribute"
          prop="salesAttributeList"
          label="销售属性"
          min-width="200"
          header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.salesAttributeList && scope.row.salesAttributeList.length">
              <div v-for="(item, index) in scope.row.salesAttributeList" :key="index">{{ item }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showOtherAttribute"
          prop="otherAttributeList"
          label="其他描述"
          min-width="200"
          header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.otherAttributeList && scope.row.otherAttributeList.length">
              <div v-for="(item, index) in scope.row.otherAttributeList" :key="index">{{ item }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 下面的榜单详情列表 -->
    <div class="rank-detail-container" style="margin-top: 20px;">
      <div class="column-checkbox">
        <el-checkbox v-model="showDetailSalesAttribute">销售属性</el-checkbox>
        <el-checkbox v-model="showDetailOtherAttribute">其他描述</el-checkbox>
      </div>
      <el-table
        v-loading="rankDetailLoading"
        :data="rankDetailList"
        border
        style="width: 100%"
        max-height="600"
      >
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column
          prop="linkTitle"
          label="商品标题"
          min-width="150"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.linkTitle || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="linkId" label="商品ID" min-width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.linkId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rankTitle" label="榜单标题" min-width="150" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.rankTitle || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rankSort" label="排名" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.rankSort || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.price || scope.row.price === 0 ? scope.row.price : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="urlAddress"
          label="链接地址"
          min-width="200"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <a
              v-if="scope.row.urlAddress"
              :href="scope.row.urlAddress"
              target="_blank"
              class="link-text"
            >{{ scope.row.urlAddress }}</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="imageAddress" label="榜单图片" width="100" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.imageAddress"
              style="height: 30px; width: 30px"
              :src="scope.row.imageAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[scope.row.imageAddress]"
            ></el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="otherAddress"
          label="多媒体"
          show-overflow-tooltip
          min-width="150"
          header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.otherAddress && scope.row.otherAddress.length">
              <div v-for="(item, index) in scope.row.otherAddress" :key="index">
                <a :href="item" target="_blank" class="link-text">{{ item }}</a>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showDetailSalesAttribute"
          prop="salesAttributeList"
          label="销售属性"
          min-width="200"
          header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.salesAttributeList && scope.row.salesAttributeList.length">
              <div v-for="(item, index) in scope.row.salesAttributeList" :key="index">{{ item }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showDetailOtherAttribute"
          prop="otherAttributeList"
          label="其他描述"
          min-width="200"
          header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.otherAttributeList && scope.row.otherAttributeList.length">
              <div v-for="(item, index) in scope.row.otherAttributeList" :key="index">{{ item }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import {
  getRankList,
  getRankDetailList,
} from '@/api/bulletinboard/linkStatistics'

export default {
  name: 'RankDetails',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    linkId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      rankList: [],
      rankListLoading: false,
      rankDetailList: [],
      rankDetailLoading: false,
      showSalesAttribute: false,
      showOtherAttribute: false,
      showDetailSalesAttribute: false,
      showDetailOtherAttribute: false,
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      },
    },
  },
  watch: {
    visible(val) {
      if (val && this.linkId) {
        this.getRankList()
      }
    },
  },
  methods: {
    // 获取榜单列表
    async getRankList() {
      this.rankListLoading = true
      try {
        const res = await getRankList({ linkId: this.linkId })
        this.rankList = res.data || []
      } catch (error) {
        console.error('获取榜单列表失败', error)
      }
      this.rankListLoading = false
    },
    // 点击行获取榜单详情
    async handleRowClick(row) {
      if (!row.rankTitle) return
      this.rankDetailLoading = true
      try {
        const res = await getRankDetailList(row.rankTitle)
        this.rankDetailList = res.data || []
      } catch (error) {
        console.error('获取榜单详情失败', error)
      }
      this.rankDetailLoading = false
    },
    // 关闭弹窗
    handleClose() {
      this.rankList = []
      this.rankDetailList = []
      this.$emit('update:visible', false)
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  align-items: center;
}
.column-checkbox {
  margin: 10px 0;
  .el-checkbox {
    margin-right: 20px;
  }
}
.rank-list-container,
.rank-detail-container {
  margin-bottom: 10px;
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
