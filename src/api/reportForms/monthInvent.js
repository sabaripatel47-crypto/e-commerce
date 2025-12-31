import request from "@/utils/request";

// 获取表数据
export function getDataList(data) {
  return request({
    url: `/server/month_invent`,
    method: "post",
    data,
  });
}

// 获取表头
export function getTableHead(data) {
  return request({
    url: `/server/month_invents`,
    method: "post",
    data,
  });
}
