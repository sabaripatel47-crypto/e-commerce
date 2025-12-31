import request from "@/utils/request";

// 链接等级变更的店铺列表
export function listLinkLevelChangeStoreList(data) {
  return request({
    url: "/server/linkLevelChange/storeList",
    method: "post",
    data: data,
  });
}

// 链接等级变更的链接列表
export function listLinkLevelChangeLinkList(data) {
  return request({
    url: "/server/linkLevelChange/linkList",
    method: "post",
    data: data,
  });
}
