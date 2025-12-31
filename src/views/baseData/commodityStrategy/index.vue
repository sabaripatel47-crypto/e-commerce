<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="项目标题" style="margin-right: 20px">
          <el-input
            placeholder="请输入"
            v-model="reqParams.strategyTitle"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item label="赛道" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.track"
            :options="Trdepartments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'cateName',
              value: 'uuid',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <!-- 下拉选择品类 -->
        <el-form-item label="品类" style="margin-right: 20px;">
          <el-cascader
            filterable
            v-model="categoryList"
            :options="Cadepartments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'cateName',
              value: 'uuid',
              checkStrictly: false,
              multiple: true,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <!-- 器型 -->
        <el-form-item label="器型" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.shape"
            :options="shapeList"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'cateName',
              value: 'uuid',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <!-- 价格带 -->
        <el-form-item label="价格带" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.priceZone"
            :options="priceList"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'cateName',
              value: 'uuid',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <!-- 人群 -->
        <el-form-item label="人群" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.crowd"
            :options="crowdList"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'cateName',
              value: 'uuid',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="上架时间">
          <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="timestamp"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.status" clearable>
            <el-option
              v-for="item in typeList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getProductpage(1)">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addStrategy()">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-download"
            v-hasPermi="['baseData:commodityStrategy:export']"
            @click="exportStrategy()"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table
        :data="linkList"
        style="width: 100%"
        border
        v-loading="tableLoading"
        max-height="600"
      >
        <el-table-column type="index" label="序号" width="50" align="center" fixed="left"></el-table-column>
        <el-table-column
          prop="strategyTitle"
          label="项目标题"
          align="center"
          show-overflow-tooltip
          width="130"
          fixed="left"
        ></el-table-column>
        <el-table-column
          prop="strategyNumber"
          label="项目编号"
          show-overflow-tooltip
          align="center"
          width="130"
          fixed="left"
        ></el-table-column>
        <!-- 基础信息类 -->
        <el-table-column label="基础信息" align="center">
          <el-table-column prop="brandName" label="项目品牌" align="center" width="120"></el-table-column>
          <el-table-column prop="strategyGradeName" label="项目等级" align="center" width="80"></el-table-column>
          <el-table-column prop="seasonLevelName" label="季节性等级" align="center" width="90"></el-table-column>
          <el-table-column prop="projectTypeName" label="项目类型" align="center" width="80"></el-table-column>
          <el-table-column prop="customerTypeName" label="项目导向" align="center" width="80"></el-table-column>
          <el-table-column prop="strategyTimeStatusName" label="项目阶段" align="center" width="80"></el-table-column>
          <el-table-column prop="statusName" label="项目状态" align="center" width="80"></el-table-column>
          <el-table-column prop="marketTypeName" label="项目营销" align="center" width="80"></el-table-column>
        </el-table-column>

        <!-- 部门负责人类 -->
        <el-table-column label="部门负责人" align="center">
          <el-table-column
            prop="helpSupportName"
            label="帮扶部"
            show-overflow-tooltip
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column prop="planningName" label="项目企划" align="center" width="100"></el-table-column>
          <el-table-column prop="designerName" label="设计师" align="center" width="100"></el-table-column>
          <el-table-column prop="managerName" label="项目实施" align="center" width="100"></el-table-column>
          <el-table-column prop="shapeDeptName" label="塑造部" align="center" width="100"></el-table-column>
        </el-table-column>
        <el-table-column label align="center">
          <el-table-column prop="uuid" label="产品图片" align="center" width="130">
            <template v-slot="{ row, $index }">
              <el-image
                v-for="(item, index) in row.imageUrls"
                :key="index"
                style="height: 30px; width: 30px"
                :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :initial-index="0"
                :preview-src-list="[item.url]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column
            prop="spuName"
            label="链接主打产品"
            align="center"
            show-overflow-tooltip
            width="130"
          ></el-table-column>
          <el-table-column prop="track" label="赛道" align="center" width="160"></el-table-column>
          <el-table-column label="品类" align="center" width="130">
            <template v-slot="{ row, $index }">
              <span v-for="item in row.categoryValue">{{ item }},</span>
            </template>
          </el-table-column>
          <el-table-column prop="shape" label="器型" align="center" width="160"></el-table-column>
          <el-table-column prop="priceZone" label="价格带" align="center" width="120"></el-table-column>
          <el-table-column prop="crowd" label="人群" align="center" width="160"></el-table-column>
          <el-table-column
            prop="groundingTime"
            label="上架时间"
            align="center"
            show-overflow-tooltip
            width="150"
          >
            <template slot-scope="scope">
              <div>
                {{
                scope.row.groundingTimeDate
                ? getFormatDate(scope.row.groundingTimeDate)
                : "-"
                }}
              </div>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- <el-table-column prop="uuid" label="品类图片" align="center" width="130">
          <template v-slot="{ row, $index }">
            <el-image
              v-for="(item, index) in row.categoryFileUrl"
              :key="index"
              style="height: 30px; width: 30px"
              :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :initial-index="0"
              :preview-src-list="[item.url]"
            ></el-image>
          </template>
        </el-table-column>-->

        <!-- 暂时用不到 -->
        <!-- <el-table-column
          prop="description"
          label="说明"
          align="center"
          width="200"
          show-overflow-tooltip
        ></el-table-column>-->

        <el-table-column label="操作" width="140" align="center">
          <template v-slot="{ row }">
            <!-- <el-button size="mini" type="text" icon="el-icon-view" @click="getLinkDetail(row)">详情</el-button> -->
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="editStrategybutton(row)"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteStrategy(row.uuid)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getProductpage"
      />
    </div>

    <!-- 详情弹层 -->
    <el-dialog title="商品链接详情" :visible="showDetail" :before-close="cleanDetail" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="商品标题">
          {{
          detail.strategyTitle
          }}
        </el-descriptions-item>
        <el-descriptions-item label="商品编码">
          {{
          detail.strategyNumber
          }}
        </el-descriptions-item>
        <el-descriptions-item label="所属店铺">
          {{
          detail.storeName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="所属平台">
          {{
          detail.platformName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          {{
          detail.managerName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="上架时间">
          {{
          detail.listingDate
          }}
        </el-descriptions-item>
        <el-descriptions-item label="商品等级">
          {{
          detail.linkLevelName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="商品链接状态">
          {{
          detail.linkStatusName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="主打商品">
          {{
          detail.mainLinkName
          }}
        </el-descriptions-item>
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
      :title="isEdit ? '修改商品项目配置' : '新增商品项目配置'"
      :visible="showAddDialog"
      :close-on-click-modal="false"
      :before-close="cleanAdd"
      width="60%"
    >
      <el-form
        :model="editDetail"
        :rules="linkRules"
        ref="addDetailRef"
        label-width="110px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :lg="12">
            <el-form-item label="项目标题" prop="strategyTitle">
              <el-input
                class="el-form-item-width20"
                v-model="editDetail.strategyTitle"
                clearable
                placeholder="请输入"
              ></el-input>
            </el-form-item>
            <el-form-item label="链接主打产品" prop="spuUuid">
              <el-select
                filterable
                class="el-form-item-width20"
                v-model="editDetail.spuUuid"
                clearable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in productNameList"
                  :key="item.uuid"
                  :label="item.name"
                  :value="item.uuid"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目等级" prop="strategyGrade">
              <el-select
                filterable
                v-model="editDetail.strategyGrade"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in GradeList"
                  :label="item.name"
                  :value="item.code"
                  :key="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目来源类型" prop="strategyType">
              <el-select
                filterable
                v-model="editDetail.strategyType"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in strategyTypeList"
                  :label="item.name"
                  :value="item.code"
                  :key="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目实施人" prop="manager">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.manager"
                :options="departments"
                :show-all-levels="false"
                clearable
                :props="{
                  children: 'children',
                  label: 'deptName',
                  value: 'deptId',
                  checkStrictly: false,
                }"
                :placeholder="editDetail.managerName"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="帮扶负责人" prop="helpSupportUuid">
              <el-cascader
                class="el-form-item-width20"
                filterable
                clearable
                v-model="editDetail.helpSupportUuid"
                :options="departments"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'deptName',
                  value: 'deptId',
                  checkStrictly: false,
                }"
                :placeholder="editDetail.helpSupportName"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="项目企划负责人" prop="planningUuid">
              <el-cascader
                class="el-form-item-width20"
                filterable
                clearable
                v-model="editDetail.planningUuid"
                :options="departments"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'deptName',
                  value: 'deptId',
                  checkStrictly: false,
                }"
                :placeholder="editDetail.planningName"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="设计师" prop="designerUuid">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.designerUuid"
                :options="departments"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'deptName',
                  value: 'deptId',
                  checkStrictly: false,
                }"
                clearable
                :placeholder="editDetail.designerName"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="品类" prop="category">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.category"
                :options="Cadepartments"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'cateName',
                  value: 'uuid',
                  checkStrictly: false,
                  multiple: true,
                }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="价格带" prop="priceZone">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.priceZone"
                :options="priceList"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'cateName',
                  value: 'uuid',
                  checkStrictly: false,
                }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="项目品牌" prop="brandUuid">
              <el-select
                filterable
                class="el-form-item-width20"
                v-model="editDetail.brandUuid"
                clearable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in brandList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="上架时间" prop="groundingTimeDate">
              <el-date-picker
                v-model="editDetail.groundingTimeDate"
                class="el-form-item-width20"
                type="date"
                placeholder="上架时间"
                value-format="timestamp"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="产品图片">
              <!-- <template #label>
                <span class="required-star">*</span>产品图片
              </template>-->
              <OSSFileUpload
                :sign.sync="sign"
                :limitNum.sync="imageLimitNum"
                :fileType.sync="fileType"
                :fileRecordList.sync="fileRecordListImage"
                :isPicture.sync="isPicture"
                :showLoading.sync="showLoading"
                :btnType="'plus'"
                @getFileUrl="getImageUrls"
                @getFileName="getImageNames"
                @deleteFile="deleteImage"
                ref="OSSFileUploadRefImage"
              ></OSSFileUpload>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :lg="12">
            <el-form-item label="项目编号" prop="strategyNumber">
              <el-input
                class="el-form-item-width20"
                v-model="editDetail.strategyNumber"
                clearable
                placeholder="请输入"
              ></el-input>
            </el-form-item>
            <el-form-item label="项目阶段" prop="strategyTimeStatus">
              <el-select
                filterable
                v-model="editDetail.strategyTimeStatus"
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in strategyTimeStatusList"
                  :label="item.name"
                  :value="item.code"
                  :key="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目类型" prop="projectType">
              <el-select
                filterable
                v-model="editDetail.projectType"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in dict.type.project_type"
                  :label="item.label"
                  :value="item.raw.dictCode"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="赛道" prop="track">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.track"
                :options="Trdepartments"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'cateName',
                  value: 'uuid',
                  checkStrictly: false,
                }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="器型" prop="shape">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.shape"
                :options="shapeList"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'cateName',
                  value: 'uuid',
                  checkStrictly: false,
                }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="人群" prop="crowd">
              <el-cascader
                class="el-form-item-width20"
                filterable
                v-model="editDetail.crowd"
                :options="crowdList"
                :show-all-levels="false"
                :props="{
                  children: 'children',
                  label: 'cateName',
                  value: 'uuid',
                  checkStrictly: false,
                }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="项目营销" prop="marketType">
              <el-select
                filterable
                v-model="editDetail.marketType"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in dict.type.strategy_product_market"
                  :label="item.label"
                  :value="item.raw.dictCode"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目导向" prop="customerType">
              <el-select
                filterable
                v-model="editDetail.customerType"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in dict.type.strategy_product_guide"
                  :label="item.label"
                  :value="item.raw.dictCode"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="塑造部" prop="shapeDept">
              <el-select
                filterable
                v-model="editDetail.shapeDept"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in dict.type.strategy_shape_dept"
                  :label="item.label"
                  :value="item.raw.dictCode"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="季节性等级" prop="seasonLevel">
              <el-select
                filterable
                v-model="editDetail.seasonLevel"
                clearable
                class="el-form-item-width20"
              >
                <el-option
                  v-for="item in dict.type.strategy_season_level"
                  :label="item.label"
                  :value="item.raw.dictCode"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目状态" prop="status">
              <el-select
                class="el-form-item-width20"
                filterable
                v-model="editDetail.status"
                clearable
              >
                <el-option
                  v-for="item in typeList"
                  :label="item.name"
                  :value="item.code"
                  :key="item.code"
                ></el-option>
              </el-select>
              <!-- <el-radio-group class="el-form-item-width20" v-model="editDetail.status">
                <el-radio v-for="item in typeList" :label="item.code">{{ item.name }}</el-radio>
              </el-radio-group>-->
            </el-form-item>
            <!-- 暂时不用 -->
            <!-- <el-form-item label="说明：" prop="description">
              <el-input
                class="el-form-item-width20"
                maxlength="200"
                show-word-limit
                type="textarea"
                :rows="5"
                placeholder="请输入说明"
                :autosize="{ minRows: 8, maxRows: 8 }"
                v-model="editDetail.description"
              ></el-input>
            </el-form-item>-->
          </el-col>
        </el-row>
      </el-form>

      <!-- 赛道、品类图片 暂时注释 后续放开 -->
      <!-- <el-form-item label="赛道图片">
          <template #label>
            <span class="required-star">*</span>赛道图片
          </template>
          <OSSFileUpload
            :sign.sync="sign"
            :limitNum.sync="limitNums"
            :fileType.sync="fileType"
            :fileRecordList.sync="fileRecordListTrck"
            :isPicture.sync="isPicture"
            :showLoading.sync="showLoading"
            :btnType="'plus'"
            @getFileUrl="getFileUrls"
            @getFileName="getFileNames"
            @deleteFile="deleteFiles"
            ref="OSSFileUploadRefTrck"
          ></OSSFileUpload>
      </el-form-item>-->

      <!-- <el-form-item label="品类图片">
          <template #label>
            <span class="required-star">*</span>品类图片
          </template>
          <OSSFileUpload
            :sign.sync="sign"
            :fileType.sync="fileType"
            :limitNum.sync="limitNum"
            :fileRecordList.sync="fileRecordList"
            :isPicture.sync="isPicture"
            :showLoading.sync="showLoading"
            :btnType="'plus'"
            @getFileUrl="getFileUrl"
            @getFileName="getFileName"
            @deleteFile="deleteFile"
            ref="OSSFileUploadRef"
          ></OSSFileUpload>
      </el-form-item>-->

      <!-- <el-form-item label="商品等级" prop="linkLevel">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.linkLevel">
            <el-radio v-for="item in linkLevels" :key="item.code" :label="item.code">{{ item.name }}</el-radio>
          </el-radio-group>
      </el-form-item>-->

      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  category,
  track,
  type,
  pageList,
  delstrategy,
  addStrategy,
  strategyGrade,
  editStrategy,
  detailStrategy,
  getOssSign,
  shape,
  price,
  crowd,
  exportStrategy,
} from '@/api/baseData/commodityStrategy'
import { brandPush } from '@/api/baseData/common'
import { getProductNameList } from '@/api/purchasingManagement/purchaseRecordDetails'
import { getDeptTreeData, getFormatDate } from '@/utils/common'
import { department } from '@/api/information/department'
import {
  listPlatform,
  listStore,
  listLinkLevel,
  getOSSFileUuid,
  getOSSFileUrl,
  listStrategyTimeStatus,
  listStrategyType,
  listAllUpperDept,
} from '@/api/baseData/common'
import { categoryList } from '@/api/purchasingManagement/common'

