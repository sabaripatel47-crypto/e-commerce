import request from "@/utils/request";

// 获取表数据
export function getDataList(data) {
  return request({
    url: `/server/sku_sales_person`,
    method: "post",
    data,
  });
}

// 获取表头
export function getTableHead() {
  return request({
    url: `/server/table_persons`,
    method: "post",
  });
}
