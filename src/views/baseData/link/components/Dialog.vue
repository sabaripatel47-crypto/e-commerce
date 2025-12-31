<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmLink"
      :rules="linkRules"
      ref="bdmLink"
      label-width="120px"
      label-position="right"
      class="demo-bdmLink"
    >
      <el-form-item label="产品编号" prop="code">
        <el-input v-model="bdmLink.code" placeholder="2-50个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="bdmLink.productName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="sku编码" prop="skuCode">
        <el-input v-model="bdmLink.skuCode" placeholder="2-50个字符"></el-input>
      </el-form-item>
      <el-form-item label="链接地址" prop="url">
        <el-input v-model="bdmLink.url" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="所属平台" prop="platform">
        <el-select v-model="bdmLink.platform" placeholder="请选择所属平台">
          <el-option v-for="item in platform" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="平台ID" prop="platformId">
        <el-input v-model="bdmLink.platformId" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="所属店铺" prop="store">
        <el-select v-model="bdmLink.store" placeholder="请选择所属店铺">
          <el-option v-for="item in store" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="店铺ID" prop="storeId">
        <el-input v-model="bdmLink.storeId" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="市场售价" prop="marketPrice" required>
        <el-input-number size="medium" v-model="bdmLink.marketPrice"></el-input-number>
      </el-form-item>
      <el-form-item label="实际销售价格" prop="salesPrice" required>
        <el-input-number size="medium" v-model="bdmLink.salesPrice"></el-input-number>
      </el-form-item>
      <el-form-item label="链接负责人" prop="manager">
        <el-cascader
          v-model="bdmLink.manager"
          :options="options"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptName', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="所属部门" prop="department">
        <el-cascader
          v-model="bdmLink.department"
          :options="deptOptions"
          :show-all-levels="false"
          :props="{ value:'label', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="业务模型" prop="model">
        <el-select v-model="bdmLink.model" placeholder="请选择所属平台">
          <el-option v-for="item in model" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="职级" prop="rank">
        <el-select v-model="bdmLink.rank" placeholder="请选择所属平台">
          <el-option v-for="item in rank" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="登记时间" prop="createTime" required>
        <el-date-picker
          v-model="bdmLink.createTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="上架时间" prop="listingTime" required>
        <el-date-picker
          v-model="bdmLink.listingTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="商品状态" prop="productIdStatus">
        <el-select v-model="bdmLink.productIdStatus" placeholder="请选择所属平台">
          <el-option v-for="item in productIdStatus" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品级别" prop="storeId">
        <el-input v-model="bdmLink.productIdLevel" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="品牌" prop="brand">
        <el-select v-model="bdmLink.brand" placeholder="请选择所属品牌">
          <el-option v-for="item in brand" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主打链接" prop="mianUrl">
        <el-radio-group v-model="bdmLink.mianUrl">
          <el-radio label="1">是</el-radio>
          <el-radio label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addLink, editLink } from '@/api/baseData/link'
