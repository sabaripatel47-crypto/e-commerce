<template>
  <div class="background-color">
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 13px;
      "
    >
      <el-tooltip
        class="item"
        effect="dark"
        :content="toolTip"
        placement="top"
        v-if="toolTip != ''"
      >
        <svg
          class="icon"
          preserveAspectRatio="xMidYMid meet"
          height="13px"
          width="13px"
          colo
        >
          <use xlink:href="#icon-question" fill="#a0a0a1" />
        </svg>
      </el-tooltip>
      <span style="color: #a0a0a1; font-size: 13px">{{ title }} </span>

      <span style="color: #a0a0a1; font-size: 13px" v-if="unit != ''"
        >({{ unit }})</span
      >
      <img
        v-if="Number(type) == 2"
        src="@/assets/images/downward-line-arrow.svg"
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

    <h2>
      {{
        num == "null"
          ? "-"
          : num == "null|undefined"
          ? "-"
          : num == "undefined"
          ? "-"
          : num == "undefined|undefined"
          ? "-"
          : num
      }}
    </h2>
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
      type: String,
      required: false,
    },
    type: {
      type: Number,
      default: 0,
    },
    toolTip: {
      type: String,
      default: "",
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
