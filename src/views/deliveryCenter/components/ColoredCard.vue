<template>
  <div class="background-color">
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <span style="color: #a0a0a1; font-size: 13px"
        >{{ title }}({{ unit }})</span
      >
      <img
        v-if="Number(type) == 2"
        src="../../../assets/images/downward-line-arrow.svg"
        alt="Downward"
        width="16"
        height="16"
      />
      <img
        v-if="Number(type) == 1"
        src="@/assets/images/upward-line-arrow.svg"
        alt="Upward"
        width="16"
        height="16"
      />
    </div>

    <h2>{{ num }}</h2>
  </div>
</template>

<script>
export default {
  name: "ColoredCard",
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
      default: "",
    },
    num: {
      type: Number,
      default: 0,
    },
    type: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="scss" scoped>
.background-color {
  padding: 10px;
  // max-width: 170px;
  min-width: 120px;
  height: 100px;
  background-color: #f4f5fa;
}
</style>
