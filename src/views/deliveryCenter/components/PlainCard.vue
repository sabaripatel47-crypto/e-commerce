<template>
  <div class="plain-card">
    <span style="color: #409eff; font-weight: bold"
      >{{ title }} ({{ unit }})</span
    >
    <p style="font-size: 25px; color: red" v-if="type < 0">{{ num }}</p>
    <p style="font-size: 25px" v-if="type == 0">{{ num }}</p>
    <p style="font-size: 25px; color: #67c23a" v-if="type > 0">{{ num }}</p>
  </div>
</template>

<script>
export default {
  name: "PlainCard",
  data() {
    return {};
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      default: "次 |百分比",
    },
    num: {
      type: String | Number,
      default: "",
    },
    type: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="scss" scoped>
.plain-card {
  min-width: 180px;
  height: 100px;
  padding: 10px;
}
</style>
