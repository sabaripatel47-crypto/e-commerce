<template>
  <div ref="rightPanel" class="rightPanel-container" :class="{ show: show }">
    <div class="handle-button" :style="{ 'background-color': theme }" @click.stop="show = !show">
      <i :class="show ? 'el-icon-close' : 'el-icon-setting'" />
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'RightPanel',
  computed: {
    theme() {
      return this.$store.state.settings.theme
    },
    show: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rightPanel-container {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 40000;
  transition: right 0.3s ease;

  &.show {
    right: 280px; // el-drawer 的宽度
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  cursor: pointer;
  color: #fff;
  line-height: 48px;

  i {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
