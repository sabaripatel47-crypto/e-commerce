<template>
  <div class="afterSales_reissue">
    <!-- 搜索 -->
    <div class="page_search">
      <el-form :inline="true" :model="reqParams" ref="page-filter">
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px">
          <el-date-picker
            v-model="reTimeScope"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            @change="changeSpuTimeScope"
            style="padding-right: 20px;width:250px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="店铺：" class="search_item">
          <el-select v-model="reqParams.storeUuid" filterable clearable placeholder="请选择店铺">
            <el-option
              v-for="item in storeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补发类型：" class="search_item">
          <el-select v-model="reqParams.reissueType" filterable clearable placeholder="请选择补发类型">
            <el-option
              v-for="item in ressisueDatalist"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <template>
            <el-checkbox v-model="reqParams.isCancel" @change="getchecked()">显示作废</el-checkbox>
          </template>
        </el-form-item>
        <el-form-item style="margin-left:20px">
          <el-button type="primary" icon="el-icon-search" @click="getList(1)">查询</el-button>
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addList()">新增</el-button>
        </el-form-item>-->
        <br />
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <!-- 表格 -->
      <el-table :data="tableList" style="width: 100%" border v-loading="tableLoading">
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="createTime" label="登记日期" align="center" width="100px"></el-table-column>
        <!-- <el-table-column prop="createUser" label="登记人" align="center"></el-table-column> -->
        <el-table-column prop="orderNumber" label="订单号" align="center" width="120px"></el-table-column>
        <el-table-column
          prop="platformName"
          label="平台"
          align="center"
          width="75px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="storeName" label="店铺名称" align="center" width="160px"></el-table-column>
        <el-table-column prop="spaceName" label="产品名称" align="center" width="200px">
          <template v-slot="{ row }">
            <div v-for="(item, index) in row.spuSpaceName">{{item}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="reissueName" label="补发类型" align="center" width="90px"></el-table-column>
        <el-table-column prop="reason" label="原因" min-width="160px" align="center"></el-table-column>
        <el-table-column label="补发货品" align="center" width="260px">
          <template v-slot="{ row }">
            <div v-for="(item,index) in row.reissueGoods">
              <span>{{item.spaceName || '无'}}</span>--
              <span>数量：{{item.num || '无'}}</span>
              <div>商家编码：{{item.skuCode || '无'}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="imageFileList" label="问题图片" align="center" width="120px">
          <template v-slot="{ row }">
            <el-image
              v-for="(item, index) in row.urlUuidVOList"
              :key="index"
              style="height: 30px; width: 30px"
              :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              @click="handlePictureCardPreview(item.url)"
              :initial-index="0"
              :preview-src-list="[item.url]"
            ></el-image>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="address" label="地址" align="center"></el-table-column> -->
        <el-table-column prop="pageShowName" label="状态" align="center" width="80px"></el-table-column>
        <!-- <el-table-column prop="remark" label="备注" align="center"></el-table-column> -->
        <el-table-column label="操作" width="160px" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-view" @click="getLinkDetail(row)">详情</el-button>
            <el-button
              v-if="row.reissueStatus === 0 && row.cancelStatus === 0"
              size="mini"
              type="text"
              icon="el-icon-success"
              @click="checkLink(row)"
            >确认</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              v-if="row.cancelStatus === 0"
              @click="deleteLink(row.uuid)"
            >作废</el-button>

            <!-- <el-button v-if="row.cancelStatus === 0" size="mini" type="text" icon="el-icon-edit" @click="editLink(row)">修改</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList()"
      />
    </div>

    <!-- 详情弹层 -->
    <el-dialog title="补发详情" :visible="showDetail" :before-close="cleanDetail" width="50%">
      <el-descriptions :column="2">
        <el-descriptions-item label="订单号">{{ detailReqParams.orderNumber }}</el-descriptions-item>
        <el-descriptions-item label="登记人">{{ detailReqParams.createUser }}</el-descriptions-item>
        <el-descriptions-item label="登记时间">{{ detailReqParams.createTime }}</el-descriptions-item>
        <el-descriptions-item label="所属平台">{{ detailReqParams.platformName }}</el-descriptions-item>
        <el-descriptions-item label="店铺">{{ detailReqParams.storeName }}</el-descriptions-item>
        <!-- <el-descriptions-item label="产品名称">
          <template>
            <div>
              <div v-for="item in detail.spu-list"
                  :key="item">{{ item }}
              </div>
            </div>
          </template>
        </el-descriptions-item>-->
        <el-descriptions-item label="收件人">{{ detailReqParams.recipient }}</el-descriptions-item>
        <el-descriptions-item label="收件地址">{{ detailReqParams.address }}</el-descriptions-item>
        <el-descriptions-item label="联系人电话">{{ detailReqParams.phone }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">
          <template>
            <div>
              <div v-for="item in detailReqParams.spuSpaceName" :key="item">{{ item }}</div>
            </div>
          </template>
        </el-descriptions-item>
        <template v-for="(item,index) in detailReqParams.reissueGoods">
          <el-descriptions-item :label="'补发货品'+(index+1)" v-if="item.spaceName || item.num">
            <template>
              <div>
                <div>名称：{{item.spaceName || '无'}}</div>
                <div>商家编码：{{item.skuCode || '无'}}</div>
                <div>数量：{{item.num || '无'}}</div>
              </div>
            </template>
          </el-descriptions-item>
        </template>
        <el-descriptions-item label="补发类型">{{ detailReqParams.reissueName }}</el-descriptions-item>
        <el-descriptions-item label="补发状态">{{ detailReqParams.reissueStatusName }}</el-descriptions-item>
        <el-descriptions-item label="补发原因">{{ detailReqParams.reason || '无'}}</el-descriptions-item>
        <!-- <span v-for="(item,index) in detailReqParams.reissueGoods" :key="index">
            <el-descriptions-item label="补发货品名称">{{item.spaceName}}</el-descriptions-item>
            <el-descriptions-item label="补发货品数量">{{item.num}}</el-descriptions-item>
        </span>-->
        <el-descriptions-item label="备注">{{ detailReqParams.remark || '无'}}</el-descriptions-item>
        <el-descriptions-item label="问题图片">
          <template>
            <span v-if="detailReqParams.urlUuidVOList && detailReqParams.urlUuidVOList.length > 0">
              <el-image
                v-for="(item,index) in detailReqParams.urlUuidVOList"
                :key="index"
                style="height: 30px;width: 30px;"
                :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[item.url]"
              ></el-image>
            </span>

            <span v-else>暂无主图</span>
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="作废原因">{{ detailReqParams.cancelReason || '无'}}</el-descriptions-item>
      </el-descriptions>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="showDetail = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog
      :title="isEdit ? '修改补发' : '新增补发'"
      :visible="showAddDialog"
      @close="closeAddDialog"
      :close-on-click-modal="false"
      width="40%"
    >
      <el-form
        :model="editDetail"
        ref="addRef"
        label-width="100px"
        class="demo-dynamic"
        :rules="linkRules"
      >
        <el-form-item label="订单号：" class="search_item" prop="orderNumber">
          <el-input placeholder="请输入订单号" v-model="editDetail.orderNumber" class="handle_input"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="getIdList()">查询</el-button>
        </el-form-item>
        <el-form-item label="平台：" class="search_item" prop="platformName">
          <el-input
            disabled
            placeholder="请填写平台"
            v-model="editDetail.platformName"
            class="handle_input"
          ></el-input>
        </el-form-item>
        <el-form-item label="店铺：" class="search_item" prop="storeName">
          <el-input
            disabled
            placeholder="请填写店铺"
            v-model="editDetail.storeName"
            class="handle_input"
          ></el-input>
        </el-form-item>
        <el-form-item label="规格型号：" style="margin-right: 20px;" prop="spaceName">
          <el-cascader
            style="width: 290px;"
            filterable
            placeholder="规格型号"
            :options="department"
            v-model="editDetail.spaceName"
            :show-all-levels="false"
            :props="{ children: 'children', label: 'name', value: 'uuid', checkStrictly: false, multiple: true }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="补发类型：" class="search_item" prop="reissueType">
          <el-select v-model="editDetail.reissueType" clearable placeholder="请选择状态">
            <el-option
              v-for="item in ressisueDatalist"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="原因：" class="search_item" prop="reason">
          <el-input
            maxlength="50"
            show-word-limit
            type="textarea"
            :rows="2"
            placeholder="请输入原因"
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="editDetail.reason"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="补发货品1：" style="margin-right: 20px">
            <el-select v-model="reissueName" clearable filterable :filter-method="filterMethod"
              v-el-select-loadmore="loadMore()" @visible-change="visibleChange">
              <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                :label="item.value" :value="item.uuid">
              </el-option>
            </el-select>
            <el-input placeholder="数量" v-model="editDetail.num" class="add_input"></el-input>
          </el-form-item>
        <el-form-item label="补发货品2：" style="margin-right: 20px">
            <el-select v-model="editDetail.reissueGoods[0].skuUuid" clearable filterable :filter-method="filterMethod"
              v-el-select-loadmore="loadMore()" @visible-change="visibleChange">
              <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                :label="item.value" :value="item.uuid">
              </el-option>
            </el-select>
            <el-input placeholder="数量" v-model="editDetail.num" class="add_input"></el-input>
          </el-form-item>
        <el-form-item label="补发货品3：" style="margin-right: 20px">
            <el-select v-model="reissueName" clearable filterable :filter-method="filterMethod"
              v-el-select-loadmore="loadMore()" @visible-change="visibleChange">
              <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                :label="item.value" :value="item.uuid">
              </el-option>
            </el-select>
            <el-input placeholder="数量" v-model="editDetail.num" class="add_input"></el-input>
          </el-form-item>
        <el-form-item label="补发货品4：" style="margin-right: 20px">
            <el-select v-model="reissueName" clearable filterable :filter-method="filterMethod"
              v-el-select-loadmore="loadMore()" @visible-change="visibleChange">
              <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                :label="item.value" :value="item.uuid">
              </el-option>
            </el-select>
            <el-input placeholder="数量" v-model="editDetail.num" class="add_input"></el-input>
          </el-form-item>
        <el-form-item label="补发货品5：" style="margin-right: 20px">
            <el-select v-model="reissueName" clearable filterable :filter-method="filterMethod"
              v-el-select-loadmore="loadMore()" @visible-change="visibleChange">
              <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                :label="item.value" :value="item.uuid">
              </el-option>
            </el-select>
            <el-input placeholder="数量" v-model="editDetail.num" class="add_input"></el-input>
        </el-form-item>-->
        <el-form-item
          v-for="(item, index) in editDetail.reissueGoods"
          :label="'补发货品' + (index + 1) "
          :key="index"
        >
          <!-- <el-select v-model="item.skuUuid" clearable filterable :filter-method="filterMethod"
               v-el-select-loadmore="loadMore" @visible-change="visibleChange">
              <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                :label="item.value" :value="item.uuid">
              </el-option>
          </el-select>-->
          <div style="display:flex">
            <el-form-item
              :prop="'reissueGoods.' + index + '.skuUuid'"
              :rules="reissueGoodsRules(item,index)"
            >
              <!-- <el-select v-model="item.skuUuid" clearable filterable :filter-method="filterMethod"
                v-el-select-loadmore="loadMore" @visible-change="visibleChange">
                <el-option v-for="(item, index) in reissueArrName" :key="item.uuid"
                  :label="item.value" :value="item.uuid">
                </el-option>
              </el-select>-->
              <el-select v-model="item.skuUuid" clearable filterable :filter-method="filterMethod">
                <el-option
                  v-for="(item, index) in reissueArrName"
                  :key="item.uuid"
                  :label="item.value"
                  :value="item.uuid"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-input
            :ref="`input${index}`"
            class="form_input"
            placeholder="请输入货品"
            v-model="item.expressNum"
            @keydown.enter.native="changeNextInput($event, index)"
            ></el-input>-->
            <el-form-item
              :prop="'reissueGoods.' + index + '.num'"
              :rules="reissueGoodsNumRules(item,index)"
            >
              <el-input
                oninput="value=value.replace(/[^1-9]\d*/g, '')"
                placeholder="数量"
                v-model="item.num"
                class="add_input"
              ></el-input>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="问题图片" prop="urlUuidList">
          <OSSFileUpload
            :sign.sync="sign"
            :fileType.sync="fileType"
            :limitNum.sync="limitNums"
            :fileRecordList.sync="fileRecordList"
            :isPicture.sync="isPicture"
            :showLoading.sync="showLoading"
            @getFileUrl="getFileUrl"
            @getFileName="getFileName"
            @deleteFile="deleteFile"
            ref="OSSFileUploadRef"
          ></OSSFileUpload>
        </el-form-item>
        <el-form-item label="收件人：" class="search_item" prop="recipient">
          <el-input placeholder v-model="editDetail.recipient" class="handle_input"></el-input>
        </el-form-item>
        <el-form-item label="联系人电话：" class="search_item" prop="phone" label-width="105.7px">
          <el-input
            oninput="value=value.replace(/[^1-9]\d*/g, '')"
            maxlength="11"
            placeholder
            v-model="editDetail.phone"
            class="handle_input"
          ></el-input>
        </el-form-item>
        <el-form-item label="收件地址：" class="search_item" prop="address">
          <el-input placeholder v-model="editDetail.address" class="handle_input"></el-input>
        </el-form-item>
        <el-form-item label="备注：" class="search_item" prop="remark">
          <el-input
            maxlength="200"
            show-word-limit
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            :autosize="{ minRows: 5, maxRows: 4}"
            v-model="editDetail.remark"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <!-- <el-button @click="addExpressNum">新增快递单号</el-button> -->
          <el-button style="margin-right:100px" type="primary" @click="submitForm('addRef')">提 交</el-button>
          <el-button @click="cleanAdd">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      title="作废原因"
      :visible="cancelDialog"
      @close="closeDialog"
      :close-on-click-modal="false"
      width="25%"
    >
      <el-form :model="editDetail" ref="addRefs" class="cancelADD">
        <el-form-item class="search_item" prop="expressNum">
          <el-input
            maxlength="200"
            show-word-limit
            type="textarea"
            :rows="4"
            placeholder="请输入作废原因"
            :autosize="{ minRows: 6, maxRows: 6}"
            v-model="editDetail.cancelReason"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDelForm()">提 交</el-button>
          <el-button @click="cancelDialog = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>-->
  </div>
</template>

<script>
import {
  getExpressList,
  getStatusList,
  addExpressList,
  deleteExpress,
  affirmExpress,
} from '@/api/expressManage/expressEnter'
import { getYesterdayMidnightTimestamp } from '@/utils/common.js'
import { getOSSFileUuid, listStore } from '@/api/baseData/common'
import { deepClone, getDeptTreeData } from '@/utils/common'
import {
  getOrderDetail,
  addList,
  spuList,
  pageList,
  getDetail,
  update,
  determine,
  getOssSign,
  UpdateCustomerCancel,
  UpdateAfterSalesCancel,
} from '@/api/afterSales/reissue'
import { listReissueType } from '@/api/baseData/common.js'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { getFormatDate } from '@/utils/common'
export default {
  name: 'ExpressEnter',
  data() {
    return {
      //默认时间
      // INIT_TIME_START: 1727020800000,
      // INIT_TIME_END: 1727020800000,
      size: '',

      //详情弹框列表
      detailReqParams: {},

      //作废uuid
      deluuid: '',

      //补发查询或者是补发登记页面
      cancelSign: {
        reissue_QUERY: 2, //补发查询
        reissue_CHECK: 1, //补发登记
      },

      //登记还是确认的状态
      compensateStatuEnum: {
        REGISTERED: 0, //已登记
        CONFIRMED: 1, //已确认
      },

      //作废状态
      comensateVoidEnum: {
        NOT_VOID: 0, //未作废
        CUSTOMER_VOID: 1, //客服作废
        AFTERSALE_VOID: 2, //售后作废
      },
      limitNums: 3,
      dialogImageUrl: '',
      dialogVisible: false,

      //店铺下拉框
      storeList: [],
      //补发名称输入框分页
      reissueNamePage: {
        page: 1,
        pageSize: 10,
      },

      // 控制列表加载
      tableLoading: false,

      //补发货品名称
      reissueName: [],

      //筛选后的补发货品名称
      reissueArrName: [],

      //补发类型下拉框数据
      ressisueDatalist: [],

      // 状态下拉框数据
      statusDataList: [],

      //时间范围
      reTimeScope: [],

      // 查询入参
      reqParams: {
        startTime: null, // 开始时间
        endTime: null, //结束时间
        expressStatus: null, // 状态
        storeUuid: '', // 店铺
        reissueType: '', //补发类型
        page: 1, // 页码
        pageSize: 20, // 页数量
        expressNum: '', // 快递单号
        isCancel: false, // 是否作废
      },

      //详情弹窗弹出框
      showDetail: false,

      // 控制新增修改补发弹出框
      showAddDialog: false,

      //控制作废弹出框
      cancelDialog: false,

      // 新增的快递单号
      // editDetail: {
      //   list: [
      //     { expressNum: '' },
      //     { expressNum: '' },
      //     { expressNum: '' },
      //     { expressNum: '' },
      //     { expressNum: '' },
      //   ],
      // },

      // 表格数据
      tableList: [],

      total: 0,

      // oss文件上传签名
      sign: {},

      fileType: ['.jpg', '.png', '.jpeg', '.webp'],

      // 文件记录
      fileRecordList: [],

      // 图片大图预览数组
      srcList: [],

      // 文件上传是否为图片
      isPicture: true,

      // 显示文件上传加载中
      showLoading: true,

      // 获取文件uuid入参
      getUrlUuidReqParams: {
        fileName: '',
        originalName: '',
        platformType: 1,
      },

      //详情列表的数据
      detail: {},

      //编辑的数据
      editDetail: {
        reissueGoods: [
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
        ],
        urlUuid: '',
        storeName: null,
        platformName: null,
        spaceName: '',
        recipient: '',
        phone: '',
        address: '',
        remark: '',
        orderUuid: '',
        storeUuid: '',
        platform: '',
        urlUuidList: [],
        urlUuidVOList: [],
        cancelReason: '',
        //单选框
        isCancel: false,
      },

      //补发类型下拉框
      department: [],
      //是否是编辑
      isEdit: false,

      linkRules: {
        orderNumber: [
          { required: true, message: '请输入订单号', trigger: 'blur' },
        ],
        platformName: [
          { required: true, message: '请选择所属平台', trigger: 'blur' },
        ],
        storeName: [
          { required: true, message: '请选择所属店铺', trigger: 'blur' },
        ],
        spaceName: [
          { required: true, message: '请选择规格型号', trigger: 'blur' },
        ],
        reissueType: [
          { required: true, message: '请选择补发类型', trigger: 'blue' },
        ],
        reason: [{ required: true, message: '请填写原因', trigger: 'blur' }],
        // urlUuidList: [
        //   {type:'array',required: true, message: '请添加主图', trigger: 'blur'}
        // ],
        recipient: [
          { required: true, message: '请输入收件人', trigger: 'blur' },
        ],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        address: [
          { required: true, message: '请输入收件地址', trigger: 'blur' },
        ],
      },
    }
  },
  async created() {
    this.setday()
    await this.getStoreList()
    await this.getList()
    await this.getStatusData()
    await this.getOssSignData()
    await this.listReissueTypeData()
    await this.loadMore()
  },
  directives: {
    'el-select-loadmore': (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          const condition =
            this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) binding.value()
        })
      }
    },
  },
  methods: {
    //关闭作废弹框
    closeDialog() {
      this.cancelDialog = false
      this.editDetail.cancelReason = ''
    },
    getFormatDate(date) {
      return getFormatDate(date)
    },
    //修改补发时间范围
    changeSpuTimeScope(val) {
      console.log('val: ', val)
    },
    //点击单选框
    getchecked() {
      this.getList()
    },
    //获取今天0点时间
    setday() {
      var todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      var timestamp = todayStart.getTime()
      console.log(timestamp, '1111')
      this.reqParams.startTime = timestamp
      this.reqParams.endTime = timestamp
      this.reTimeScope = [this.reqParams.startTime, this.reqParams.endTime]
    },
    // 设置默认补发时间
    setDefaultSpuTime() {
      this.reqParams.startTime = this.INIT_TIME_START + ''
      this.reqParams.endTime = this.INIT_TIME_END + ''
      // this.searchParams.startTime = getYesterdayMidnightTimestamp()
      // this.searchParams.endTime = getYesterdayMidnightTimestamp()
      this.reTimeScope = [this.reqParams.startTime, this.reqParams.endTime]
    },
    //获取店铺
    async getStoreList() {
      const res = await listStore()
      this.storeList = res.data
    },
    // 补发类型名称下拉框加载更多
    async loadMore(n) {
      if (this.reissueNamePage.page < 5) {
        let res1 = await spuList(this.reissueNamePage)
        this.reissueArrName = res1.data.records
        console.log('this.reissueArrName', this.reissueArrName)
        this.reissueNamePage.page++
      }
    },
    // 下拉框出现时，调用过滤方法
    visibleChange(flag) {
      if (flag) {
        this.filterMethod()
      }
    },
    filterMethod: debounce(async function (filterVal) {
      console.log('filterVal: ', filterVal)
      // this.reissueNamePage.page = 1
      let res1 = await spuList(this.reissueNamePage)
      this.reissueArrName = res1.data.records
    }),
    //新增补发查询接口
    async getIdList() {
      const res = await getOrderDetail(this.editDetail.orderNumber)
      this.editDetail.platformName = res.data.platformName
      this.editDetail.storeName = res.data.storeName
      this.editDetail.orderUuid = res.data.orderUuid
      this.editDetail.storeUuid = res.data.storeUuid
      this.editDetail.platform = res.data.platform
      this.department = await getDeptTreeData(res.data.spaceList)
    },
    changeSpuSearchGrade() {},
    //弹出框取消按钮
    cleanAdd() {
      this.showAddDialog = false

      this.$refs['addRef'].resetFields()

      this.editDetail = {}

      this.isEdit = false
    },
    // 删除文件
    deleteFile(val) {
      console.log('valllll', val)
      this.editDetail.urlUuidVOList.forEach((item, index) => {
        if (item.url === val) {
          this.editDetail.urlUuidVOList.splice(index, 1)
        }
      })
      this.editDetail.urlUuidList = ''
      // this.getUrlUuidReqParams = {
      //   fileName: '', // 文件地址
      //   originalName: '', // 源文件名
      //   platformType: 1,
      // }
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
        if (!this.editDetail.urlUuidList) {
          this.editDetail.urlUuidList = []
        }
        this.editDetail.urlUuidList.push(res.data)

        this.$modal.closeLoading()
      }
    },
    // 获取上传文件签名
    async getOssSignData() {
      const res = await getOssSign()
      this.sign = res.data
    },
    changeNextInput(event, index) {
      event.preventDefault()
      if (this.$refs[`input${index + 1}`]) {
        this.$refs[`input${index + 1}`][0].focus()
      }
    },
    handlePictureCardPreview(utl) {
      this.dialogImageUrl = utl
      this.dialogVisible = true
    },
    // 查询
    async getList(page) {
      // this.tableLoading = true
      if (page == 1) {
        this.reqParams.page = page
      }
      this.reqParams.startTime = this.reTimeScope[0]
      this.reqParams.endTime = this.reTimeScope[1]
      const res = await pageList(this.reqParams)
      this.tableList = res.data.records
      this.total = res.data.total
      console.log('查询列表数据', res)
    },

    //获取补发类型下拉框数据
    async listReissueTypeData() {
      const res = await listReissueType()
      this.ressisueDatalist = res.data
    },

    // 获取下拉框数据
    async getStatusData() {
      const res = await getStatusList()
      this.statusDataList = res.data
      console.log('下拉框数据', res)
    },

    // 点击确认
    async checkLink(row) {
      const res = await determine({
        uuid: row.uuid,
        cancelSign: this.cancelSign.reissue_QUERY,
      })
      await this.getList()
    },

    // 点击删除
    async deleteExpressData(uuid) {
      this.$to(
        this.$confirm('确定删除此快递单？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteExpress({ uuid: uuid })
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },

    // 详情
    async getLinkDetail(row) {
      this.showDetail = true
      let res = await getDetail(row.uuid)
      this.detailReqParams = res.data
      console.log(res, '}}}}}')
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

    // 修改
    async editLink(row) {
      this.fileRecordList = []
      this.getOssSignData()
      this.isEdit = true
      row.urlUuidVOList.forEach((item) => {
        this.fileRecordList.push(item.url)
      })

      this.isEdit = true
      this.showAddDialog = true
      let res1 = await getDetail(row.uuid)
      const res = await getOrderDetail(row.orderNumber)
      this.department = await getDeptTreeData(res.data.spaceList)
      this.editDetail = res1.data
      // this.editDetail.phone = this.editDetail.tel === null ? '' : this.editDetail.tel
      let speceName = []
      this.editDetail.treeNodeIdVOList.forEach((item) => {
        speceName.push([item.parentId, item.childrenId])
      })
      // 处理补发货品
      let goodsArrLength = 5 - this.editDetail.reissueGoods.length
      if (goodsArrLength) {
        for (let index = 0; index < goodsArrLength; index++) {
          this.editDetail.reissueGoods.push({
            num: null,
            skuUuid: '',
            soreType: 1,
          })
        }
      }
      this.editDetail.spaceName = speceName
      // this.editDetail.urlUuidList = []
      // this.editDetail.urlUuidVOList.map(item => {
      //   this.editDetail.urlUuidList.push(item.uuid)
      // })
      console.log('editDetail', this.editDetail)
    },

    //作废按钮
    async deleteLink(uuid) {
      this.cancelDialog = true
      this.deluuid = uuid
    },

    //作废提交按钮
    async submitDelForm() {
      const res = await UpdateAfterSalesCancel({
        cancelReason: this.editDetail.cancelReason,
        uuid: this.deluuid,
      })
      this.$message({
        type: 'success',
        message: '作废成功！',
      })
      this.cancelDialog = false
      this.editDetail.cancelReason = ''
      await this.getList()
    },
    // 关闭新增弹层
    closeAddDialog() {
      console.log('this.editDetail.list: ', this.editDetail.list)
      // if (this.editDetail.list.length !== 0) {
      //   this.$refs.addRef.resetFields()
      // }
      this.showAddDialog = false

      this.$nextTick(() => {
        this.$refs.OSSFileUploadRef.clearFileList()
      })
      ;(this.editDetail = {
        reissueGoods: [
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
          {
            num: null,
            skuUuid: '',
            soreType: 1,
          },
        ],
        urlUuid: '',
        storeName: null,
        platformName: null,
        spaceName: '',
        recipient: '',
        phone: '',
        address: '',
        remark: '',
        skuUuid: '',
        urlUuidList: [],
      }),
        (this.fileRecordList = [])
      this.$refs['addRef'].resetFields()
    },

    // 快递单号 +1
    addExpressNum(event) {
      console.log('event: ', event)

      this.editDetail.list.push({
        expressNum: '',
        key: Date.now(),
      })
    },

    // 校验补发货品
    reissueGoodsRules(item, index) {
      return [
        {
          trigger: 'change',
          validator: (rule, value, callback) => {
            if (!item.skuUuid && item.num) {
              callback(new Error('货品名称必须填写'))
            } else {
              callback()
            }
          },
        },
      ]
    },
    reissueGoodsNumRules(item, index) {
      return [
        {
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (item.skuUuid && !item.num) {
              callback(new Error('数量必须填写'))
            } else {
              callback()
            }
          },
        },
      ]
    },
  },
}
</script>

<style lang="scss" scoped>
.afterSales_reissue {
  padding: 40px;
  .page_search {
    .search_item {
      margin-right: 20px;
    }
  }

  .handle_input {
    width: 20vw;
  }

  .add_input {
    margin-left: 20px;
    width: 8vw;
  }

  .form_input {
    width: 20vw;
    margin-right: 6px;
  }
  .cancelADD {
    padding-left: 10px;
  }
}
</style>
