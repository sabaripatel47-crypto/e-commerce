<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      title="产品详情"
      width="90%"
      @close="closeDialog"
      @opened="handleDialogOpened"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <!-- 搜索表单 -->
      <el-form class="page-search" inline style="margin-bottom: 20px">
        <el-form-item label="商品链接:">
          <el-input
            v-model="searchLinkId"
            placeholder="请输入"
            style="width: 200px"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="tableLoading"
        border
        max-height="500"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column width="50" label="序号" type="index" align="center" fixed="left"></el-table-column>
        <el-table-column label="店铺" align="center" fixed="left" min-width="180">
          <template v-slot="{ row }">
            <span>{{ formatStoreInfo(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="链接" align="center" min-width="200">
          <template v-slot="{ row }">
            <span>{{ formatLinkInfo(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="linkLevelName" label="链接等级" width="100" align="center"></el-table-column>
        <el-table-column prop="isMainLinkName" label="是否主打" width="100" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              row.isMainLinkName || (row.isMainLink ? "是" : "否")
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="SKU" align="center" min-width="180">
          <template v-slot="{ row }">
            <span>({{ row.skuCode || "-" }}){{ row.specsName || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="sku图片" width="100" prop="skuUrlUuid" align="center">
          <template v-slot="{ row }">
            <el-image
              v-if="row.skuUrlUuid"
              style="height: 30px; width: 30px"
              :src="
                row.skuUrlUuid + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.skuUrlUuid]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="helpSupportName" label="帮扶负责人" width="120" align="center"></el-table-column>
        <el-table-column prop="planningName" label="项目企划负责人" width="140" align="center"></el-table-column>
        <el-table-column prop="strategyName" label="项目" width="120" align="center"></el-table-column>
        <el-table-column prop="applyMoney" label="申请金额 (元)" width="120" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              typeof row.applyMoney === "number"
              ? row.applyMoney.toFixed(2)
              : row.applyMoney || "-"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="productionNumber" label="生产周期" width="100" align="center"></el-table-column>
        <el-table-column label="本次申请计划" align="center">
          <el-table-column label="京仓" align="center">
            <template v-slot="{ row }">
              <span>
                {{
                Array.isArray(row.thisJinPlan)
                ? row.thisJinPlan.join(",")
                : row.thisJinPlan || "0"
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="米麦本地" align="center">
            <template v-slot="{ row }">
              <span>
                {{
                Array.isArray(row.thisMiMaiPlan)
                ? row.thisMiMaiPlan.join(",")
                : row.thisMiMaiPlan || "0"
                }}
              </span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="本次帮扶复核" align="center" width="260">
          <el-table-column label="京仓" width="130" align="center">
            <template v-slot="{ row, $index }">
              <el-input-number
                v-model="row.thisHelpJinPlan"
                :precision="0"
                :min="0"
                :disabled="true"
                size="small"
                style="width: 100%"
              ></el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="米麦本地" width="130" align="center">
            <template v-slot="{ row, $index }">
              <el-input-number
                v-model="row.thisHelpMiMaiPlan"
                :precision="0"
                :min="0"
                :disabled="true"
                size="small"
                style="width: 100%"
              ></el-input-number>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="manageName" label="链接负责人" width="120" align="center"></el-table-column>
        <el-table-column prop="sevenDaysSales" label="7天销售量" width="100" align="center"></el-table-column>
        <el-table-column prop="fiveteenDaysSales" label="15天销售量" width="110" align="center"></el-table-column>
        <el-table-column prop="thirtyDaysSales" label="30天总销量" width="110" align="center"></el-table-column>
        <el-table-column width="80" label="操作" align="center" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="handleKanbanClick(row)">看板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <div style="display: flex; justify-content: center; margin-top: 10px">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>-->

      <!-- 分页 -->
      <!-- <pagination
        v-show="tableTotal > 0"
        :total="tableTotal"
        :page.sync="page"
        :limit.sync="pageSize"
        @pagination="handlePageChange"
      />-->
    </el-dialog>

    <!-- 看板弹层 -->
    <el-dialog
      :title="rowParams.linkTitle + '商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <LinkBoard v-if="showLinkBoardDialog" :rowParams="rowParams" :storeDisabled="true"></LinkBoard>
    </el-dialog>
  </div>
</template>

<script>
import { fetch_sonDetailExamineData } from '@/api/support/audit/index'
import LinkBoard from '@/views/bulletinboard/linkBoard'
import { addDay, addDayEnd } from '@/utils/common.js'

export default {
  name: 'ProductDetailDialog',
  components: {
    LinkBoard,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    spuUuid: {
      type: String,
      default: '',
    },
    skuUuid: {
      type: String,
      default: '',
    },
    helpSupportUuid: {
      type: String,
      default: '',
    },
    spuShowName: {
      type: String,
      default: '',
    },
    auditStatus: {
      type: Number,
      default: null,
    },
    submitStatus: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: false,
      tableData: [],
      tableTotal: 0,
      tableLoading: false,
      page: 1,
      pageSize: 10,
      reqParams: {
        helpSupportUuid: '',
        spuUuid: '',
        skuUuid: '',
      },
      // 搜索
      searchLinkId: '',
      // 显示链接看板
      showLinkBoardDialog: false,
      // 看板弹层入参
      rowParams: {},
    }
  },
  computed: {
    // 判断是否禁用输入框
    isInputDisabled() {
      if (this.auditStatus != 4 && this.auditStatus != 1) {
        return true
      }
      return false
    },
    // 过滤后的表格数据
    // filteredTableData() {
    //   if (!this.searchLinkId || this.searchLinkId.trim() === "") {
    //     return this.tableData;
    //   }
    //   const searchValue = this.searchLinkId.trim().toLowerCase();
    //   return this.tableData.filter((row) => {
    //     // 根据 linkId 或 linkTitle 进行过滤
    //     const linkId = (row.linkId || "").toString().toLowerCase();
    //     const linkTitle = (row.linkTitle || "").toLowerCase();
    //     return linkId.includes(searchValue) || linkTitle.includes(searchValue);
    //   });
    // },
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
      },
      immediate: true,
    },
    spuUuid: {
      handler(newVal) {
        if (newVal) {
          this.reqParams.spuUuid = newVal
          // 如果设置了 spuUuid，清空 skuUuid
          if (newVal) {
            this.reqParams.skuUuid = ''
          }
        }
      },
    },
    skuUuid: {
      handler(newVal) {
        if (newVal) {
          this.reqParams.skuUuid = newVal
          // 如果设置了 skuUuid，清空 spuUuid
          if (newVal) {
            this.reqParams.spuUuid = ''
          }
        }
      },
    },
    helpSupportUuid: {
      handler(newVal) {
        if (newVal) {
          this.reqParams.helpSupportUuid = newVal
        }
      },
    },
  },
  methods: {
    // 弹窗打开后触发
    handleDialogOpened() {
      // 弹窗完全打开后，获取数据
      // 需要 helpSupportUuid 和 (spuUuid 或 skuUuid)
      if (this.helpSupportUuid && (this.spuUuid || this.skuUuid)) {
        this.getList()
      }
    },

    // 获取列表数据
    async getList() {
      if (!this.helpSupportUuid) {
        this.$message.warning('缺少帮扶UUID，无法获取数据')
        return
      }

      this.tableLoading = true
      try {
        // 根据是否有 skuUuid 或 spuUuid 来决定传递的参数
        const params = {
          helpSupportUuid: this.helpSupportUuid,
        }

        // 如果用户进行了搜索，优先使用 searchLinkId
        if (this.searchLinkId) {
          params.linkId = this.searchLinkId
        }
        if (this.skuUuid) {
          params.skuUuid = this.skuUuid
        }
        if (this.spuUuid) {
          params.spuUuid = this.spuUuid
        }
        console.log('searchLinkId', this.searchLinkId)
        console.log('调用 fetch_sonDetailExamineData API，params:', params)
        const res = await fetch_sonDetailExamineData(params)
        console.log('fetch_sonDetailExamineData 接口返回:', res)

        if (res && res.code === 200) {
          // fetch_sonDetailExamineData 返回的数据可能是数组，也可能是对象包含 records/list
          let dataList = []
          if (Array.isArray(res.data)) {
            dataList = res.data || []
            this.tableTotal = res.data.length || 0
          } else {
            const responseData = res.data || {}
            dataList = responseData.records || responseData.list || []
            this.tableTotal = responseData.total || dataList.length || 0
          }
          // 确保 thisHelpJinPlan 和 thisHelpMiMaiPlan 是数字类型
          this.tableData = dataList.map((item) => {
            return {
              ...item,
              thisHelpJinPlan:
                item.thisHelpJinPlan !== null &&
                item.thisHelpJinPlan !== undefined
                  ? Number(item.thisHelpJinPlan) || 0
                  : 0,
              thisHelpMiMaiPlan:
                item.thisHelpMiMaiPlan !== null &&
                item.thisHelpMiMaiPlan !== undefined
                  ? Number(item.thisHelpMiMaiPlan) || 0
                  : 0,
            }
          })
        } else {
          console.warn('接口返回数据格式异常:', res)
          this.tableData = []
          this.tableTotal = 0
        }
      } catch (error) {
        console.error('获取产品详情数据失败:', error)
        this.$message.error(
          '获取产品详情数据失败: ' + (error.message || '未知错误')
        )
        this.tableData = []
        this.tableTotal = 0
      } finally {
        this.tableLoading = false
      }
    },

    // 分页变化
    handlePageChange(val) {
      this.page = val.page
      this.pageSize = val.limit
      // 注意：fetch_sonDetailExamineData 接口可能不支持分页，如果接口不支持，需要在前端分页
      // 或者如果接口支持但文档未说明，可以尝试传入 page 和 pageSize
      this.getList()
    },

    // 格式化店铺信息
    formatStoreInfo(row) {
      // 接口可能返回 platformName，如果没有则使用其他字段
      const platformName = row.platformName || ''
      const storeCode = row.storeCode || ''
      const storeName = row.storeName || ''
      if (storeCode || storeName) {
        // 如果有平台名称，显示：平台(店铺编码)店铺名称，否则显示：店铺编码店铺名称
        return platformName
          ? `${platformName}(${storeCode})${storeName}`
          : `(${storeCode})${storeName}`
      }
      return '-'
    },

    // 格式化链接信息
    formatLinkInfo(row) {
      const linkTitle = row.linkTitle || ''
      const linkId = row.linkId || ''
      if (linkTitle || linkId) {
        return `${linkTitle}(${linkId})`
      }
      return '-'
    },

    // 点击看板
    handleKanbanClick(row) {
      if (!row.linkId) {
        this.$message.warning('缺少链接ID，无法查看看板')
        return
      }

      // 构建传递给 LinkBoard 的参数
      this.rowParams = {
        linkTitle: row.linkTitle || '',
        linkId: row.linkId,
        storeUuid: row.storeUuid || row.storeUuId || '',
        platformUuid: row.platformUuid || row.platform || '',
        startTime: addDayEnd(-7), // 最近7天的开始时间
        endTime: addDay(-1), // 昨天的结束时间
        formatType: 2, // 默认格式类型
        skuUuid: row.skuUuid || '', // 如果有 SKU UUID，也传递过去
      }

      this.showLinkBoardDialog = true
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
    },

    // 搜索
    handleSearch() {
      console.log('handleSearch', this.searchLinkId)
      this.page = 1
      this.getList()
    },

    // 保存数据
    async handleSave() {
      // 二次确认
      try {
        await this.$confirm('确定要保存修改的数据吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
      } catch {
        // 用户取消
        return
      }

      // 组装数据
      if (!this.helpSupportUuid) {
        this.$message.warning('缺少帮扶UUID，无法保存')
        return
      }

      // 收集所有行的数据
      const detailList = this.tableData.map((row) => {
        return {
          linkId: row.linkId || '',
          skuUuid: row.skuUuid || '',
          thisHelpJinPlan: Number(row.thisHelpJinPlan) || 0,
          thisHelpMiMaiPlan: Number(row.thisHelpMiMaiPlan) || 0,
          uuid: row.uuid || '',
        }
      })

      // 组装请求参数
      const params = {
        applicationStatus: 0,
        detail: detailList,
        helpSupportUuid: this.helpSupportUuid,
      }

      try {
        // 注意：audit 版本可能需要使用不同的保存接口
        // 这里暂时使用 review 版本的接口，实际使用时需要根据 audit 的 API 调整
        // const res = await fetch_add(params);
        // if (res && res.code === 200) {
        //   this.$message.success("保存成功");
        //   // 保存成功后刷新当前弹窗数据
        //   this.getList();
        //   // 通知父组件刷新表格数据
        //   this.$emit("refresh");
        // } else {
        //   this.$message.error(res.msg || "保存失败");
        // }
        this.$message.info(
          '保存功能待实现，请根据 audit 版本的 API 接口进行调整'
        )
      } catch (error) {
        console.error('保存数据失败:', error)
        this.$message.error('保存数据失败: ' + (error.message || '未知错误'))
      }
    },

    // 关闭弹窗
    closeDialog() {
      this.dialogVisible = false
      this.searchLinkId = '' // 清空搜索条件
      this.$emit('update:visible', false)
    },
  },
}
</script>

<style lang="scss" scoped></style>
