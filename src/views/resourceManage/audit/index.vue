<template>
  <div class="page_audit">
    <div class="page-search">
      <el-form class="page-search" inline :model="reqParams" ref="reqParams">
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px;">
          <el-date-picker v-model="dateRange" type="daterange" align="right" unlink-panels
            value-format="timestamp"
            @blur="blurTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px;">
          <el-select v-model="reqParams.platform" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in platformList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" style="margin-right: 20px;">
          <el-select v-model="reqParams.storeUuid" filterable @change="getLinkList" clearable placeholder="请选择">
            <el-option
              v-for="item in shopList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品标题：" filterable style="margin-right: 20px;">
          <el-select v-model="reqParams.linkIdList" clearable multiple  placeholder="请选择">
            <el-option
              v-for="item in titleList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
        <el-form-item label="商品等级：" prop="linkLevel" style="margin-right: 20px;">
          <el-select filterable v-model="reqParams.linkLevel"  clearable placeholder="请选择商品等级">
            <el-option
              v-for="item in levelList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        </el-form-item>
        <el-form-item label="状态：" style="margin-right: 20px;">
          <el-select v-model="reqParams.applicationStatus" clearable placeholder="请选择">
            <el-option
              v-for="item in statusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-checkbox v-model="reqParams.isVoid">是否作废</el-checkbox>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-radio-group v-model="reqParams.pageStatus" @change="getPageList(1)">
          <el-radio-button :label="0">待处理</el-radio-button>
          <el-radio-button :label="1">全部</el-radio-button>
    </el-radio-group>
    <!-- 资源申请表 -->
    <el-table border v-loading="auditLoading" :data="auditData" center style="width: 100%" max-height="480">
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column  label="申请日期" type="datetime" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.applicationTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="linkTitle" label="商品标题" align="center"></el-table-column>
      <el-table-column prop="linkId" label="商品编码" align="center"></el-table-column>
      <el-table-column prop="linkLevelName" label="商品等级" align="center"></el-table-column>
      <el-table-column prop="url" label="主图" align="center">
        <template v-slot="{ row, $index }">
            <el-image
              v-if="row.url"
              style="height: 30px;width: 30px;"
              :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.url]"
            ></el-image>
          </template>
      </el-table-column>
      <el-table-column label="店铺" align="center">
        <template v-slot="{ row }">
          <span>{{ row.platformName }}</span>
          <span>({{ row.storeCode ? row.storeCode : '-' }})</span>
          <span>{{ row.storeName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="managerName" label="负责人" align="center"></el-table-column>
      <el-table-column prop="deadline" label="截止日期" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.deadline) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="applicationStatusName" label="状态" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="small" v-if="scope.row.cancelStatus == false && scope.row.applicationStatus == 0" @click="openHandleDialog(scope.row)">处理</el-button>
          <el-button type="text" size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button type="text" size="small" v-if="scope.row.cancelStatus == false && scope.row.applicationStatus == 0" @click="openCancelDialog(scope.row)">作废</el-button>
        </template>
      </el-table-column>
    </el-table>
     <!-- 分页 -->
     <Pagination
      v-show="total>0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />
     <!-- 详情弹窗 -->
     <el-dialog :visible="detailDialogVisible" width="40%" @close="closeDetailDialog()">
      <el-descriptions>
        <el-descriptions-item label="商品标题">{{ detailData.linkTitle }}</el-descriptions-item>
        <el-descriptions-item label="主图">
          <el-image
              v-if="detailData.url"
              style="height: 30px;width: 30px;"
              :src="detailData.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[detailData.url]"
            ></el-image>
        </el-descriptions-item>
        <el-descriptions-item label="商品编码">{{ detailData.linkId }}</el-descriptions-item>
        <el-descriptions-item label="店铺">{{ detailData.platformName }}({{ detailData.storeCode ? detailData.storeCode : '-'}}){{ detailData.storeName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detailData.managerName }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ detailData.linkLevelName	 }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ getFormatDate(detailData.deadline) }}</el-descriptions-item>
        <el-descriptions-item label="申请金额（元）">{{ detailData.amount }}</el-descriptions-item>
        <el-descriptions-item label="申请货品数量">{{ detailData.quantity }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData.applicationUser }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ getFormatDate(detailData.applicationTime) }}</el-descriptions-item>
        <el-descriptions-item label="处理人" v-if="detailData.cancelStatus == false && detailData.applicationStatus != 0 ">{{ detailData.processUser }}</el-descriptions-item>
        <el-descriptions-item label="处理日期" v-if="detailData.cancelStatus == false && detailData.applicationStatus != 0 ">{{ getFormatDate(detailData.processTime) }}</el-descriptions-item>
        <el-descriptions-item label="作废原因" v-if="detailData.cancelStatus == true">{{ detailData.cancelReason }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因" v-if="detailData.applicationStatus == 2">{{ detailData.rejectReason }}</el-descriptions-item>
        <el-descriptions-item label="说明">{{ detailData.reason }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPass()" v-if="handleBtn">通过</el-button>
        <el-button @click="openRejectDialog()" v-if="handleBtn">驳回</el-button>
        <el-button @click="closeDetailDialog()">取消</el-button>
      </span>
     </el-dialog>
     <!-- 作废弹窗 -->
     <el-dialog :visible="cancelDialogVisible" width="40%" @close="closeCancelDialog()">
        <el-form :model="this.cancelParams" onsubmit="return false;" label-width="120px" :rules="cancelRules" ref="cancelParams">
          <el-form-item label="作废原因:" prop="reason">
            <el-input v-model="cancelParams.reason" class="el-form-item-width40" placeholder="请输入作废原因"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeCancelDialog()">取消</el-button>
          <el-button type="primary" @click="submitCancel()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 驳回弹窗 -->
      <el-dialog :visible="rejectDialogVisible" width="40%" @close="closeRejectDialog()">
        <el-form :model="this.rejectParams" onsubmit="return false;" label-width="120px" :rules="rejectRules" ref="rejectParams">
          <el-form-item label="驳回原因:" prop="reason">
            <el-input v-model="rejectParams.reason" class="el-form-item-width40" placeholder="请输入驳回原因"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeRejectDialog()">取消</el-button>
          <el-button type="primary" @click="submitReject()">确定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
import { getShopList, getLevelList, storeToLinkPush, getauditList, linkDetail, applyCancel,linkApplyType,applyReject,applyPass} from '@/api/resourceManage/audit.js';
import { listPlatform } from '@/api/baseData/common';
import {getFormatDate} from "@/utils/common.js";
export default {
  name: 'Audit',
  data(){
    return {
       // 平台下拉列表
       platformList:[],
      // 店铺名称列表
      shopList:[],
      // 商品标题列表
      titleList:[],
      // 商品等级列表
      levelList:[],
      // 日期范围
      dateRange:[],
      // 状态列表
      statusList:[],
      // 查询资源传参
      reqParams:{
        applicationStatus: null,
        endTime: "",
        isVoid: false,
        // levelList: [],
        linkLevel:"",
        linkIdList: [],
        page: 1,
        pageSize: 10,
        pageStatus: 1,
        // platformList: [],
        platform:"",
        startTime: "",
        // storeUuidList: []
        storeUuid:""
      },
      total:0,
      // 外层店铺名称存储
      reqLink:{
        storeUuidList:[]
      },
      // 表格加载动画效果
      auditLoading:false,
      // 详情弹窗
      detailDialogVisible:false,
      // 作废弹窗
      cancelDialogVisible:false,
      // 驳回弹窗
      rejectDialogVisible:false,
      // 处理按钮控制
      handleBtn:false,
      // 审核表格数据
      auditData:[],
      // 详情数据
      detailData:[],
      // 作废传参
      cancelParams:{
        pageType:1,
        reason:"",
        uuid:""
      },
      // 驳回传参
      rejectParams:{
        reason:"",
        uuid:""
      },
      // 通过传参
      passParams:{
        determineSign:2,
        uuid:""
      },
      // 作废规则
      cancelRules:{
        reason: [
          { required: true, message: '请输入作废原因', trigger: 'blur' }
        ]
      },
      // 驳回规则
      rejectRules:{
        reason:[
          { required: true, message: '请输入驳回原因', trigger: 'blur' }
        ]
      }
    }
  },
  created(){
    // 页面加载时获取
    this.getLevelList();
    this.getShopList();
    this.getPlatformList();
    this.getPageList();
    this.getStatusList();
  },
  methods:{
    // 日期转化
    getFormatDate(time){
      return getFormatDate(time);
    },
    // 获取状态下拉
    async getStatusList(){
      const res = await linkApplyType()
      this.statusList = res.data
    },
    // 获取店铺列表
    async getShopList() {
      const res = await getShopList();
      this.shopList = res.data;
    },
    // 获取商品等级列表
    async getLevelList() {
      const res = await getLevelList();
      this.levelList = res.data;
    },
    // 获取平台列表
    async getPlatformList() {
      const res = await listPlatform();
      this.platformList = res.data;
    },
    // 选择店铺后获取商品标题
    async getLinkList(){
      this.titleList = [];
      this.reqParams.linkIdList = [];
      this.reqLink.storeUuidList = [];
      if(this.reqParams.storeUuid != ''){
        this.reqLink.storeUuidList.push(this.reqParams.storeUuid);
        const res = await storeToLinkPush(this.reqLink);
        this.titleList = res.data;
      }
    },
    // 新增弹窗选择店铺后获取商品标题
    async getDialogLinkList(){
      this.reqDialogLink.storeUuidList = []
      this.addParams.linkId = '';
      this.reqDialogLink.storeUuidList.push(this.addParams.storeUuid);
      const res = await storeToLinkPush(this.reqDialogLink);
      this.titleList = res.data;
    }
    ,
    // 页码跳转
    async getPageList(page){
      if(page == 1){
        this.reqParams.page = page;
      }
      if(this.dateRange == null){
        this.reqParams.startTime = "";
        this.reqParams.endTime = "";
      }else{
        this.reqParams.startTime = this.dateRange[0];
        this.reqParams.endTime = this.dateRange[1];
      }
      this.auditLoading = true;
      if(this.reqParams.pageStatus == 0 && this.reqParams.isVoid == true){
        this.auditData = []
        this.total = 0
      }else{
      const res = await getauditList(this.reqParams)
      this.auditData = res.data.records;
      this.total = res.data.total;
      }
      
      this.auditLoading = false;
    },
    // 搜索按钮事件
    searchList(){
      this.reqParams.page = 1;
      this.getPageList();
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
     // 打开详情弹窗
     openDetailDialog(row){
      linkDetail(row.uuid).then((res) => {
        this.detailData = res.data;
      })
      this.handleBtn = false
      this.detailDialogVisible = true;
    },
    // 关闭详情弹窗
    closeDetailDialog(){
      this.detailDialogVisible = false;
      this.detailData = {};
    },
     // 打开作废弹窗
     openCancelDialog(row){
      this.cancelParams.uuid = row.uuid;
      this.cancelDialogVisible = true;
    },
    // 关闭作废弹窗
    closeCancelDialog(){
      this.cancelDialogVisible = false;
      this.cancelParams = this.$options.data().cancelParams;
      this.$refs.cancelParams.resetFields()
    },
    // 提交作废申请
    async submitCancel(){
      this.$refs.cancelParams.validate()
     const res = await applyCancel(this.cancelParams);
      if(res.data === true){
        this.$message.success('作废成功')
        this.closeCancelDialog();
      }
      this.searchList()
    },
    // 打开处理弹窗
    openHandleDialog(row){
      linkDetail(row.uuid).then((res) => {
        this.detailData = res.data;
      })
      this.handleBtn = true
      this.detailDialogVisible = true;
    },
    // 打开驳回弹窗
    openRejectDialog(){
      this.rejectParams.uuid = this.detailData.uuid;
      this.rejectDialogVisible = true;
    },
    // 关闭驳回弹窗
    closeRejectDialog(){
      this.rejectDialogVisible = false;
      this.rejectParams = this.$options.data().rejectParams;
      this.$refs.rejectParams.resetFields()
    },
    // 提交驳回申请
    async submitReject(){
      this.$refs.rejectParams.validate()
      const res = await applyReject(this.rejectParams);
      if(res.data === true){
        this.$message.success('驳回成功')
        this.closeRejectDialog();
        this.closeDetailDialog();
      }
      this.searchList()
    },
    // 提交通过
    async submitPass(){
      this.passParams.uuid = this.detailData.uuid;
      const res = await applyPass(this.passParams)
      if(res.data === true){
        this.$message.success('通过成功')
        this.closeDetailDialog();
      }
      this.passParams = this.$options.data().passParams;
      this.searchList()
    }
  }
}
</script>

<style>
.page_audit {
  padding: 40px;
}
</style>