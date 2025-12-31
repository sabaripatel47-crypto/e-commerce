import request from "@/utils/request";

//保存链接配置
export function saveLink(data) {
  return request({
    url: "/server/dict/link/saveLink",
    method: "post",
    data: data,
  });
}

//查询链接配置列表
export function queryLinkList(data) {
  return request({
    url: "/server/dict/link/queryLinkList",
    method: "get",
    data: data,
  });
}

//查询spu列表
export function querySpuList(data) {
  return request({
    url: "/server/dict/link/querySpuList",
    method: "get",
    data: data,
  });
}
//店铺下限分页列表
export function store(data) {
  return request({
    url: "/server/dict/link/page/store",
    method: "POST",
    data: data,
  });
}
//spu保存
export function updateSpu(data) {
  return request({
    url: "/server/dict/link/updateSpu",
    method: "POST",
    data: data,
  });
}

//店铺下限分页列表保存
export function updateStore(data) {
  return request({
    url: "/server/dict/link/updateStore",
    method: "POST",
    data: data,
  });
}
