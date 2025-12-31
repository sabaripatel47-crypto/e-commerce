<template>
  <el-button v-bind="$attrs" :type="type" :disabled="disabled || isWaiting" @click="handleClick">
    <slot></slot>
  </el-button>
</template>
 
<script>
export default {
  name: 'DebounceButton',
  props: {
    // type类型
    type: {
      type: String,
      default: 'primary',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 防抖延迟时间（毫秒）
    delay: {
      type: Number,
      default: 1000,
    },
    // 点击事件处理函数
    onClick: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      isWaiting: false,
      timer: null,
    }
  },
  methods: {
    handleClick() {
      if (this.isWaiting) return

      this.isWaiting = true

      // 清除之前的定时器
      if (this.timer) {
        clearTimeout(this.timer)
      }

      // 执行点击事件
      this.onClick()

      // 设置定时器，延迟后恢复按钮状态
      this.timer = setTimeout(() => {
        this.isWaiting = false
        this.timer = null
      }, this.delay)
    },
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  },
}
</script>