import { deepClone } from '@/utils/common'
import { saveAs } from 'file-saver'
import { tansParams, blobValidate } from '@/utils/ruoyi'

export default {
  name: 'CommodityStrategy',
  dicts: [
    'project_type',
    'strategy_product_market',
    'strategy_product_guide',
    'strategy_shape_dept',
    'strategy_season_level',
  ],
  data() {
    return {
      //部门人员的下拉框
      departments: [],

      // 品牌下拉框
      brandList: [],

      dialogImageUrl: '',
      imageLimitNum: 1,
      limitNums: 3,
      limitNum: 3,
      // 日期时间
      dateRange: [],
      //赛道下拉框
      Trdepartments: [],
      //品类下拉框
      Cadepartments: [],
      // 品类多选数组
      categoryList: [],
      // 新增品类多选
      categoryListAdd: [],
      // 器型下拉框
      shapeList: [],
      // 产品名称下拉
      productNameList: [],
      // 价格带下拉框
      priceList: [],
      // 人群下拉框
      crowdList: [],
      // 项目来源类型下拉框
      strategyTypeList: [],
      //部门人员的下拉框
      departments: [],
      //项目阶段下拉框
      strategyTimeStatusList: [],
      //状态下拉框
      typeList: [],
      //等级下拉框
      GradeList: [],
      //店铺下拉框
      storeList: [],
      total: 0,
      linkList: [],
      fileType: ['.jpg', '.png', '.jpeg', '.webp'],

      // 文件上传是否为图片
      isPicture: true,

      // 显示文件上传加载中
      showLoading: true,

      //产品图片
      fileRecordListImage: [],

      // 赛道文件记录
      fileRecordListTrck: [],

      //品类文件记录
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

      // 获取文件uuid入参
      getUrlUuidReqParamsTrck: {
        fileName: '',
        originalName: '',
        platformType: 1,
      },

      //取产品的uuid
      getUrlUuidReqParamsImage: {
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
        urlUuid: '',
        strategyTimeStatus: 10,
        imageUrls: [],
        trackFileUrl: [],
        categoryFileUrl: [],
        category: [],
        brandUuid: '',
        marketType: '',
        customerType: '',
        shapeDept: '',
        seasonLevel: '',
      },

      //是否是编辑
      isEdit: false,

      //新增和编辑的弹窗
      showAddDialog: false,
      //平台下拉框
      platforms: [],

      //店铺下拉框
      stores: [],

      //商品等级下拉框
      linkLevels: [],

      reqParams: {
        startTime: '', //开始时间
        endTime: '', //结束时间
        strategyTitle: '', // 项目标题
        page: 1,
        pageSize: 20,
        storeUuid: '',
        track: '', //赛道选择
        category: [], //品类选择
        shape: '', // 器型选择
        priceZone: '', // 价格带选择
        crowd: '', // 人群选择
        status: '',
      },

      linkRules: {
        strategyTitle: [
          { required: true, message: '请输入项目标题', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        spuUuid: [{ required: true, message: '请选择spu', trigger: 'change' }],
        strategyNumber: [
          { required: true, message: '请输入项目编号', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        // manager: [
        //   { required: true, message: '请选择项目实施人', trigger: 'change' },
        // ],
        strategyTimeStatus: [
          { required: true, message: '请选择阶段', trigger: 'change' },
        ],
        strategyGrade: [
          { required: true, message: '请选择等级', trigger: 'change' },
        ],
        track: [{ required: true, message: '请选择赛道', trigger: 'change' }],
        category: [
          { required: true, message: '请选择品类', trigger: 'change' },
        ],
        shape: [{ required: true, message: '请选择器型', trigger: 'change' }],
        priceZone: [
          { required: true, message: '请选择价格带', trigger: 'change' },
        ],
        crowd: [{ required: true, message: '请选择人群', trigger: 'change' }],
        groundingTimeDate: [
          { required: true, message: '请选择上架时间', trigger: 'change' },
        ],
        strategyType: [
          { required: true, message: '请选择项目来源类型', trigger: 'change' },
        ],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        urlUuid: [
          // { required: true, message: '请添加赛道图片', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (
                !this.editDetail.trackFileUrl ||
                this.editDetail.trackFileUrl.length === 0
              ) {
                // console.log('赛道图片空空空', this.editDetail.trackFileUrl)
                callback(new Error('请添加赛道图片'))
              } else {
                // console.log('赛道图片有有有', this.editDetail.trackFileUrl)
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        categoryUrlUuid: [
          // { required: true, message: '请添加品类图片', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (
                !this.editDetail.categoryFileUrl ||
                this.editDetail.categoryFileUrl.length === 0
              ) {
                // console.log('品类图片空空空', this.editDetail.categoryFileUrl)
                callback(new Error('请添加品类图片'))
              } else {
                // console.log('品类图片有有有', this.editDetail.categoryFileUrl)
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
    this.getOssSignData()
    this.getStoreList()
    //部门和人的级联
    this.getDeptTree()
    //平台下拉框
    this.listPlatform()
    //项目阶段的下拉框
    this.listStrategyTimeStatus()
    //商品等级的下拉框
    this.listLinkLevel()
    //  spu下拉
    this.getProductNameList()

    //店铺下拉框
    this.listStore()

    //品类组织架构下拉框
    this.getCategory()

    //赛道组织架构下拉框
    this.getTrack()

    //商品项目分页列表
    this.getProductpage()

    //状态架构下拉框
    this.getType()

    //项目等级架构下拉框
    this.getStrategyGrade()
    // 项目器型下拉框
    this.listShape()
    // 项目价格带下拉框
    this.listPriceRange()
    // 项目人群下拉框
    this.listStrategyCrowd()
    // 项目来源类型下拉
    this.listStrategyType()
    // 品牌下拉框
    this.getBrandList()
  },
  methods: {
    getFormatDate(date) {
      return getFormatDate(date)
    },
    //项目状态架构下拉框
    async getType() {
      const res = await type()
      this.typeList = await getDeptTreeData(res.data)
    },

    //项目等级架构下拉框
    async getStrategyGrade() {
      const res = await strategyGrade()
      this.GradeList = await getDeptTreeData(res.data)
    },

    //项目品类组织架构下拉框
    async getCategory() {
      const res = await category()
      this.Cadepartments = await getDeptTreeData(res.data)
    },

    // 项目器型下拉框
    async listShape() {
      const res = await shape()
      this.shapeList = await getDeptTreeData(res.data)
    },

    // 项目价格带下拉框
    async listPriceRange() {
      const res = await price()
      this.priceList = await getDeptTreeData(res.data)
    },

    // 项目人群下拉框
    async listStrategyCrowd() {
      const res = await crowd()
      this.crowdList = await getDeptTreeData(res.data)
    },

    // 项目来源类型下拉
    async listStrategyType() {
      const res = await listStrategyType()
      this.strategyTypeList = res.data
    },
    // 获取产品名称列表
    async getProductNameList() {
      const res = await getProductNameList()
      this.productNameList = res.data
    },
    // 获取品牌列表
    async getBrandList() {
      const res = await brandPush()
      this.brandList = res.data
    },
    //项目阶段下拉框
    async listStrategyTimeStatus() {
      const res = await listStrategyTimeStatus()
      this.strategyTimeStatusList = res.data
    },

    //项目赛道组织架构下拉框
    async getTrack() {
      const res = await track()
      this.Trdepartments = await getDeptTreeData(res.data)
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
    deleteImage(val) {
      let { index, item } = val
      this.fileRecordListImage.splice(index, 1)
      this.editDetail.imageUrls.splice(index, 1)
    },
    // 删除文件
    deleteFiles(val) {
      let { index, item } = val
      this.fileRecordListTrck.splice(index, 1)
      this.editDetail.trackFileUrl.splice(index, 1)
      // this.getUrlUuidReqParams = {
      //   fileName: '', // 文件地址
      //   originalName: '', // 源文件名
      //   platformType: 1,
      // }
    },
    deleteFile(val) {
      let { index, item } = val
      this.fileRecordList.splice(index, 1)
      this.editDetail.categoryFileUrl.splice(index, 1)
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
    getFileNames(val) {
      this.getUrlUuidReqParamsTrck.originalName = val
    },
    getImageNames(val) {
      this.getUrlUuidReqParamsImage.originalName = val
    },
    // 根据文件uuid换取url
    async getOSSFileUrlData(uuid) {
      let uuidArr = uuid.split(',')
      const res = await getOSSFileUrl({ uuid: uuidArr })
      return res.data[0]
    },

    //获取上传后的产品图片
    async getImageUrls(val) {
      this.fileRecordListImage.push(val)
      this.getUrlUuidReqParamsImage.fileName = val
      // 如果上传新文件 重新获取uuid提交
      if (this.getUrlUuidReqParamsImage.fileName !== '') {
        const res = await getOSSFileUuid(this.getUrlUuidReqParamsImage)
        if (!this.editDetail.imageUrls) {
          this.editDetail.imageUrls = []
        }
        this.editDetail.imageUrls.push(res.data)
        this.$modal.closeLoading()
      }
    },

    // 获取上传后的文件url
    async getFileUrls(val) {
      this.fileRecordListTrck.push(val)
      this.getUrlUuidReqParamsTrck.fileName = val
      // 如果上传新文件 重新获取uuid提交
      if (this.getUrlUuidReqParamsTrck.fileName !== '') {
        const res = await getOSSFileUuid(this.getUrlUuidReqParamsTrck)
        if (!this.editDetail.trackFileUrl) {
          this.editDetail.trackFileUrl = []
        }
        this.editDetail.trackFileUrl.push(res.data)
        this.$modal.closeLoading()
      }
    },
    // 获取上传后的文件url
    async getFileUrl(val) {
      this.fileRecordList.push(val)
      this.getUrlUuidReqParams.fileName = val
      // 如果上传新文件 重新获取uuid提交
      if (this.getUrlUuidReqParams.fileName !== '') {
        const res = await getOSSFileUuid(this.getUrlUuidReqParams)
        if (!this.editDetail.categoryFileUrl) {
          this.editDetail.categoryFileUrl = []
        }
        this.editDetail.categoryFileUrl.push(res.data)
        this.$modal.closeLoading()
      }
    },
    // 获取上传文件签名
    async getOssSignData() {
      const res = await getOssSign()
      this.sign = res.data
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

    //获取商品项目分页列表
    async getProductpage(page) {
      this.tableLoading = true
      if (page == 1) {
        this.reqParams.page = page
      }
      if (Array.isArray(this.reqParams.manager)) {
        this.reqParams.manager =
          this.reqParams.manager[this.reqParams.manager.length - 1]
      }
      this.reqParams.category = []
      for (let i = this.categoryList.length; i--; ) {
        let arr = this.categoryList[i]
        if (Array.isArray(arr)) {
          arr = arr[arr.length - 1]
        }
        this.reqParams.category.push(arr)
      }
      // if (Array.isArray(this.reqParams.category)) {
      //   this.reqParams.category =
      //     this.reqParams.category[this.reqParams.category.length - 1]
      // }

      if (Array.isArray(this.reqParams.track)) {
        this.reqParams.track =
          this.reqParams.track[this.reqParams.track.length - 1]
      }
      if (Array.isArray(this.reqParams.shape)) {
        this.reqParams.shape =
          this.reqParams.shape[this.reqParams.shape.length - 1]
      }
      if (Array.isArray(this.reqParams.priceZone)) {
        this.reqParams.priceZone =
          this.reqParams.priceZone[this.reqParams.priceZone.length - 1]
      }
      if (Array.isArray(this.reqParams.crowd)) {
        this.reqParams.crowd =
          this.reqParams.crowd[this.reqParams.crowd.length - 1]
      }
      this.reqParams.startTime = this.dateRange?.[0]
      this.reqParams.endTime = this.dateRange?.[1]
      const res = await pageList(this.reqParams)
      this.linkList = res.data.records
      this.total = res.data.total
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
    addStrategy() {
      this.isEdit = false
      this.getOssSignData()
      this.editDetail = {
        strategyTimeStatus: 10,
        status: 1,
        category: [],
        designerUuid: '',
        projectType: '',
        brandUuid: '',
        marketType: '',
        customerType: '',
        shapeDept: '',
        seasonLevel: '',
      }
      //店铺状态默认是运营
      // this.editDetail.status = 1

      this.showAddDialog = true
    },

    // 修改
    async editStrategybutton(rows) {
      let row = deepClone(rows)
      // this.editDetail = row

      this.fileRecordList = []
      this.fileRecordListTrck = []
      this.fileRecordListImage = []
      // 获取上传文件的签名
      this.getOssSignData()
      this.isEdit = true
      // 提取文件图片地址
      if (row.categoryFileUrl && row.categoryFileUrl.length > 0) {
        row.categoryFileUrl.forEach((item) => {
          this.fileRecordList.push(item.url)
        })
        row.categoryFileUrl = row.categoryFileUrl.map((item) => item.uuid)
      }
      if (row.trackFileUrl && row.trackFileUrl.length > 0) {
        row.trackFileUrl.forEach((item) => {
          this.fileRecordListTrck.push(item.url)
        })
        row.trackFileUrl = row.trackFileUrl.map((item) => item.uuid)
      }
      if (row.imageUrls && row.imageUrls.length > 0) {
        row.imageUrls.forEach((item) => {
          this.fileRecordListImage.push(item.url)
        })
        row.imageUrls = row.imageUrls.map((item) => item.uuid)
      }

      this.editDetail = row
      // 获取赛道品类的完整选择值
      let res = await detailStrategy({ uuid: row.uuid })
      this.editDetail.category = res.data.categoryUuidList
      this.editDetail.shape = res.data.shapeUuidList
      this.editDetail.priceZone = res.data.priceUuidList
      this.editDetail.crowd = res.data.crowdUuidList
      this.editDetail.track = res.data.trackUuidList
      if (!this.editDetail.trackFileUrl) {
        this.editDetail.trackFileUrl = []
      }

      if (this.editDetail.manager) {
        let manager = this.editDetail.manager
        const res = await listAllUpperDept({ userUuid: manager })
        this.editDetail.manager = res.data.splice(1)
        this.editDetail.manager.push(manager)
      }
      // console.log('this.editDetail', this.editDetail)

      if (this.editDetail.helpSupportUuid) {
        let helpSupportUuid = this.editDetail.helpSupportUuid
        const res = await listAllUpperDept({ userUuid: helpSupportUuid })
        this.editDetail.helpSupportUuid = res.data.splice(1)
        this.editDetail.helpSupportUuid.push(helpSupportUuid)
      }
      if (this.editDetail.planningUuid) {
        let planningUuid = this.editDetail.planningUuid
        const res = await listAllUpperDept({ userUuid: planningUuid })
        this.editDetail.planningUuid = res.data.splice(1)
        this.editDetail.planningUuid.push(planningUuid)
      }
      if (this.editDetail.designerUuid) {
        let designerUuid = this.editDetail.designerUuid
        const res = await listAllUpperDept({ userUuid: designerUuid })
        this.editDetail.designerUuid = res.data.splice(1)
        this.editDetail.designerUuid.push(designerUuid)
      }

      // 打开弹层
      this.showAddDialog = true

      // this.editDetail = deepClone(row)
    },

    // 关闭新增修改弹层清空表单数据
    cleanAdd() {
      this.showAddDialog = false
      this.$refs['addDetailRef'].resetFields()
      // 暂时注释，后续放开
      /* this.$nextTick(() => {
        this.$refs.OSSFileUploadRef.clearFileList()
      })
      this.$nextTick(() => {
        this.$refs.OSSFileUploadRefTrck.clearFileList()
      }) */
      this.$nextTick(() => {
        this.$refs.OSSFileUploadRefImage.clearFileList()
      })

      this.getUrlUuidReqParams = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
      this.getUrlUuidReqParamsTrck = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
      this.getUrlUuidReqParamsImage = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
      this.editDetail = {
        category: [],
        designerUuid: '',
        projectType: '',
        brandUuid: '',
        marketType: '',
        customerType: '',
        shapeDept: '',
        seasonLevel: '',
      }
      this.fileRecordList = []

      this.fileRecordListImage = []
      this.fileRecordListTrck = []

      this.isEdit = false
      this.getProductpage()
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

          this.categoryListAdd = this.editDetail.category
          this.editDetail.category = []
          for (let i = this.categoryListAdd.length; i--; ) {
            let arr = this.categoryListAdd[i]
            if (Array.isArray(arr)) {
              arr = arr[arr.length - 1]
            }
            this.editDetail.category.push(arr)
          }
          if (Array.isArray(this.editDetail.track)) {
            this.editDetail.track =
              this.editDetail.track[this.editDetail.track.length - 1]
          }
          if (Array.isArray(this.editDetail.shape)) {
            this.editDetail.shape =
              this.editDetail.shape[this.editDetail.shape.length - 1]
          }
          if (Array.isArray(this.editDetail.crowd)) {
            this.editDetail.crowd =
              this.editDetail.crowd[this.editDetail.crowd.length - 1]
          }
          if (Array.isArray(this.editDetail.priceZone)) {
            this.editDetail.priceZone =
              this.editDetail.priceZone[this.editDetail.priceZone.length - 1]
          }
          if (!this.editDetail.assistant) {
            this.editDetail.assistant = ''
          }

          // 提取项目实施人uuid
          if (
            Array.isArray(this.editDetail.manager) &&
            this.editDetail.manager.length > 0
          ) {
            this.editDetail.manager =
              this.editDetail.manager[this.editDetail.manager.length - 1]
          } else {
            this.editDetail.manager = ''
          }
          // 提取帮扶负责人uuid
          if (
            Array.isArray(this.editDetail.helpSupportUuid) &&
            this.editDetail.helpSupportUuid.length > 0
          ) {
            this.editDetail.helpSupportUuid =
              this.editDetail.helpSupportUuid[
                this.editDetail.helpSupportUuid.length - 1
              ]
          } else {
            this.editDetail.helpSupportUuid = ''
          }
          // 提取项目企划负责人uuid
          if (
            Array.isArray(this.editDetail.planningUuid) &&
            this.editDetail.planningUuid.length > 0
          ) {
            this.editDetail.planningUuid =
              this.editDetail.planningUuid[
                this.editDetail.planningUuid.length - 1
              ]
          } else {
            this.editDetail.planningUuid = ''
          }
          // 提取设计师uuid
          if (
            Array.isArray(this.editDetail.designerUuid) &&
            this.editDetail.designerUuid.length > 0
          ) {
            this.editDetail.designerUuid =
              this.editDetail.designerUuid[
                this.editDetail.designerUuid.length - 1
              ]
          } else {
            this.editDetail.designerUuid = ''
          }

          if (this.isEdit) {
            await editStrategy(this.editDetail)
          } else {
            await addStrategy(this.editDetail)
          }

          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })

          //关闭弹窗
          this.cleanAdd()
          //刷新数据
          this.getProductpage()
        }
      })
    },

    // 删除
    deleteStrategy(uuid) {
      this.$confirm('确定删除此项目，删除后不可恢复？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            await delstrategy({ uuid: uuid })
            instance.confirmButtonLoading = false
            await done()
            await this.getProductpage()
            this.$message({
              type: 'success',
              message: '删除项目成功！',
            })
          } else {
            await done()
          }
        },
      })
    },
    exportStrategy() {
      if (this.linkList.length == 0) {
        return this.$message.error('暂无数据导出')
      }
      exportStrategy(this.reqParams)
        .then(async (data) => {
          const isBlob = blobValidate(data)
          if (isBlob) {
            const blob = new Blob([data])
            saveAs(blob, `项目统计配置表.xlsx`)
          }
        })
        .catch((r) => {
          console.error(r)
          Message.error('下载文件出现错误，请联系管理员！')
          downloadLoadingInstance.close()
        })
    },
  },
}
</script>

<style scoped></style>
