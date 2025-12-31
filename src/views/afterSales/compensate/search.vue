<template>

<div class="app-container">
    <div class="container">
      <el-form class="page-search" inline>
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px;">
          <el-date-picker
            v-model="dateRange"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px;">
          <el-select v-model="compensateReq.platform" placeholder="请选择平台" clearable>
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺：" prop="storeUuid" style="margin-right: 20px;">
          <el-select filterable v-model="compensateReq.storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补偿类型：" style="margin-right: 20px;">
          <el-select v-model="compensateReq.compensateType" placeholder="请补偿类型" clearable>
            <el-option
              v-for="item in listCompensates"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-checkbox v-model="compensateReq.isVoid">显示作废</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getCompensateList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
  
      <el-table
        v-loading="compensateLoading"
        :max-height="tabHeight"
        :data="compensateDataList"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
        <el-table-column prop="createTime" label="登记时间" align="center" width="100" >
          <template v-slot="{ row }">
            {{
              getFormatDateFun(row.createTime)
            }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createUser" label="登记人" align="center" width="80" show-overflow-tooltip></el-table-column> -->
        <el-table-column prop="originalOrderId" label="订单号" align="center" ></el-table-column>
        <el-table-column prop="platformName" label="所属平台" align="center" width="80"></el-table-column>
        <el-table-column prop="storeName" label="店铺名称" align="center" width="150"></el-table-column>
        <el-table-column label="产品名称" align="center" show-overflow-tooltip>
          <template v-slot="{ row }">
            <div v-for="item in row.spuNameList"
              :key="item">{{ item }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="compensateTypeName" label="补偿类型" align="center" width="80"></el-table-column>
        <el-table-column prop="reason" label="原因" align="center" ></el-table-column>
        <el-table-column prop="amount" label="金额" align="center" width="80"></el-table-column>
        <el-table-column prop="collectionUrl" label="收款方式" align="center" width="80">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.collectionUrl"
              style="height: 30px; width: 30px"
              :src="row.collectionUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.collectionUrl]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" align="center" width="80"></el-table-column>
        <!-- <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip></el-table-column> -->
        <el-table-column label="操作" width="180" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-view" @click="detail(row.uuid)" >详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="confirmCompensate(row.uuid)" v-if="row.compensateStatus === compensateStatusEnum.REGISTERED && row.compensateVoid === compensateVoidEnum.NOT_VOID">确认</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="cancelCompensate(row.uuid)" v-if="row.compensateVoid === compensateVoidEnum.NOT_VOID">作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="compensateTotal > 0"
          :total="compensateTotal"
          :page.sync="compensateReq.page"
          :limit.sync="compensateReq.pageSize"
          @pagination="getCompensateList()"
        />
      </div>



      <!-- 详情弹窗 -->
      <el-dialog title="详情" :visible.sync="compensateDetailShow" width="40%" :before-close="closeDetail" :close-on-click-modal="false">
        <el-descriptions :column="2">
          <el-descriptions-item label="订单号">{{ detailReqParams.originalOrderId }}</el-descriptions-item>
          <el-descriptions-item label="登记人">{{ detailReqParams.createUser }}</el-descriptions-item>
          <el-descriptions-item label="登记时间">{{ getFormatDateFun(detailReqParams.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="所属平台">{{ detailReqParams.platformName }}</el-descriptions-item>
          <el-descriptions-item label="店铺">{{ detailReqParams.storeName }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">
            <template>
              <div>
                <div v-for="item in detailReqParams.spuNameList"
                  :key="item">{{ item }}
                </div>
              </div>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="补偿类型">{{ detailReqParams.compensateTypeName }}</el-descriptions-item>
          <el-descriptions-item label="原因">{{ detailReqParams.reason }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ detailReqParams.amount }}</el-descriptions-item>
          <el-descriptions-item label="收款方式">
            <template>
              <el-image
                v-if="detailReqParams.collectionUrl"
                style="height: 30px;width: 30px;"
                :src="detailReqParams.collectionUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[detailReqParams.collectionUrl]"
              ></el-image>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailReqParams.remark }}</el-descriptions-item>
          <el-descriptions-item label="作废理由">{{ detailReqParams.voidReason }}</el-descriptions-item>
        </el-descriptions>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="small" @click="closeDetail">关 闭</el-button>
        </span>
      </el-dialog>

      <!--作废弹窗-->
      <el-dialog :visible.sync="cancellationShow" width="30%" :before-close="closeCancellation">
        <el-form
          label-width="80px"
          label-position="right"
          :model="cancellationData"
          :rules="cancellationRule"
          ref="cancellationRef"
        >
          <el-form-item label="作废理由" prop="voidReason">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" show-word-limit maxlength="50" placeholder="请输入原因" v-model="cancellationData.voidReason"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeCancellation">取 消</el-button>
          <el-button type="primary" size="small" @click="submitCancellation">确 定</el-button>
        </span>
      </el-dialog>

    </div>
  </div>

</template>


<script>

import {
  addDay,
  addDayEnd,
} from '@/utils/common.js'
import { listPlatform, listStore,listCompensateType } from '@/api/baseData/common'
import { getFormatDate } from '@/utils/common'
import { financeList,details,getCompensateOssSign,financeVoid,confirmed } from '@/api/afterSales/compensate'


export default {
  name: 'CompensateSearch',
  data() {
    return {
      //登记还是确认的状态
      compensateStatusEnum:{
        REGISTERED:0,  //已登记
        CONFIRMED:1,   //已确认
      },

      //作废状态
      compensateVoidEnum:{
        NOT_VOID:0,   //未作废
        CUSTOMER_VOID:1, //客服作废
        FINANCE_VOID:2,  //财务作废
      },

      //开始时间和结束时间
      INIT_TIME_START: null,
      INIT_TIME_END: null,

      tabHeight: 600,

      //补偿查询的model
      compensateReq:{
        //是否显示作废,true只显示作废，false不显示作废
        isVoid:false,
        pageSize: 20,
      },

      //时间组件的筛选
      dateRange:[],

      //补偿列表的分页总条数
      compensateTotal: 0,

      //平台下拉框的值
      platforms: [],

      //补偿类型下拉框的值
      listCompensates:[],

      //店铺下拉框的值
      stores: [],

      //列表的加载动画标记
      compensateLoading:false,

      //补偿列表
      compensateDataList:[],

      //详情弹窗是否显示的标记
      compensateDetailShow:false,

      //新增和修改保存的对象
      detailReqParams:{},

      //订单查询失败的时候的提示
      orderErrorMsg:"",

      // oss文件上传签名
      sign: {},

      //图片格式限定
      fileType: ['.gif','.jpg', '.png', '.jpeg', '.webp'],

      // 文件上传是否为图片
      isPicture: true,

      // 显示文件上传加载中
      fileShowLoading: true,

      // 获取文件uuid入参
      getUrlUuidReqParams: {
        fileName: '',
        originalName: '',
        platformType: 1,
      },

      //作废的弹窗是否显示
      cancellationShow:false,

      //作废的数据
      cancellationData:{},

      //作废规则
      cancellationRule:{
        voidReason: [{required: true, message: "请输入作废原因", trigger: "blur"}],
      }
    }
  },
  created() {
    this.INIT_TIME_START = addDay(0)
    this.INIT_TIME_END = addDayEnd(0)

    //设置查询的默认时间
    this.dateRange = [this.INIT_TIME_START, this.INIT_TIME_END]

    //平台下拉框
    this.listPlatform()
    //店铺下拉框
    this.listStore()

    //补偿类型下拉框
    this.listCompensateType()

    this.getCompensateList(1);

  },
  methods: {
    //补偿类型下拉框
    async listCompensateType(){
      const res = await listCompensateType()
      this.listCompensates = res.data
    },
    // 店铺下拉框
    async listStore() {
      const res = await listStore()
      this.stores = res.data
    },
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },

    //查询列表
    async getCompensateList(page){
      if (page !== undefined) {
        this.compensateReq.page = page
      }

      //设置开始时间和结束时间
      this.compensateReq.startTime = addDay(0,this.dateRange[0]);

      this.compensateReq.endTime = addDayEnd(0,this.dateRange[1]);

      const res = await financeList({...this.compensateReq});

      //组装数据
      this.compensateDataList = res.data.records

      this.total =  res.data.total;
    },

    //详情
    async detail(uuid){
      //查询详情，组装数据
      const res = await details(uuid);
      this.detailReqParams = res.data;

      this.compensateDetailShow = true;
    },

    //确认
    async confirmCompensate(uuid){
      const res = await confirmed(uuid);

      //刷新数据
      this.getCompensateList();
    },

    //作废
    cancelCompensate(uuid){
      this.cancellationData.uuid = uuid;

      //作废的弹窗
      this.cancellationShow = true;
    },

    //关闭
    closeCancellation(){
      this.cancellationShow = false;

      this.$refs["cancellationRef"].resetFields();

      this.cancellationData = {};
    },

    //提交作废
    async submitCancellation(){
    //必填校验
    this.$refs["cancellationRef"].validate(async (valid) => {

      if (valid) {
        //修改作废状态
        await financeVoid({...this.cancellationData});

        this.$message({
          type: "success",
          message: "作废成功！",
        });

        //清空数据
        this.closeCancellation();
        //刷新数据
        this.getCompensateList();

        this.cancellationShow = false;
      }
     
    });
    },

    //清空数据
    closeDetail() {
      //关闭弹窗
      this.compensateDetailShow = false;

      this.detailReqParams = {};
    },

    // 获取上传文件签名
    async getCompensateOssSignFun() {
      const res = await getCompensateOssSign()
      this.sign = res.data
    },

    //时间格式化
    getFormatDateFun(timeStamp) {
      if (!timeStamp) {
        return ''
      }

      return getFormatDate(timeStamp)
    },

  },
}
</script>


<style lang="scss">
</style>




