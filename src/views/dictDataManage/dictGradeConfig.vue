<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-tabs v-model="currentDictType" @tab-click="tabHandleClick">
        <el-tab-pane
          v-for="item in dictType"
          :label="item.dictTypeName"
          :name="item.dictTypeCode"
          :key="item.dictTypeCode"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <div class="container">
      <div v-if="currentDictType == '1'" style="color: royalblue; margin-top: -10px;">
        <template>
          <el-popover
            placement="top-start"
            width="500"
            trigger="hover"
            content="说明: 设置链接商品等级所对应的订单量在店铺范围内的排名百分比"
          >
            <i slot="reference" class="el-icon-warning-outline"></i>
          </el-popover>
        </template>
      </div>
      <div v-if="currentDictType == '2'" style="color: royalblue; margin-top: -10px;">
        <template>
          <el-popover
            placement="top-start"
            width="500"
            trigger="hover"
            content="说明: 设置SPU产品等级所对应的订单量"
          >
            <i slot="reference" class="el-icon-warning-outline"></i>
          </el-popover>
        </template>
      </div>
      <!-- 链接表格 -->
      <el-table
        v-if="currentDictType == '1'"
        :data="dictLinkList"
        v-loading="tabLoading"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="linkLevelName" label="商品链接等级" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="storeScope" label="店铺排名范围" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>
              <!--可操作状态-->
              <el-input
                oninput="value=value.replace(/[^\d]/g,'')"
                style="width: 45%"
                v-model="dictLinkList[scope.$index].storeScope"
                @focus="storeScopeFocus(dictLinkList[scope.$index])"
              ></el-input>%
              <!-- <el-input-number v-model="dictLinkList[scope.$index].storeScope" 
              controls-position="right" 
              @focus="storeScopeFocus(scope.$index)"
              @change="handleChange" 
              :min="0" :max="100" 
              :precision="0">
              </el-input-number> %-->
              <el-button
                v-show="dictLinkList[scope.$index].isShowStoreScopeButton"
                type="primary"
                @click="saveStoreScope(scope.row)"
              >保 存</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-view" @click="storeLower(row)">店铺下限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-table
        v-if="currentDictType == '2'"
        :data="dictLinkSpuList"
        v-loading="tabLoading"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="spuLevelName" label="产品等级" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="订单量范围" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>
              <!--可操作状态-->
              <el-input
                style="width: 25%"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="dictLinkSpuList[scope.$index].orderLower"
                @focus="orderUpperFocus(dictLinkSpuList[scope.$index])"
              ></el-input>--
              <el-input
                :disabled="true"
                style="width: 25%"
                v-model="dictLinkSpuList[scope.$index].orderUpper"
                @focus="orderLowerFocus(dictLinkSpuList[scope.$index])"
              ></el-input>
              <el-button
                v-show="scope.row.isShowStoreScopeButton"
                type="primary"
                @click="saveSpuScope(dictLinkSpuList[scope.$index])"
              >保 存</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="店铺下限"
      :visible="showStoreDialog"
      @close="closeStoreDialog"
      :close-on-click-modal="false"
      width="80%"
    >
      <div style="margin-bottom: 20px">商品等级: {{linkLevelNames }}级</div>
      <el-form
        :model="storeLowerDTO"
        ref="addRef"
        label-width="105px"
        class="demo-dynamic"
        :inline="true"
        style="margin-left: -50px;"
      >
        <el-form-item label="平台：" class="search_item">
          <el-select v-model="reqParams.platform" filterable clearable placeholder="请选择平台">
            <el-option
              v-for="item in platforms"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" style="margin-right: -20px;">
          <el-cascader
            filterable
            v-model="reqParams.manager"
            :options="departments"
            :show-all-levels="false"
            :props="{ children: 'children', label: 'deptName', value: 'deptId', checkStrictly: false }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeUuid" class="search_item">
          <el-select v-model="reqParams.storeUuid" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in stores"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <template v-slot="{row}">
            <el-button type="primary" icon="el-icon-search" @click="getStoreList('clice')">搜索</el-button>
          </template>
        </el-form-item>
      </el-form>
      <!-- 表格 -->
      <el-table
        :data="storeTableList"
        v-loading="tabLoading"
        style="width: 100%"
        max-height="600"
        border
        fit
      >
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="platformName" label="平台" align="center">
          <!-- <template v-slot="{ row, $index }">
            <div :class="{'not-my':row.conductorName !== myName}">
              {{ row.expressNum }}
            </div>
          </template>-->
        </el-table-column>
        <el-table-column prop="storeName" label="店铺" align="center">
          <!-- <template v-slot="{ row, $index }">
            <div :class="{'not-my':row.conductorName !== myName}">
              {{ row.expressNum }}
            </div>
          </template>-->
        </el-table-column>
        <el-table-column prop="managerName" label="负责人" align="center">
          <!-- <template v-slot="{ row, $index }">
            <div :class="{'not-my':row.conductorName !== myName}">
              {{ row.expressNum }}
            </div>
          </template>-->
        </el-table-column>
        <el-table-column prop="orderLower" :label="linkLevelNames + '级订单数量下限'" align="center">
          <template slot-scope="scope">
            <div>
              <!--可操作状态-->
              <el-input
                oninput="value=value.replace(/[^\d]/g,'')"
                style="width:35%"
                v-model="storeTableList[scope.$index].orderLower"
                @focus="updateStoreFocus(storeTableList[scope.$index])"
              ></el-input>
              <el-button
                v-show="storeTableList[scope.$index].isShowStoreScopeButton"
                type="primary"
                @click="saveupdateStore(storeTableList[scope.$index])"
              >保 存</el-button>
            </div>
          </template>
          <!-- <template v-slot="{ row, $index }">
            <el-input v-model="row.orderLower"></el-input>
          </template>-->
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getStoreList()"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  saveLink,
  updateSpu,
  updateStore,
  queryLinkList,
  querySpuList,
  store,
} from '@/api/dict/dictGradeConfig'
import { listPlatform, listStore } from '@/api/baseData/common'
import { department } from '@/api/information/department'
import { getDeptTreeData } from '@/utils/common'

