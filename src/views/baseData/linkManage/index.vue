<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="商品搜索：" style="margin-right: 20px">
          <el-input placeholder="请输入商品" v-model="reqParams.keyword" clearable class="handle-input"></el-input>
        </el-form-item>
        <el-form-item label="商品等级:" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.linkLevel" clearable placeholder="请选择商品等级">
            <el-option
              v-for="item in linkLevels"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺：" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.storeUuid" clearable placeholder="请选择店铺">
            <el-option
              v-for="item in storeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.manager"
            :options="departments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="链接状态：" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.linkStatus" clearable placeholder="请选择商品链接状态">
            <el-option
              v-for="item in linkStatusList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList(1)">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addLink()">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="exportLink()"
            v-hasPermi="['baseData:linkManage:export']"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="linkList" style="width: 100%" v-loading="tableLoading" max-height="700">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="linkTitle" label="链接主打产品" align="center" width="130"></el-table-column>
        <el-table-column prop="linkId" label="商品编码" align="center" width="130"></el-table-column>
        <el-table-column prop="uuid" label="主图" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.url"
              style="height: 30px; width: 30px"
              :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="srcList"
              :initial-index="$index"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="所属店铺" align="center" width="130"></el-table-column>
        <el-table-column prop="platformName" label="所属平台" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="managerName" label="负责人" align="center"></el-table-column>
        <el-table-column prop="strategyName" label="项目名称" align="center" width="130"></el-table-column>
        <el-table-column prop="strategyNumber" label="项目编号" align="center" width="130"></el-table-column>
        <el-table-column prop="strategyGradeName" label="项目等级" align="center" width="75"></el-table-column>
        <el-table-column prop="linkTimeStatusName" label="链接阶段" align="center" width="75"></el-table-column>
        <el-table-column prop="listingDate" label="上架时间" align="center" width="95"></el-table-column>
        <el-table-column prop="planLinkLevelName" label="计划等级" align="center"></el-table-column>
        <el-table-column prop="highestLinkLevelName" label="最高等级" align="center"></el-table-column>
        <!-- <el-table-column
          prop="standardLinkLevelName"
          label="标准等级"
          align="center"
        ></el-table-column>-->
        <el-table-column prop="linkLevelName" label="实际等级" align="center"></el-table-column>
        <el-table-column prop="linkStatusName" label="商品链接状态" width="100" align="center"></el-table-column>
        <el-table-column prop="mainLinkName" label="主打商品" align="center"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-view" @click="getLinkDetail(row)">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editLink(row)">修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              v-if="row.linkStatus == 0"
              @click="downLink(row.uuid)"
            >下架</el-button>
            <!-- <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteLink(row.uuid)"
            >删除</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 详情弹层 -->
    <el-dialog title="商品链接详情" :visible="showDetail" :before-close="cleanDetail" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="商品标题">{{ detail.linkTitle }}</el-descriptions-item>
        <el-descriptions-item label="商品编码">{{ detail.linkId }}</el-descriptions-item>
        <el-descriptions-item label="所属店铺">{{ detail.storeName }}</el-descriptions-item>
        <el-descriptions-item label="所属平台">{{ detail.platformName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detail.managerName }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ detail.strategyName }}</el-descriptions-item>
        <el-descriptions-item label="链接阶段">{{ detail.linkTimeStatusName }}</el-descriptions-item>
        <el-descriptions-item label="上架时间">{{ detail.listingDate }}</el-descriptions-item>
        <el-descriptions-item label="计划等级">{{ detail.planLinkLevelName }}</el-descriptions-item>
        <el-descriptions-item label="最高等级">{{ detail.highestLinkLevelName }}</el-descriptions-item>
        <!-- <el-descriptions-item label="标准等级">{{
          detail.standardLinkLevelName
        }}</el-descriptions-item>-->
        <el-descriptions-item label="商品等级">{{ detail.linkLevelName }}</el-descriptions-item>
        <el-descriptions-item label="商品链接状态">{{ detail.linkStatusName }}</el-descriptions-item>
        <el-descriptions-item label="主打商品">{{ detail.mainLinkName }}</el-descriptions-item>
        <el-descriptions-item label="主图">
          <template>
            <el-image
              v-if="detail.url"
              style="height: 30px; width: 30px"
              :src="
                detail.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="detail.srcList"
            ></el-image>
            <span v-else>暂无主图</span>
          </template>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!--新增弹窗-->
    <el-dialog
      :title="isEdit ? '修改商品链接' : '新增商品链接'"
      :visible="showAddDialog"
      :close-on-click-modal="false"
      :before-close="cleanAdd"
      width="40%"
    >
      <el-form
        :model="editDetail"
        :rules="linkRules"
        ref="addDetailRef"
        label-width="110px"
        label-position="right"
      >
        <el-form-item label="项目" prop="strategyUuid">
          <el-select
            class="el-form-item-width40"
            v-model="editDetail.strategyUuid"
            placeholder="请选择项目"
            filterable
            @change="getSpuUuid"
          >
            <el-option
              v-for="item in strategyList"
              :label="item.strategyTitle"
              :value="item.uuid"
              :key="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="链接主打产品" prop="linkTitle">
          <el-autocomplete
            class="el-form-item-width40"
            :disabled="isSpuUuid"
            v-model="editDetail.linkTitle"
            :fetch-suggestions="querySearch"
            placeholder="请输入主打产品名称"
            :trigger-on-focus="false"
            clearable
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="商品编码" prop="linkId">
          <el-input
            class="el-form-item-width40"
            v-model="editDetail.linkId"
            clearable
            placeholder="请输入商品编码"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属店铺" prop="storeUuid">
          <el-select
            class="el-form-item-width40"
            filterable
            v-model="editDetail.storeUuid"
            placeholder="请选择所属店铺"
          >
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="所属平台" prop="platform">
          <el-select
            class="el-form-item-width40"
            disabled
            v-model="editDetail.platform"
            placeholder="请选择所属平台"
          >
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品负责人" prop="manager">
          <el-cascader
            class="el-form-item-width40"
            filterable
            v-model="editDetail.manager"
            :options="departments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
            clearable
            :placeholder="editDetail.managerName"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="助理" prop="assistant">
          <el-cascader
            class="el-form-item-width40"
            filterable
            v-model="editDetail.assistant"
            :options="departments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>

        <el-form-item label="链接阶段" prop="linkTimeStatus">
          <el-select
            class="el-form-item-width40"
            v-model="editDetail.linkTimeStatus"
            placeholder="请选择"
          >
            <el-option
              v-for="item in linkTimeStatusList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="上架时间" prop="listingTime">
          <el-date-picker
            v-model="editDetail.listingTime"
            class="el-form-item-width40"
            type="date"
            placeholder="上架时间"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="计划等级" prop="planLinkLevel">
          <span slot="label">
            <el-tooltip class="item" effect="dark" content="链接期望达到的目标等级" placement="top">
              <svg class="icon" preserveAspectRatio="xMidYMid meet">
                <use xlink:href="#icon-question" />
              </svg>
            </el-tooltip>计划等级
          </span>
          <el-radio-group class="el-form-item-width40" v-model="editDetail.planLinkLevel">
            <el-radio v-for="item in linkLevels" :key="item.code" :label="item.code">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="最高等级" prop="highestLinkLevel">
          <span slot="label">
            <el-tooltip
              class="item"
              effect="dark"
              content="链接曾经达到的最高等级，如果是新上链接，建议写X，系统会根据销售结果修改"
              placement="top"
            >
              <svg class="icon" preserveAspectRatio="xMidYMid meet">
                <use xlink:href="#icon-question" />
              </svg>
            </el-tooltip>最高等级
          </span>
          <el-radio-group class="el-form-item-width40" v-model="editDetail.highestLinkLevel">
            <el-radio v-for="item in linkLevels" :key="item.code" :label="item.code">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="标准等级" prop="standardLinkLevel">
          <span slot="label">
            <el-tooltip
              class="item"
              effect="dark"
              content="链接长期存在的平均等级，如果是新上链接，建议写X，根据后续实际运营情况修改"
              placement="top"
            >
              <svg class="icon" preserveAspectRatio="xMidYMid meet">
                <use xlink:href="#icon-question"></use>
              </svg>
            </el-tooltip>
            标准等级
          </span>
          <el-radio-group
            class="el-form-item-width40"
            v-model="editDetail.standardLinkLevel"
          >
            <el-radio
              v-for="item in linkLevels"
              :key="item.code"
              :label="item.code"
              >{{ item.name }}</el-radio
            >
          </el-radio-group>
        </el-form-item>-->

        <el-form-item label="商品等级" prop="linkLevel">
          <span slot="label">
            <el-tooltip class="item" effect="dark" content="系统根据链接的销售情况，计算的等级" placement="top">
              <svg class="icon" preserveAspectRatio="xMidYMid meet">
                <use xlink:href="#icon-question" />
              </svg>
            </el-tooltip>商品等级
          </span>
          <el-radio-group disabled class="el-form-item-width40" v-model="editDetail.linkLevel">
            <el-radio v-for="item in linkLevels" :key="item.code" :label="item.code">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品链接状态" prop="linkStatus">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.linkStatus">
            <el-radio :label="0">运营</el-radio>
            <el-radio :label="1">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主打商品" prop="mainLink">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.mainLink">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主图" prop="urlUuid">
          <template #label>
            <span class="required-star">*</span>主图
          </template>
          <OSSFileUpload
            :sign.sync="sign"
            :fileType.sync="fileType"
            :fileRecordList.sync="fileRecordList"
            :isPicture.sync="isPicture"
            :showLoading.sync="showLoading"
            @getFileUrl="getFileUrl"
            @getFileName="getFileName"
            @deleteFile="deleteFile"
            ref="OSSFileUploadRef"
          ></OSSFileUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
        <DebounceButton :type="'primary'" :onClick="submitForm">确 定</DebounceButton>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getLinkList,
  addLink,
  editLink,
  deleteLink,
  getOssSign,
  pullLink,
  downLink,
  exportLink,
  getProductName,
} from '@/api/baseData/linkManage'

