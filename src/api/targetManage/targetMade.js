import request from "@/utils/request";

// 获取环形进度条数据
export function getDataList() {
  return request({
    url: `/server/sales/comprehensive_list`,
    method: "get",
  });
}

// 获取数据详情
export function getDetailList(data) {
  return request({
    url: `server/sales/comprehensive_detail`,
    method: "post",
    data,
  });
}

// 需求分发
export function distributeDemand(ids) {
  return request({
    url: `server/sales/distribution/${ids}`,
    method: "get",
  });
}