export default {
  name: 'DictGradeConfig',
  data() {
    return {
      linkLevelNames: null,
      total: 0,
      reqParams: {
        platform: '',
        storeUuid: '',
        linkUuid: '',
        manager: null,
        page: 1,
        pageSize: 20,
      },
      //最上面的tab页
      dictType: [
        { dictTypeName: '链接', dictTypeCode: '1' },
        { dictTypeName: 'spu', dictTypeCode: '2' },
      ],

      //默认选第一个
      currentDictType: '',

      //链接字典的配置
      dictLinkList: [],
      //链接Spu字典的配置
      dictLinkSpuList: [],
      // tab加载状态
      tabLoading: false,
      // 店铺下限单弹层
      showStoreDialog: false,
      //店铺下限DTO
      storeLowerDTO: {},
      //平台下拉数据
      platforms: [],
      //处理表格列表数据
      storeTableList: [],
      //负责人下拉数据
      departments: [],
      // 店铺名称下拉数据
      stores: [],
      nums: null,
    }
  },
  created() {
    this.getList()
    // this.getStoreList();
    //平台下拉框
    this.listPlatform()
    //负责人下拉框
    this.getDeptTree()
    //店铺名称下拉框
    this.listStore()
    this.currentDictType = this.dictType[0].dictTypeCode
  },
  methods: {
    //绑定值被改变时触发
    handleChange(value) {
      console.log(value)
    },
    // handleInput(value) {
    //     // 使用正则表达式来判断是否为正整数
    //     const regex = /^[1-9]\d*$/;
    //     // 如果输入的值不符合正整数的正则表达式，则将其设置为上一个有效值
    //     if (!regex.test(value)) {
    //       this.inputValue = this.inputValue.substring(0, this.inputValue.length - 1);
    //     }
    // },
    //获取店铺下限列表数据
    async getStoreList(clice) {
      this.tabLoading = true
      if (Array.isArray(this.reqParams.manager)) {
        this.reqParams.manager =
          this.reqParams.manager[this.reqParams.manager.length - 1]
      }
      if (clice && clice === 'clice') {
        this.reqParams.page = 1
      }
      const res = await store({
        ...this.reqParams,
      })
      this.storeTableList = res.data.records
      this.total = res.data.total
      this.tabLoading = false
    },
    //获取spu列表数据
    async getSpuList() {
      this.tabLoading = true
      const res = await querySpuList(this.reqParams)
      this.dictLinkSpuList = res.data
      this.tabLoading = false
    },
    // 获取链接列表数据
    async getList() {
      this.tabLoading = true
      const res = await queryLinkList(this.reqParams)
      this.dictLinkList = res.data
      this.tabLoading = false
    },
    // 获取平台下拉框数据
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },
    // 获取负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    // 获取店铺下拉框数据
    async listStore() {
      const res = await listStore()
      this.stores = res.data
    },
    //tab点击事件
    tabHandleClick(tab, event) {
      console.log(tab, '-------')
      this.tabLoading = true

      //链接配置
      if (this.currentDictType == 1) {
        this.getList()
      }
      //spu配置
      else if (this.currentDictType == 2) {
        this.getSpuList()
      }
      this.tabLoading = false
    },

    //店铺下限的弹出框的事件
    storeLower(row) {
      console.log(row)
      this.showStoreDialog = true
      this.linkLevelNames = row.linkLevelName
      this.reqParams.linkUuid = row.uuid
      this.getStoreList()
    },

    //关闭店铺下限弹窗层
    closeStoreDialog() {
      this.reqParams.platform = null
      this.reqParams.manager = null
      this.reqParams.storeUuid = null
      this.showStoreDialog = false
    },

    //链接配置下，店铺百分比占比的焦点输入框事件
    storeScopeFocus(row) {
      console.log('触发')
      row.isShowStoreScopeButton = true
    },

    //spu配置下，店铺下限百分比占比的焦点输入框事件
    orderLowerFocus(row) {
      row.isShowStoreScopeButton = true
    },

    //spu配置下，店铺下限百分比占比的焦点输入框事件
    orderUpperFocus(row) {
      console.log(row, '111')
      row.isShowStoreScopeButton = true
    },

    //店铺下限保存配置下，店铺下限百分比占比的焦点输入框事件
    updateStoreFocus(row) {
      row.isShowStoreScopeButton = true
    },

    //店铺下限保存配置下，店铺下限百分比占比的焦点输入框事件
    async saveupdateStore(row) {
      row.isShowFeedbackButton = false

      console.log(row, '----111')
      if (row.uuid == '') {
        await updateStore({
          orderLower: row.orderLower,
          storeScope: row.storeScope,
          manager: row.manager,
          platform: row.platform,
          storeUuid: row.storeUuid,
          uuid: '',
          linkUuid: this.reqParams.linkUuid,
        })
      } else {
        await updateStore({
          orderLower: row.orderLower,
          storeScope: row.storeScope,
          manager: row.manager,
          platform: row.platform,
          storeUuid: row.storeUuid,
          uuid: row.uuid,
          linkUuid: this.reqParams.linkUuid,
        })
      }
      this.$message({
        type: 'success',
        message: '操作成功',
      })
      if (row.isShowFeedbackButton == 'false') {
        this.storeTableList[scope.$index].isShowStoreScopeButton = true
      }
      this.getStoreList()
      // this.tabLoading = false;
    },

    //链接配置下，店铺百分比占比的input框的保存事件
    async saveStoreScope(row) {
      console.log(row, '----')
      row.isShowFeedbackButton = false

      if (row.linkLevelName !== 'C') {
        let nums = 0
        this.dictLinkList.map((item) => {
          if (item.linkLevelName !== 'C') {
            nums += Number(item.storeScope)
          }
        })
        console.log(nums, '---+++')
        if (nums > 100) {
          this.$message({
            type: 'error',
            message: '操作失败，排名范围不能超过100%',
          })
          return
        }
      }
      this.$message({
        type: 'success',
        message: '操作成功',
      })

      if (row.isShowFeedbackButton == 'false') {
        this.dictLinkList[scope.$index].isShowStoreScopeButton = true
      }
      await saveLink({
        uuid: row.uuid,
        linkLevel: row.linkLevel,
        storeScope: row.storeScope,
      })
      this.getList()
    },

    //spu配置下，店铺百分比占比的input框的保存事件
    async saveSpuScope(row) {
      await updateSpu({
        uuid: row.uuid,
        linkLevel: row.linkLevel,
        orderLower: row.orderLower,
        // orderUpper: row.orderUpper,
        storeScope: row.storeScope,
      })
      console.log(row, '222')
      // if (row.isShowStoreScopeButton === true) {
      //   this.dictLinkSpuList[row.$index].isShowStoreScopeButton = false;
      // }
      console.log('row', row)
      this.$message({
        type: 'success',
        message: '操作成功',
      })
      console.log('row', row)
      this.getSpuList()
    },
  },
}
</script>


<style lang="scss">
</style>