import Vue from "vue";

Vue.filter("formatStatisticsType", function (gender) {
  const config = {
    1: "销售额",
    2: "订单数",
    3: "商品数量",
    4: "退款额",
    5: "退单数",
    6: "退单商品数量",
    7: "退单率",
    8: "客单价",
    9: "件单量",
  };
  return config[gender] || "-";
});
