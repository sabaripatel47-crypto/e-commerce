import request from "@/utils/request";

// 入库管理数据列表
export function getWarehousingList(data) {
  return request({
    url: "/server/goods/page",
    method: "post",
    data,
  });
}

// 新增入库
export function addWarehousing(data) {
  return request({
    url: "/server/goods/add",
    method: "post",
    data,
  });
}

// 入库详情
export function warehousingDetail(id) {
  return request({
    url: `/server/goods/update/${id}`,
    method: "get",
  });
}

// 修改入库
export function editWarehousing(data) {
  return request({
    url: `/server/goods/update`,
    method: "put",
    data,
  });
}

// 获取部门结构
export function getDept() {
  return request({
    url: `/server/goods/department`,
    method: "get",
  });
}
