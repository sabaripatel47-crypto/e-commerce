const state = {
  // 完整的统计类型
  GRADETYPE_LIST: [
    { name: "销售额(占比)", code: 1 },
    { name: "订单数(占比)/等级", code: 2 },
    { name: "商品数量(占比)", code: 3 },
    { name: "退款额(占比)", code: 4 },
    { name: "退单数(占比)", code: 5 },
    { name: "退单商品数量(占比)", code: 6 },
    { name: "退单率", code: 7 },
    { name: "客单价", code: 8 },
    { name: "件单量", code: 9 },
    { name: "销售额的同比环比", code: 10 },
    { name: "订单数的同比环比", code: 11 },
    { name: "商品数量的同比环比", code: 12 },
  ],
  // 统计类型（无等级版本）
  GRADETYPE_LIST_NOLEVEL: [
    { name: "销售额(占比)", code: 1 },
    { name: "订单数(占比)", code: 2 },
    { name: "商品数量(占比)", code: 3 },
    { name: "退款额(占比)", code: 4 },
    { name: "退单数(占比)", code: 5 },
    { name: "退单商品数量(占比)", code: 6 },
    { name: "退单率", code: 7 },
    { name: "客单价", code: 8 },
    { name: "件单量", code: 9 },
    { name: "销售额的同比环比", code: 10 },
    { name: "订单数的同比环比", code: 11 },
    { name: "商品数量的同比环比", code: 12 },
  ],
  // 统计类型（无等级、无同比环比版本）
  GRADETYPE_LIST_NOLEVELYOY: [
    { name: "销售额(占比)", code: 1 },
    { name: "订单数(占比)", code: 2 },
    { name: "商品数量(占比)", code: 3 },
    { name: "退款额(占比)", code: 4 },
    { name: "退单数(占比)", code: 5 },
    { name: "退单商品数量(占比)", code: 6 },
    { name: "退单率", code: 7 },
    { name: "客单价", code: 8 },
    { name: "件单量", code: 9 },
  ],
  GRADETYPE_NAME: {
    1: "销售额",
    2: "订单数",
    3: "商品数量",
    4: "退款额",
    5: "退单数",
    6: "退单商品数量",
    7: "退单率",
    8: "客单价",
    9: "件单量",
  },
  SORT_TYPE: [
    { name: "销售额", code: 1 },
    { name: "退款额", code: 2 },
    { name: "推广费", code: 7 },
    // { name: "退单数", code: 3 },
    // { name: "订单数", code: 4 },
  ],
};
const mutations = {};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
