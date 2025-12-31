<template>
  <el-select
    ref="selectRef"
    v-model="selectedValue"
    v-bind="$attrs"
    filterable
    clearable
    :filter-method="handleFilter"
    @visible-change="handleVisibleChange"
    v-el-select-loadmore="handleLoadMore"
    :loading="loading"
    :remote-method="handleSearch"
    remote
    reserve-keyword
  >
    <el-option
      v-for="item in optionList"
      :key="item.code"
      :label="getOptionLabel(item)"
      :value="item.code"
    />
  </el-select>
</template>

<script>
import { skuPageList } from '@/api/baseData/common'

// 注册el-select-loadmore指令 - 完全按照你页面中的写法
const loadmoreDirective = {
  bind(el, binding) {
    const SELECTWRAP_DOM = el.querySelector(
      '.el-select-dropdown .el-select-dropdown__wrap'
    )
    if (SELECTWRAP_DOM) {
      SELECTWRAP_DOM.addEventListener('scroll', function () {
        const condition =
          this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
          this.clientHeight
        if (condition) binding.value()
      })
    }
  },
}

export default {
  name: 'RemoteSelect',

  inheritAttrs: false,

  // 注册指令
  directives: {
    'el-select-loadmore': loadmoreDirective,
  },

  props: {
    value: {
      type: [String, Number, Array],
      default: '',
    },
    // 外部传入的spuUuid，可选
    spuUuid: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      selectedValue: this.value,
      optionList: [],
      loading: false,
      hasMore: true,
      currentPage: 1,
      searchKeyword: '',
      total: 0,
      searchTimer: null,
      isFirstLoad: true,
      hasInitLoaded: false,
    }
  },

  watch: {
    value: {
      handler(newVal) {
        this.selectedValue = newVal
      },
      immediate: true,
    },

    selectedValue: {
      handler(newVal) {
        this.$emit('input', newVal)
      },
    },

    // 深度监听spuUuid变化
    spuUuid: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.handleSpuUuidChange(newVal)
        }
      },
      deep: true,
    },
  },

  mounted() {
    // 组件挂载时不自动加载，等下拉框展开时再加载
    this.loadOptions()
  },

  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },

  methods: {
    /**
     * 获取选项label
     */
    getOptionLabel(item) {
      const extendKeyword = item.extendKeyword || ''
      const name = item.name || ''
      return extendKeyword ? `(${name})${extendKeyword}` : name
    },

    /**
     * spuUuid变化时的处理
     */
    handleSpuUuidChange(newSpuUuid) {
      // 重置状态
      this.resetState()

      // 如果spuUuid不为空，则加载数据

      this.loadOptions()
    },

    /**
     * 重置状态
     */
    resetState() {
      this.optionList = []
      this.currentPage = 1
      this.hasMore = true
      this.total = 0
      this.searchKeyword = ''
      this.isFirstLoad = true
      this.hasInitLoaded = false
      this.clear()
    },

    /**
     * 加载选项数据
     */
    async loadOptions() {
      if (this.loading) return

      this.loading = true

      try {
        const params = {
          keyword: this.searchKeyword,
          page: this.currentPage,
          pageSize: 20,
          spuUuid: this.spuUuid || '',
        }

        // console.log('params', params)

        const response = await skuPageList(params)
        const { records, total } = response.data

        // 处理数据
        if (this.currentPage === 1) {
          this.optionList = records || []
        } else {
          // 加载更多时，直接追加数据
          this.optionList = [...this.optionList, ...(records || [])]
        }

        this.total = total || 0

        // 判断是否还有更多数据
        const currentRecords = records || []
        if (currentRecords.length < 20) {
          this.hasMore = false
        } else {
          this.hasMore = true
        }

        this.hasInitLoaded = true

        // 第一页加载完成
        if (this.currentPage === 1) {
          this.isFirstLoad = false
        }
      } catch (error) {
        console.error('加载下拉选项失败:', error)
        this.hasMore = false
      } finally {
        this.loading = false
      }
    },

    /**
     * 过滤方法（本地过滤）
     */
    handleFilter(query) {
      this.searchKeyword = query || ''
      this.currentPage = 1
      this.isFirstLoad = false
      this.hasInitLoaded = false

      // 清空选项列表
      this.optionList = []
      this.hasMore = true

      // 防抖处理，300ms后执行
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      this.searchTimer = setTimeout(() => {
        // 只有当有搜索关键词或spuUuid时才查询
        if (this.searchKeyword !== '' || this.spuUuid !== '') {
          this.loadOptions()
        }
      }, 300)
    },

    /**
     * 远程搜索（为兼容el-select的remote-method）
     */
    handleSearch(query) {
      // 直接调用handleFilter，实现相同的功能
      this.handleFilter(query)
    },

    /**
     * 触底加载更多
     */
    handleLoadMore() {
      // 如果没有更多数据，或者正在加载，则不加载
      if (!this.hasMore || this.loading) {
        return
      }

      this.currentPage += 1
      this.loadOptions()
    },

    /**
     * 下拉框显示/隐藏事件
     */
    handleVisibleChange(visible) {
      // console.log('visible', visible)
      if (visible === false) {
        this.currentPage = 1
        this.searchKeyword = ''
        this.loadOptions()
      }

      // 当下拉框显示时，如果还没有数据，则加载数据
      if (visible && this.optionList.length === 0 && !this.loading) {
        if (this.searchKeyword !== '' || this.spuUuid !== '') {
          this.loadOptions()
        }
      }

      // 透传事件给父组件
      this.$emit('visible-change', visible)
    },

    /**
     * 清空选择
     */
    clear() {
      this.selectedValue = ''
      this.$emit('input', '')
      this.$emit('change', '')
    },
  },
}
</script>