    <template>
  <div class="app-container">
    <div class="head-container">
      <el-form inline class="page-search">
        <el-form-item label="导入结果状态：">
          <el-select
            v-model="reqParams.resultStatus"
            placeholder="请选择"
            clearable
            class="select-width120"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" prop="platform">
          <el-select
            filterable
            clearable
            @change="changePlatform"
            v-model="reqParams.platform"
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
        <el-form-item label="上传类型：" prop="uploadDataType">
          <el-select
            filterable
            clearable
            v-model="reqParams.uploadDataType"
            placeholder="请选择上传类型"
          >
            <el-option
              v-for="item in uploadTypes"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            type="primary"
            @click="getPromotionData(1)"
            >查询</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openImport()">导入</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openLinkImport()"
            >京东sku-链接关系表导入</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column
        prop="date"
        label="序号"
        min-width="30"
        type="index"
        align="center"
      ></el-table-column>
      <el-table-column label="平台" align="center">
        <template v-slot="{ row }">
          <span>{{ row.platformName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺" align="center">
        <template v-slot="{ row }">
          <span>{{ row.storeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据导入类型" align="center">
        <template v-slot="{ row }">
          <span>{{ row.uploadDataTypeName }}</span>
        </template></el-table-column
      >
      <el-table-column label="上传日期" align="center">
        <template v-slot="{ row }">
          <span>{{
            row.uploadDate ? getFormatDate(row.uploadDate) : "-"
          }}</span>
        </template></el-table-column
      >
      <el-table-column label="状态" align="center">
        <template v-slot="{ row }">
          <span>{{ row.result }}</span>
          <el-image
            v-if="
              row.importStatus != 8 &&
              row.importStatus != 9 &&
              row.importStatus != 0
            "
            style="height: 20px; width: 20px"
            :src="require('@/assets/images/loading.gif')"
          ></el-image> </template
      ></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="{ row }">
          <el-button
            type="text"
            v-if="row.importStatus == 9"
            @click="deleteImport(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPromotionData"
    />
    <el-dialog
      :title="'导入'"
      :visible="showAddDialog"
      :before-close="cleanAdd"
      width="40%"
    >
      <el-form
        :model="importReq"
        :rules="importRules"
        ref="importRef"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="归属日期" prop="uploadDate">
          <el-date-picker
            v-model="importReq.uploadDate"
            class="el-form-item-width40"
            type="date"
            placeholder="请选择日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select
            filterable
            class="el-form-item-width40"
            @change="platformChange"
            v-model="importReq.platform"
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
        <el-form-item label="店铺" prop="storeUuid">
          <el-select
            filterable
            class="el-form-item-width40"
            v-model="importReq.storeUuid"
            placeholder="请选择所属店铺"
          >
            <el-option
              v-for="item in stores"
              :label="item.extendKeyword + '(' + item.code + ')'"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传类型" prop="uploadDataType">
          <el-select
            filterable
            class="el-form-item-width40"
            v-model="importReq.uploadDataType"
            placeholder="请选择上传类型"
          >
            <el-option
              v-for="item in uploadTypes"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="uuid" prop="automationUuid">
          <el-input
            class="el-form-item-width40"
            placeholder="请输入业务唯一uuid"
            v-model="importReq.automationUuid"
          ></el-input>
        </el-form-item>
        <el-form-item label="导入文件">
          <FileUpload
            ref="fileUploadRef"
            @getUploadFile="getUploadFile"
          ></FileUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="'导入'"
      :visible="linkDialogVisible"
      :before-close="cleanLinkDialog"
      width="40%"
    >
      <el-form
        :model="importReq"
        :rules="importRules"
        ref="importRef"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="归属日期" prop="uploadDate">
          <el-date-picker
            class="el-form-item-width40"
            v-model="importReq.uploadDate"
            type="date"
            placeholder="请选择日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="店铺" prop="storeUuid">
          <el-select
            class="el-form-item-width40"
            filterable
            v-model="importReq.storeUuid"
            placeholder="请选择所属店铺"
          >
            <el-option
              v-for="item in stores"
              :label="item.extendKeyword + '(' + item.code + ')'"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="uuid" prop="automationUuid">
          <el-input
            class="el-form-item-width40"
            placeholder="请输入业务唯一uuid"
            v-model="importReq.automationUuid"
          ></el-input>
        </el-form-item>

        <el-form-item label="导入文件">
          <FileUpload
            ref="fileUploadRef"
            @getUploadFile="getUploadFile"
          ></FileUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanLinkDialog">取 消</el-button>
        <el-button type="primary" @click="submitLinkForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

    <script>
import {
  getPromotionData,
  deletePromotionData,
  getPlatformList,
  getShopList,
  getUploadType,
  uploadPromotionData,
  uploadPddData,
  uploadJdRelation,
  getUploadStatus,
} from "@/api/businessData/campaignImport";
import { getFormatDate } from "@/utils/common";
export default {
  name: "CampaignImport",
  data() {
    return {
      statusOptions: [
        { label: "失败", value: "2" },
        { label: "成功", value: "1" },
        { label: "待导入", value: "0" },
      ],
      reqParams: {
        page: 1,
        pageSize: 10,
        resultStatus: "",
        platform: "",
        uploadDataType: "",
      },
      tableData: [],
      total: 0,
      loading: false,
      platform: "",
      showAddDialog: false,
      linkDialogVisible: false,
      importReq: {
        uploadDate: "",
        platform: "",
        storeUuid: "",
        uploadDataType: "",
        automationUuid: "",
      },
      // 平台下拉框
      platforms: [],
      // 店铺下拉框
      stores: [],
      fileData: {},
      // 上传类型
      uploadTypes: [],
      importRules: {
        uploadDate: [
          { required: true, message: "请选择日期", trigger: "change" },
        ],
        storeUuid: [
          { required: true, message: "请选择店铺", trigger: "change" },
        ],
        uploadDataType: [
          { required: true, message: "请选择上传类型", trigger: "change" },
        ],
        platform: [
          { required: true, message: "请选择平台", trigger: "change" },
        ],
        automationUuid: [
          { required: true, message: "请输入业务唯一uuid", trigger: "change" },
        ],
      },
      // 定时器
      timer: "",
    };
  },
  created() {
    this.getPromotionData(1);
    this.getPlatformList();
  },
  methods: {
    // 获取上传的文件
    getUploadFile(val) {
      this.fileData = val.file;
      console.log("上传的文件", val);
    },
    // 获取平台下拉框
    async getPlatformList() {
      const res = await getPlatformList();
      this.platforms = res.data;
    },
    // 获取店铺下拉框
    async getShopList(platform) {
      const res = await getShopList(platform);
      this.stores = res.data;
    },
    // 获取上传类型
    async getUploadType(platform) {
      const res = await getUploadType(platform);
      this.uploadTypes = res.data;
    },
    async platformChange(platform) {
      this.importReq.storeUuid = "";
      this.importReq.uploadDataType = "";
      this.getShopList(platform);
      this.getUploadType(platform);
    },
    // 获取表格数据
    async getPromotionData(page) {
      if (page == 1) {
        this.reqParams.page = 1;
      }
      this.loading = true;
      const res = await getPromotionData(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.loading = false;
      this.startTimer();
    },

    // 开启定时器
    startTimer() {
      this.timer = setInterval(() => {
        this.getAfterSalePlatformStatusList();
      }, 3000);
    },
    // 遍历状态
    async getAfterSalePlatformStatusList() {
      let status = false;
      this.tableData.map((item, index) => {
        if (
          item.importStatus != 9 &&
          item.importStatus != 8 &&
          item.importStatus != 0
        ) {
          this.getErpOrderStatus(item.uuid, index);
          status = true;
        }
        if (status) {
          clearInterval(this.timer);
        }
      });
    },
    // 根据uuid获取状态
    async getErpOrderStatus(uuid, index) {
      const res = await getUploadStatus(uuid);
      this.tableData[index].importStatus = res.data.importStatus;
      this.tableData[index].result = res.data.result;
    },
    getFormatDate(dateTime) {
      return getFormatDate(+dateTime);
    },
    async deleteImport(row) {
      const res = await deletePromotionData(row.uuid);
      this.getPromotionData(1);
    },
    openImport() {
      this.showAddDialog = true;
    },
    cleanAdd() {
      this.showAddDialog = false;
      this.importReq = this.$options.data().importReq;
      this.$nextTick(() => {
        this.$refs.fileUploadRef.clearFileList();
      });
      this.stores = [];
      this.uploadTypes = [];
      this.$refs["importRef"].resetFields();
      this.fileData = {};
    },
    //导入文件的确定
    submitForm() {
      //必填校验
      this.$refs["importRef"].validate(async (valid) => {
        if (valid) {
          // 将确定按钮置灰
          this.submitDisabled = true;
          if (Object.keys(this.fileData).length === 0) {
            return this.$message.warning("请选择上传文件");
          }
          this.importReq.platformKey = this.reqParams.platformKey;
          let formData = new FormData();
          formData.append("uploadDate", this.importReq.uploadDate);
          formData.append("platform", this.importReq.platform);
          formData.append("storeUuid", this.importReq.storeUuid);
          formData.append("uploadDataType", this.importReq.uploadDataType);
          formData.append("automationUuid", this.importReq.automationUuid);
          formData.append("file", this.fileData);
          if (this.importReq.platform == 30) {
            const [err, res] = await this.$to(uploadPddData(formData));
            console.log(res);

            if (res) {
              // 关闭弹窗
              this.cleanAdd();
              // 刷新数据
              await this.getPromotionData(1);
            }
          } else {
            const [err, res] = await this.$to(uploadPromotionData(formData));
            console.log(res);

            if (res) {
              // 关闭弹窗
              this.cleanAdd();
              // 刷新数据
              await this.getPromotionData(1);
            }
          }

          this.submitDisabled = false;
        }
      });
    },
    openLinkImport() {
      this.importReq.platform = "32";
      this.getShopList("32");
      this.linkDialogVisible = true;
    },
    cleanLinkDialog() {
      this.linkDialogVisible = false;
      this.importReq = this.$options.data().importReq;
      this.$nextTick(() => {
        this.$refs.fileUploadRef.clearFileList();
      });
      this.stores = [];
      this.uploadTypes = [];
      this.$refs["importRef"].resetFields();
      this.fileData = {};
    },
    //关联表导入文件的确定
    submitLinkForm() {
      //必填校验
      this.$refs["importRef"].validate(async (valid) => {
        if (valid) {
          // 将确定按钮置灰
          this.submitDisabled = true;
          if (Object.keys(this.fileData).length === 0) {
            return this.$message.warning("请选择上传文件");
          }
          this.importReq.platformKey = this.reqParams.platformKey;
          let formData = new FormData();
          formData.append("uploadDate", this.importReq.uploadDate);
          formData.append("platform", this.importReq.platform);
          formData.append("storeUuid", this.importReq.storeUuid);
          formData.append("automationUuid", this.importReq.automationUuid);
          formData.append("file", this.fileData);

          const [err, res] = await this.$to(uploadJdRelation(formData));
          console.log(res);

          if (res) {
            // 关闭弹窗
            this.cleanLinkDialog();
            // 刷新数据
            await this.getPromotionData(1);
          }

          this.linkDialogVisible = false;
        }
      });
    },
    changePlatform() {
      if (this.reqParams.platform == "") {
        this.reqParams.uploadDataType = "";
        this.uploadTypes = [];
        return;
      }
      this.reqParams.uploadDataType = "";
      this.getUploadType(this.reqParams.platform);
      this.$refs["importRef"].resetFields();
    },
  },
};
</script>

    <style lang='scss' scoped>
</style>
