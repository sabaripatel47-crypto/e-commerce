import request from "@/utils/request";

// 根据店铺获取链接下拉框
export function getTableList(data) {
  return request({
    url: "/server/linkTable/LinkCalculatePage",
    method: "post",
    data: data,
  });
}

// 获取榜单列表
export function getRankList(data) {
  return request({
    url: "/server/linkTable/getRankList",
    method: "post",
    data: data,
  });
}

// 获取榜单详情列表
export function getRankDetailList(rankTitle) {
  return request({
    url: `/server/linkTable/getRankDetailList/${rankTitle}`,
    method: "get",
  });
}