import { getDeptTreeData, getFormatDate } from '@/utils/common'
import { department } from '@/api/information/department'
import {
  listPlatform,
  listStore,
  listLinkLevel,
  listAllUpperDept,
  getOSSFileUuid,
  getOSSFileUrl,
  listLinkTimeStatus,
} from '@/api/baseData/common'

import { deepClone } from '@/utils/common'
export default {
  name: 'LinkManage',
  data() {
    return {
      // 链接状态下拉框
      linkStatusList: [
        { name: '运营', code: 0 },
        { name: '下架', code: 1 },
      ],

      //链接阶段的下拉框的数据源
      linkTimeStatusList: [],
      //部门人员的下拉框
      departments: [],
      //店铺下拉框
      storeList: [],
      //项目下拉框
      strategyList: [],
      total: 0,
      linkList: [],
      fileType: ['.jpg', '.png', '.jpeg', '.webp'],

      // 文件上传是否为图片
      isPicture: true,

      // 显示文件上传加载中
      showLoading: true,

      // 文件记录
      fileRecordList: [],

      // 图片大图预览数组
      srcList: [],

      // oss文件上传签名
      sign: {},

      // 获取文件uuid入参
      getUrlUuidReqParams: {
        fileName: '',
        originalName: '',
        platformType: 1,
      },

      // 控制列表加载
      tableLoading: false,

      //详情的弹窗标记
      showDetail: false,

      //部门人员的下拉框
      departments: [],

      //详情的数据
      detail: {},

      //编辑的数据
      editDetail: {
        strategyUuidList: [],
        strategyUuid: '',
        linkTitle: '',
        urlUuid: '',
        linkLevel: '6',
      },

      //是否是编辑
      isEdit: false,
      // 项目对应的spu是否存在
      isSpuUuid: false,

      //新增和编辑的弹窗
      showAddDialog: false,
      //平台下拉框
      platforms: [],

      //店铺下拉框
      stores: [],

      //商品等级下拉框
      linkLevels: [],

      reqParams: {
        keyword: '',
        page: 1,
        pageSize: 20,
        storeUuid: '',
        manager: '',
      },

      linkRules: {
        linkTitle: [
          { required: true, message: '请输入商品标题', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        linkId: [
          { required: true, message: '请输入商品编码', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        storeUuid: [
          { required: true, message: '请选择所属店铺', trigger: 'change' },
        ],
        platform: [
          { required: true, message: '请选择所属平台', trigger: 'change' },
        ],
        manager: [
          { required: true, message: '请选择店铺负责人', trigger: 'change' },
        ],
        listingTime: [
          { required: true, message: '请选择上架时间', trigger: 'change' },
        ],
        strategyUuid: [
          { required: true, message: '请选择项目', trigger: 'change' },
        ],
        // strategyUuidList: [
        //   {
        //     type: 'array',
        //     required: true,
        //     message: '请选择项目',
        //     trigger: 'change',
        //   },
        // ],
        planLinkLevel: [
          { required: true, message: '请选择计划等级', trigger: 'change' },
        ],
        highestLinkLevel: [
          { required: true, message: '请选择最高等级', trigger: 'change' },
        ],
        // standardLinkLevel: [
        //   { required: true, message: "请选择标准等级", trigger: "change" },
        // ],
        linkLevel: [
          { required: true, message: '请选择商品等级', trigger: 'change' },
        ],
        linkStatus: [
          { required: true, message: '请选择商品链接状态', trigger: 'change' },
        ],
        mainLink: [
          { required: true, message: '请选择主打商品', trigger: 'change' },
        ],
        urlUuid: [
          // { required: true, message: '请添加主图', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!this.editDetail.urlUuid) {
                // console.log('收款方式空空空', value)
                callback(new Error('请添加主图'))
              } else {
                // console.log('收款方式有有有', value)
                callback()
              }
            },
            trigger: 'change',
          },
        ],
      },
    }
  },
  created() {
    this.getLinkTimeStatus()

    this.getStoreList()
    //部门和人的级联
    this.getDeptTree()
    //平台下拉框
    this.listPlatform()

    //商品等级的下拉框
    this.listLinkLevel()

    //店铺下拉框
    this.listStore()

    this.getList()

    //项目下拉框
    this.getStrategyList()
  },
  methods: {
    //链接阶段的下拉框
    async getLinkTimeStatus() {
      const res = await listLinkTimeStatus()
      this.linkTimeStatusList = res.data
    },

    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    //获取店铺
    async getStoreList() {
      const res = await listStore()
      this.storeList = res.data
    },
    //获取项目架构数据
    async getStrategyList() {
      const res = await pullLink()
      this.strategyList = res.data
    },
    // 删除文件
    deleteFile(val) {
      this.editDetail.urlUuid = ''
      this.getUrlUuidReqParams = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
    },
    // 获取文件源名称
    getFileName(val) {
      this.getUrlUuidReqParams.originalName = val
    },
    // 根据文件uuid换取url
    async getOSSFileUrlData(uuid) {
      let uuidArr = uuid.split(',')
      const res = await getOSSFileUrl({ uuid: uuidArr })
      return res.data[0]
    },
    // 获取上传后的文件url
    async getFileUrl(val) {
      this.getUrlUuidReqParams.fileName = val
      // 如果上传新文件 重新获取uuid提交
      if (this.getUrlUuidReqParams.fileName !== '') {
        const res = await getOSSFileUuid(this.getUrlUuidReqParams)
        this.editDetail.urlUuid = res.data
        this.$modal.closeLoading()
      }
    },
    // 获取上传文件签名
    async getOssSignData() {
      const res = await getOssSign()
      this.sign = res.data
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    //商品等级的下拉框
    async listLinkLevel() {
      const res = await listLinkLevel()
      this.linkLevels = res.data
    },
    //店铺下拉框
    async listStore() {
      const res = await listStore()
      this.stores = res.data
    },
    //平台下拉框
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },

    //获取列表信息
    async getList(page) {
      this.tableLoading = true
      if (page == 1) {
        this.reqParams.page = page
      }

      if (Array.isArray(this.reqParams.manager)) {
        this.reqParams.manager =
          this.reqParams.manager[this.reqParams.manager.length - 1]
      }

      const res = await getLinkList(this.reqParams)
      // 提取图片列表
      this.srcList = res.data.records
        .filter((item) => item.url && item.url.trim())
        .map((item) => item.url)

      this.linkList = res.data.records
      this.total = res.data.total

      //把上架时间格式化
      for (let i = 0; i < this.linkList.length; i++) {
        var item = this.linkList[i]
        item.listingDate = getFormatDate(item.listingTime)
      }
      this.tableLoading = false
    },

    // 详情
    async getLinkDetail(row) {
      this.showDetail = true
      row.srcList = []
      if (row.url && row.url !== '') {
        row.srcList.push(row.url)
      }
      // 深拷贝当条数据
      this.detail = deepClone(row)
    },

    //清空弹窗内容
    cleanDetail() {
      this.showDetail = false
      this.detail = {}
    },

    // 新增
    addLink() {
      this.isEdit = false
      this.getOssSignData()

      //店铺状态默认是运营
      this.editDetail = {
        linkStatus: 0,
        urlUuid: '',
        strategyUuidList: [],
        strategyUuid: '',
        linkLevel: '6',
        linkTitle: '',
      }
      // this.editDetail.linkStatus = 0

      this.showAddDialog = true
    },

    // 修改
    editLink(row) {
      this.getOssSignData()
      this.isEdit = true
      if (row.url && row.url !== '') {
        this.fileRecordList.push(row.url)
      }

      this.editDetail = deepClone(row)
      if (
        !this.editDetail.strategyUuidList ||
        (this.editDetail.strategyUuidList &&
          this.editDetail.strategyUuidList.length === 0)
      ) {
        this.editDetail.strategyUuidList = []
        this.$set(this.editDetail, 'strategyUuid', '')
      } else {
        const item = this.strategyList.find(
          (item) => this.editDetail.strategyUuidList[0] == item.uuid
        )
        if (item.spuUuid === this.editDetail.linkTitle) {
          this.isSpuUuid = true
        }
        this.editDetail.strategyUuid = this.editDetail.strategyUuidList[0] || ''
      }

      let manager = this.editDetail.manager

      listAllUpperDept({ userUuid: manager }).then((resp) => {
        //把第一位的0去掉
        this.editDetail.manager = resp.data.splice(1)
        //把人员自己也加进数组里
        this.editDetail.manager.push(manager)
      })

      let assistant = this.editDetail.assistant
      //助理的uuid可能为空
      if (assistant) {
        listAllUpperDept({ userUuid: assistant }).then((resp) => {
          //把第一位的0去掉
          this.editDetail.assistant = resp.data.splice(1)
          //把人员自己也加进数组里
          this.editDetail.assistant.push(assistant)
        })
      }
      this.showAddDialog = true
      console.log('editDetail.strategyUuid', this.editDetail.strategyUuid)
    },

    // 关闭新增修改弹层清空表单数据
    cleanAdd() {
      this.showAddDialog = false
      this.$refs['addDetailRef'].resetFields()
      this.isSpuUuid = false
      this.$nextTick(() => {
        this.$refs.OSSFileUploadRef.clearFileList()
      })
      this.getUrlUuidReqParams = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
      this.editDetail = {
        urlUuid: '',
        strategyUuidList: [],
        strategyUuid: '',
        linkLevel: '6',
        linkTitle: '',
      }
      this.fileRecordList = []

      this.isEdit = false
    },

    //新增/编辑的保存
    async submitForm() {
      //必填校验
      this.$refs['addDetailRef'].validate(async (valid) => {
        if (valid) {
          // // 判断是否有主图（主图必传）
          // if (
          //   this.getUrlUuidReqParams.fileName === '' &&
          //   (this.editDetail.urlUuid === '' ||
          //     this.editDetail.urlUuid === undefined)
          // ) {
          //   return this.$message.warning('请上传主图后提交！')
          // }

          // 提取负责人uuid
          if (Array.isArray(this.editDetail.manager)) {
            this.editDetail.manager =
              this.editDetail.manager[this.editDetail.manager.length - 1]
          }
          // 提取助理uuid
          if (Array.isArray(this.editDetail.assistant)) {
            this.editDetail.assistant =
              this.editDetail.assistant[this.editDetail.assistant.length - 1]
          }
          this.editDetail.linkId = this.editDetail.linkId.trim()
          if (!this.editDetail.assistant) {
            this.editDetail.assistant = ''
          }
          this.editDetail.strategyUuidList = [this.editDetail.strategyUuid]
          if (this.isEdit) {
            await editLink(this.editDetail)
          } else {
            await addLink(this.editDetail)
          }

          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })

          //关闭弹窗
          this.cleanAdd()
          //刷新数据
          this.getList()
        }
      })
    },
    // 下架
    async downLink(id) {
      const res = await downLink({ uuid: id })
      if (res) {
        this.getList()
        this.$message({
          type: 'success',
          message: '下架成功！',
        })
      }
    },
    // 删除
    deleteLink(id) {
      let ids = []
      ids.push(id)

      this.$confirm('确定删除此商品，删除后不可恢复？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            const [err, res] = await this.$to(deleteLink({ ids: ids }))
            if (err) {
              console.error('链接删除失败', err)
            }
            instance.confirmButtonLoading = false
            await done()
            await this.getList()
            if (res) {
              this.$message({
                type: 'success',
                message: '删除商品成功！',
              })
            }
          } else {
            await done()
          }
        },
      })
    },
    // 导出
    exportLink() {
      this.download(
        '/server/link_manage/export',
        { ...this.reqParams },
        `商品数据导出_${new Date().getTime()}.xlsx`
      )
    },
    //模糊查询产品名称
    async querySearch(queryString, cb) {
      if (!queryString) {
        return
      }
      const res = await getProductName({ name: queryString })
      const nameList = res.data.map((item) => {
        return {
          value: item.name,
        }
      })
      cb(nameList)
    },
    getSpuUuid(value) {
      console.log('this.editDetail.strategyUuid', this.editDetail.strategyUuid)

      if (value == '') {
        this.editDetail.linkTitle = ''
        this.isSpuUuid = false
        return
      }
      const item = this.strategyList.find((item) => item.uuid === value)
      if (item.spuUuid != null) {
        // console.log(item.spuUuid)
        this.editDetail.linkTitle = item.spuUuid
        this.isSpuUuid = true
      } else {
        this.editDetail.linkTitle = ''
        this.isSpuUuid = false
      }
    },
    clearStrategy() {
      this.editDetail.linkTitle = ''
      this.isSpuUuid = false
    },
  },
}
</script>

<style scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: #606266;
}
</style>