import { department } from '@/api/information/department'
import { deptTreeSelect } from '@/api/system/user'
import { getDictValue } from '@/api/dict/dict'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'Dialog',
  props: {
    showAddDialog: {
      type: Boolean,
      required: true,
    },
    row: {
      type: Object,
    },
  },
  created() {
    if (this.row.id) {
      this.showData()
    }
    this.getDeptTree()
    this.getDictList()
  },
  data() {
    return {
      // 所属平台选项列表
      platform: [],
      // 所属店铺选项列表
      store: [],
      // 业务模型选项列表
      model: [],
      // 职级选项列表
      rank: [],
      // 商品状态选项列表
      productIdStatus: [],
      // 品牌选项列表
      brand: [],

      // 负责人级联选择
      options: [],
      // 部门级联选择
      deptOptions: [],

      bdmLink: {
        id: null,
        code: '',
        productName: '',
        skuCode: '',
        url: '',
        platform: '',
        enterprise: '',
        marketPrice: null,
        salesPrice: null,
        manager: '',
        department: '',
        model: '',
        createTime: '',
        listingTime: '',
        productIdStatus: '',
        productIdLevel: '',
        brand: '',
        mianUrl: '',
        platformId: '',
        store: '',
        storeId: '',
        rank: '',
      },
      linkRules: {
        code: [
          { required: true, message: '请输入产品编号', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        skuCode: [
          { required: true, message: '请输入sku编码', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        url: [{ required: true, message: '请输入链接地址', trigger: 'blur' }],
        platform: [
          { required: true, message: '请选择所属平台', trigger: 'change' },
        ],
        platformId: [
          { required: true, message: '请输入平台ID', trigger: 'blur' },
        ],
        store: [
          { required: true, message: '请选择所属店铺', trigger: 'change' },
        ],
        storeId: [{ required: true, message: '请输入店铺ID', trigger: 'blur' }],
        manager: [
          { required: true, message: '请选择链接负责人', trigger: 'change' },
        ],
        department: [
          { required: true, message: '请选择所属部门', trigger: 'change' },
        ],
        rank: [{ required: true, message: '请选择职级', trigger: 'change' }],
        model: [
          { required: true, message: '请选择业务模型', trigger: 'change' },
        ],
        productIdStatus: [
          { required: true, message: '请选择商品状态', trigger: 'change' },
        ],
        brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
        mianUrl: [
          {
            required: true,
            message: '请选择是否为主打链接',
            trigger: 'change',
          },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改产品' : '新增产品'
    },
  },

  methods: {
    // 获取字典数据
    async getDictList() {
      // 获取平台数据
      const platform = await getDictValue({ dictName: '所属平台' })
      this.platform = platform.data.dictValue
      // 获取店铺选项数据
      const store = await getDictValue({ dictName: '所属店铺' })
      this.store = store.data.dictValue
      // 获取业务模型选项数据
      const model = await getDictValue({ dictName: '业务模型' })
      this.model = model.data.dictValue
      // 获取职级选项数据
      const rank = await getDictValue({ dictName: '职级' })
      this.rank = rank.data.dictValue
      // 获取商品状态选项数据
      const productIdStatus = await getDictValue({ dictName: '商品状态' })
      this.productIdStatus = productIdStatus.data.dictValue
      // 获取品牌选项数据
      const brand = await getDictValue({ dictName: '品牌' })
      this.brand = brand.data.dictValue
    },

    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.options = await getDeptTreeData(res.data)
      console.log('option', this.options)
      // 获取部门数据
      const dept = await deptTreeSelect()
      this.deptOptions = dept.data
      console.log('部门数据', dept)
    },
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const {
        id,
        code,
        productName,
        skuCode,
        url,
        platform,
        enterprise,
        marketPrice,
        salesPrice,
        manager,
        department,
        model,
        createTime,
        listingTime,
        productIdStatus,
        productIdLevel,
        brand,
        mianUrl,
        platformId,
        store,
        storeId,
        rank,
      } = this.row
      this.bdmLink.id = id
      this.bdmLink.code = code
      this.bdmLink.productName = productName
      this.bdmLink.skuCode = skuCode
      this.bdmLink.url = url
      this.bdmLink.platform = platform
      this.bdmLink.enterprise = enterprise
      this.bdmLink.marketPrice = marketPrice
      this.bdmLink.salesPrice = salesPrice
      this.bdmLink.manager = manager
      this.bdmLink.department = department
      this.bdmLink.model = model
      this.bdmLink.createTime = createTime
      this.bdmLink.listingTime = listingTime
      this.bdmLink.productIdStatus = productIdStatus
      this.bdmLink.productIdLevel = productIdLevel
      this.bdmLink.brand = brand
      this.bdmLink.mianUrl = mianUrl
      this.bdmLink.platformId = platformId
      this.bdmLink.store = store
      this.bdmLink.storeId = storeId
      this.bdmLink.rank = rank
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmLink = {
        code: '',
        productName: '',
        skuCode: '',
        url: '',
        platform: '',
        enterprise: '',
        marketPrice: null,
        salesPrice: null,
        manager: '',
      }
      this.$refs.bdmLink.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (Array.isArray(this.bdmLink.manager)) {
        this.bdmLink.manager =
          this.bdmLink.manager[this.bdmLink.manager.length - 1]
      }
      if (Array.isArray(this.bdmLink.department)) {
        this.bdmLink.department =
          this.bdmLink.department[this.bdmLink.department.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmLink.validate()
        // 发送请求
        await addLink(this.bdmLink)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增链接成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmLink.validate()
        await editLink(this.bdmLink)
        this.$message.success('修改链接成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>