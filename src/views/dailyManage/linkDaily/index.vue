<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="商品链接：" style="margin-right: 20px">
          <el-input
            placeholder="请输入商品链接id"
            v-model="reqParams.linkId"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品等级：" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.linkLevel" multiple placeholder="请选择商品等级">
            <el-option
              v-for="item in linkLevels"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上级点评日期：" style="margin-right: 20px">
          <el-date-picker
            v-model="reqParams.fillInTime"
            type="date"
            placeholder="选择日期时间"
            align="right"
            value-format="timestamp"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-radio-group
        class="el-form-item-width40"
        v-model="reqParams.sortType"
        @input="sortTypeChangeEvent"
      >
        <el-radio-button
          v-for="item in sortTypeList"
          :key="item.code"
          :label="item.code"
        >{{ item.name }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="linkList" style="width: 100%" v-loading="tableLoading" max-height="600">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="linkId" label="商品链接编码" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="uuid" label="主图" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.url"
              style="height: 30px; width: 30px"
              :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.url]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="linkLevel" label="商品等级" align="center"></el-table-column>
        <el-table-column prop="storeName" label="所属店铺" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="platformName" label="所属平台" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="managerName" label="负责人" align="center"></el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center">
          <template v-slot="{ row }">{{ getFormatDateTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template v-slot="{ row }">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="addTodayDaily(row.uuid)"
            >今日日报</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="addYesterdayDaily(row.uuid)"
            >昨日日报</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="dailyDetail(row)">日报详情</el-button>
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

    <!--今日日报/昨日日报 弹窗-->
    <el-dialog fullscreen :title="addDialogTitle" :visible="showAddDialog" :before-close="cleanAdd">
      <el-descriptions :column="4">
        <el-descriptions-item label="商品名称">{{ detail.linkTitle }}</el-descriptions-item>
        <el-descriptions-item label="商品编码">{{ detail.linkId }}</el-descriptions-item>
        <el-descriptions-item class="linkLevel-class" label="商品等级">{{ detail.linkLevel }}</el-descriptions-item>
        <el-descriptions-item label="主图">
          <template>
            <el-image
              v-if="detail.url"
              style="height: 40px; width: 40px"
              :src="
                detail.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="detail.srcList"
            ></el-image>
            <span v-else>暂无主图</span>
          </template>
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="detail" ref="detailRef">
        <div class="dialog-table-class">
          <el-table
            :data="detail.itemKeyList"
            style="width: 100%"
            max-height="calc(90vh - 120px)"
            :span-method="arraySpanMethod"
          >
            <el-table-column
              prop="dailyTempCategory"
              column-key="dailyTempCategory"
              label="在哪端"
              align="center"
              width="150"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="dailyTempItemName"
              label="在哪个端口"
              align="center"
              width="120"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              v-for="(item, index) in detailTitleList"
              :key="index"
              :prop="item.title"
              :label="item.title"
              :width="columnWidth[item.uuid]"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-form-item
                  :prop="
                    'itemKeyList.' + scope.$index + '.' + item.title + '.value'
                  "
                  :rules="linkDailyRules(scope.$index, scope.row[item.title])"
                >
                  <div v-if="item.uuid !== '3' && item.uuid !== '5'">
                    <el-input
                      v-model="
                        detail.itemKeyList[scope.$index][item.title].value
                      "
                      @input="inputOnExchange(scope.$index)"
                    ></el-input>
                  </div>
                  <div
                    class="file"
                    v-else-if="
                      (item.uuid === '3' || item.uuid === '5') &&
                      detail.itemKeyList[scope.$index][item.title].value
                        .length > 0
                    "
                  >
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="
                        splitFileName(
                          detail.itemKeyList[scope.$index][item.title].value
                        ).originalName
                      "
                      placement="top"
                    >
                      <a
                        class="file-a"
                        :href="
                          detail.itemKeyList[scope.$index][item.title].value
                        "
                      >
                        {{
                        splitFileName(
                        detail.itemKeyList[scope.$index][item.title].value
                        ).shrinkName
                        }}
                      </a>
                    </el-tooltip>
                    <i
                      class="el-icon-close file-icon"
                      @click="delItemFile(scope.$index, item.title)"
                    ></i>
                  </div>
                  <div v-else>
                    <OSSFileUpload
                      :fileType.sync="fileType"
                      :sign.sync="sign"
                      @getFileUrl="getFileUrl(scope.$index, item.title, $event)"
                      @deleteFile="deleteFile(scope.$index, item.title, $event)"
                    ></OSSFileUpload>
                  </div>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <ViewDailyDialog
      :row.sync="currentRow"
      :showDialog.sync="showViewDailyDialog"
      :readOnly="false"
    ></ViewDailyDialog>
  </div>
</template>

<script>
import {
  getLinkDailyList,
  getLinkDailyDetail,
  addLinkDailyDetail,
  getOssSign,
} from '@/api/dailyManage/linkDaily'
import { systemData, listLinkLevel } from '@/api/baseData/common'
import { getFormatDate, getFormatDateTime } from '@/utils/common'
import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'

export default {
  name: 'LinkDaily',
  components: {
    ViewDailyDialog,
  },
  data() {
    return {
      total: 0,
      linkList: [],
      // 文件类型
      fileType: [
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.zip',
        '.jpg',
        '.png',
        '.rar',
        '.md',
      ],

      // 查询接口加载状态
      tableLoading: false,

      // 表格列宽
      columnWidth: {
        1: '',
        3: 180,
        4: 100,
        2: '',
        5: 180,
        6: '',
      },

      // 图片大图预览数组
      srcList: [],

      //今日日报、昨日日报的弹窗
      showAddDialog: false,

      //今日日报、昨日日报的Dialog标题
      addDialogTitle: '',

      //查看日报的dialog标记
      showViewDailyDialog: false,

      //今日日报详情的数据
      detail: { itemKeyList: [] },

      //Dialog的系统时间
      dialogSystemTime: 0,

      //日报查看的当前查看行
      currentRow: {},

      //详情的抬头
      detailTitleList: [
        { uuid: '2', title: '存在什么问题' },
        // { uuid: '5', title: '存在什么问题' },//附件列
        { uuid: '6', title: '准备怎么解决及支持' },
        { uuid: '1', title: '具体做了什么' },
        { uuid: '4', title: '具体做了多少' },
        { uuid: '3', title: '附件' },
      ],

      //排序方式的内容
      sortTypeList: [
        { code: '1', name: '商品等级正序' },
        { code: '2', name: '修改时间倒序' },
      ],

      // 查询请求入参
      reqParams: {
        linkId: '',
        linkLevel: [],
        sortType: 1, //默认是按商品等级排序
        fillInTime: '',
        page: 1,
        pageSize: 20,
      },

      // 商品等级下拉框数据
      linkLevels: [],

      // 文件上传签名
      sign: {},

      // 时间快捷选择
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const date = new Date()
              date.setHours(0, 0, 0, 0) // 设置为当天的零点
              const timestamp = date.getTime() // 获取时间戳
              console.log('时间戳')
              console.log(timestamp)
              picker.$emit('pick', timestamp)
            },
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setDate(date.getDate() - 1) // 获取昨天的日期
              date.setHours(0, 0, 0, 0) // 设置为昨天的零点
              const timestamp = date.getTime() // 获取时间戳
              picker.$emit('pick', timestamp)
            },
          },
          {
            text: '一周前',
            onClick(picker) {
              const date = new Date()
              date.setDate(date.getDate() - 7) // 获取一周前的日期
              date.setHours(0, 0, 0, 0) // 设置为一周前的零点
              const timestamp = date.getTime() // 获取时间戳
              picker.$emit('pick', timestamp)
            },
          },
        ],
      },
    }
  },
  async created() {
    await this.getList()
    //商品等级的下拉框
    await this.listLinkLevel()
    if (this.$route.query?.linkId) {
      this.addTodayDaily(this.$route.query.linkId)
      this.$router.replace({ path: this.$route.path, query: {} })
    }
  },
  methods: {
    //必填校验
    linkDailyRules(index, title) {
      return [
        {
          trigger: 'blur',
          validator: (rule, value, callback) => {
            let itemKey = this.detail.itemKeyList[index]
            // let think = itemKey['思考决策'].value
            // let reson = itemKey['分析原因'].value
            // let thinkAnnex = itemKey['思考决策附件'].value
            // let resonAnnex = itemKey['分析原因附件'].value

            let think = itemKey['准备怎么解决及支持'].value
            let reson = itemKey['存在什么问题'].value
            // let thinkAnnex = itemKey['附件'].value
            // let resonAnnex = itemKey['存在什么问题'].value
            if (title.dailyDataType === '2' || title.dailyDataType === '6') {
              // 有思考决策附件，并且思考决策为空值
              // if (thinkAnnex !== '' && !(think !== '')) {
              //   callback(new Error('有接下去怎么干时，具体做了什么必须填写'))
              // }
              // 有分析原因附件，并且分析原因为空值
              // else if (resonAnnex !== '' && !(reson !== '')) {
              //   callback(new Error('有存在什么问题时，存在什么问题必须填写'))
              // }
              // 前面两列，有一列为空
              if (
                (think === '' && reson !== '') ||
                (think !== '' && reson === '')
              ) {
                callback(
                  new Error(
                    '准备怎么解决及支持和存在什么问题必须都填或者都不填'
                  )
                )
              } else {
                callback()
              }
            } else {
              //dailyDataType =3和4，不做处理
              callback()
            }
          },
        },
      ]
    },

    //商品等级的下拉框
    async listLinkLevel() {
      const res = await listLinkLevel()
      this.linkLevels = res.data
    },

    //时间格式化
    getFormatDateTime(timeStamp) {
      if (!timeStamp) {
        return ''
      }
      return getFormatDateTime(timeStamp)
    },

    // 获取上传文件签名
    async getOssSignData() {
      const res = await getOssSign()
      this.sign = res.data
    },
    // 获取oss文件名称
    getFileUrl(idx, title, val) {
      this.detail.itemKeyList[idx][title].value = val
    },
    deleteFile(idx, title, val) {
      this.detail.itemKeyList[idx][title].value = ''
    },

    // 删除当前文件
    delItemFile(idx, title) {
      console.log('this.detail.itemKeyList', this.detail.itemKeyList)
      console.log('title', title)
      this.$confirm('确定删除此文件？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'

            // this.detail.itemKeyList[idx][title].value = ''
            // this.$set(this.detail.itemKeyList, idx, {
            //   ...this.detail.itemKeyList[idx],
            //   title: {
            //     ...this.detail.itemKeyList[idx][title],
            //     value: '',
            //   },
            // })
            let arr = [...this.detail.itemKeyList]
            arr.forEach((item, index) => {
              if (index === idx) {
                item[title].value = ''
              }
            })
            this.detail.itemKeyList = arr
            instance.confirmButtonLoading = false
            await done()
            this.$message({
              type: 'success',
              message: '删除成功！',
            })
            this.$forceUpdate()
            console.log('valll', this.detail.itemKeyList[idx][title].value)
          } else {
            await done()
          }
        },
      })
      console.log('val', this.detail.itemKeyList[idx][title].value)
    },

    // 截取文件名称
    splitFileName(fileUrl) {
      let dateFileName = fileUrl.split('/')[fileUrl.split('/').length - 1]
      let fileName = dateFileName.split('-')[dateFileName.split('-').length - 1]
      let fileNameObj = {
        originalName: fileName,
        shrinkName:
          fileName.length > 10 ? fileName.substring(0, 6) + '...' : fileName,
      }
      return fileNameObj
    },

    //排序方式的事件
    sortTypeChangeEvent() {
      this.getList(1)
    },

    //获取列表信息
    async getList(page) {
      this.tableLoading = true
      if (page == 1) {
        this.reqParams.page = page
      }
      const res = await getLinkDailyList(this.reqParams)
      this.linkList = res.data.records
      this.srcList = res.data.records
        .filter((item) => item.url && item.url.trim())
        .map((item) => item.url)
      this.total = res.data.total
      this.tableLoading = false
    },

    //今日日报的弹窗
    async addTodayDaily(linkUuid) {
      const res = await systemData()

      this.dialogSystemTime = res.data

      this.addDialogTitle = getFormatDate(this.dialogSystemTime) + ' 日报'

      //加载今日数据
      this.showDaily(linkUuid, this.dialogSystemTime)
    },

    //昨日日报的弹窗
    async addYesterdayDaily(linkUuid) {
      const res = await systemData()

      this.dialogSystemTime = res.data - 86400000

      this.addDialogTitle = getFormatDate(this.dialogSystemTime) + ' 日报'

      //加载昨日数据
      this.showDaily(linkUuid, this.dialogSystemTime)
    },

    //保存今日日报和昨日日报
    async showDaily(linkUuid, systemTime) {
      const res = await getLinkDailyDetail({
        systemTime: systemTime,
        linkUuid: linkUuid,
      })
      this.detail = res.data
      this.detail.linkUuid = linkUuid
      this.detail.srcList = []
      if (this.detail.url && this.detail.url !== '') {
        this.detail.srcList.push(this.detail.url)
      }
      //上一行的主类目
      let lastDailyTempCategory = ''
      //相同类目的行数
      let lastRowspan = 1
      //相同类目的数据的第一行的索引
      let lastRowIndex = 0
      //处理返回的数据，一个是合并单元格的计算，一个是把动态列从行转成列
      for (let i = 0; i < this.detail.itemKeyList.length; i++) {
        let item = this.detail.itemKeyList[i]

        //-------计算哪些行的主类目要合并,start-----------------------------------
        if (
          lastDailyTempCategory === '' ||
          lastDailyTempCategory !== item.dailyTempCategory
        ) {
          //算总共需要合并的行数,赋值的是上个类目的合并行数
          this.detail.itemKeyList[lastRowIndex].rowspan = lastRowspan

          //重置数据
          lastDailyTempCategory = item.dailyTempCategory
          lastRowspan = 1
          lastRowIndex = i
        } else {
          this.detail.itemKeyList[i].rowspan = 0
          lastRowspan++
        }

        //最后一行，要特殊处理
        if (i === this.detail.itemKeyList.length - 1) {
          //上个类目的合并行数
          if (!this.detail.itemKeyList[lastRowIndex].rowspan) {
            this.detail.itemKeyList[lastRowIndex].rowspan = lastRowspan
          }
          //这里一定要这么写，因为上面给rowspan赋值是0,0代表false
          if (this.detail.itemKeyList[i].rowspan == null) {
            this.detail.itemKeyList[i].rowspan = 1
          }
        }

        //-----计算哪些行的主类目要合并,end--------------------------------------

        //-----把行数据转化成列数据,start-----------------------------------
        //循环列头
        for (let x = 0; x < this.detailTitleList.length; x++) {
          let detailTitle = this.detailTitleList[x]
          //有数据才赋值
          if (item.dailyTempVOList != null && item.dailyTempVOList.length > 0) {
            for (let z = 0; z < item.dailyTempVOList.length; z++) {
              let dailyTempVO = item.dailyTempVOList[z]
              if (dailyTempVO.dailyDataType === detailTitle.uuid) {
                item[detailTitle.title] = {
                  uuid: dailyTempVO.dailyDetailUuid,
                  value: dailyTempVO.dailyDataContent,
                  dailyDataType: dailyTempVO.dailyDataType,
                }
              }
            }
          }
          //如果行转列的时候，列头对应那行没有数据，则赋值个空字符串
          if (item[detailTitle.title] == null) {
            item[detailTitle.title] = {
              uuid: '',
              value: '',
              dailyDataType: detailTitle.uuid,
            }
          }
        }

        //------把行数据转化成列数据,end------------------------------------
      }
      await this.getOssSignData()

      this.showAddDialog = true
    },

    //今日日报和昨天日报弹窗里表格的单元格合并事件
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      //只有第一列需要合并单元格
      if (column.columnKey === 'dailyTempCategory') {
        return { rowspan: row.rowspan, colspan: 1 }
      }
    },

    //日报详情
    dailyDetail(row) {
      row.srcList = []
      row.srcList.push(row.url)
      this.currentRow = row

      this.showViewDailyDialog = true
    },

    //关闭今日日报/昨日日报弹窗
    cleanAdd() {
      this.showAddDialog = false

      this.dialogSystemTime = 0

      this.detail = { itemKeyList: [] }
    },

    //保存事件
    submitForm() {
      //必填校验
      this.$refs['detailRef'].validate(async (valid) => {
        if (valid) {
          //保存今日日报/昨日日报
          await this.saveLinkDaily()

          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })

          //关闭弹窗
          this.cleanAdd()
        }
      })
    },

    //保存今日日报/昨日日报
    async saveLinkDaily() {
      let dailyItemList = {
        linkUuid: this.detail.linkUuid,
        systemTime: this.dialogSystemTime,
        itemKeyList: [],
      }

      //准备组装数据
      for (let i = 0; i < this.detail.itemKeyList.length; i++) {
        let item = this.detail.itemKeyList[i]

        let dailyTempVOList = []
        //遍历列头字段，把数据取出来
        for (let x = 0; x < this.detailTitleList.length; x++) {
          let title = this.detailTitleList[x].title
          let dailyItem = item[title]

          //没有uuid，又没有值的，认为是没有操作的，不用保存
          if (dailyItem.uuid === '' && dailyItem.value === '') {
            continue
          }
          //保存数据
          dailyTempVOList.push({
            dailyDetailUuid: dailyItem.uuid,
            dailyDataType: dailyItem.dailyDataType,
            dailyDataContent: dailyItem.value,
          })
        }

        //有填写了数据，才保存
        if (dailyTempVOList.length > 0) {
          dailyItemList.itemKeyList.push({
            dailyTempItemUuid: item.dailyTempItemUuid,
            dailyTempVOList: dailyTempVOList,
          })
        }
      }

      const res = await addLinkDailyDetail(dailyItemList)
    },

    //输入框的刷新，没有这个，页面不会刷新
    inputOnExchange(index) {
      let moment = this.detail.itemKeyList[index] // 此处的tableData为自己的table表格绑定的data数组
      // 此处是将修改的那一行的数据重新赋值给table表格对应的那一行，触发热更新。
      this.$set(this.detail.itemKeyList, index, moment)
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .dialog-table-class {
    .el-table {
      display: flex;
      flex-direction: column;
    }
    // 表头
    .el-table__header-wrapper {
      overflow: visible;
    }
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .el-descriptions {
    font-size: 16px;
  }
}

.descriptions-calss {
  width: 60%;
}

.file {
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .file-a {
    width: 10vw;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

a,
a:focus,
a:hover {
  cursor: pointer;
  color: #46a6ff;
  text-decoration: underline;
}
</style>
