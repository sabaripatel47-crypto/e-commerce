import request from "@/utils/request";

// 获取未处理快递单列表
export function getUntreatedList(data) {
  return request({
    url: "/server/express/pending_list",
    method: "post",
    data: data,
  });
}

// 获取未处理的店铺下拉框数据
export function getUntreatedStore() {
  return request({
    url: "/server/express/store/pull",
    method: "get",
  });
}

// 添加快递处理人(点击处理)
export function editConductor(data) {
  return request({
    url: "/server/express/edit_conductor",
    method: "post",
    data: data,
  });
}

// 点击处理时获取快递详情
export function getExpressDetail(data) {
  return request({
    url: "/server/express/conductor_info",
    method: "post",
    data: data,
  });
}

// 删除快递单
export function deleteExpress(data) {
  return request({
    url: "/server/express/courier_delete",
    method: "delete",
    data: data,
  });
}

// 点击暂不处理(取消)
export function conductorBracket(data) {
  return request({
    url: "/server/express/conductor_bracket",
    method: "post",
    data: data,
  });
}

// 提交处理后的快递单
// export function submitHandle(data) {
//   return request({
//     url: "/server/express/conductor_update",
//     method: "post",
//     data: data,
//   });
// }

// 处理人获取状态下拉框数据
export function getStatusList() {
  return request({
    url: "/server/express/conductor_status",
    method: "get",
  });
}

// 获取全量快递单数据
export function getAllDataList(data) {
  return request({
    url: "/server/express/select_list",
    method: "post",
    data: data,
  });
}


// 提交快递退款数据
export function updateAllDataList(data) {
  return request({
    url: "/server/express/conductor_update",
    method: "post",
    data: data,
  });
}


// 获取文件上传签名密匙-物流主图
export function fileLogistics() {
  return request({
    url: "/server/files/token_file_logistics",
    method: "get",
  });
}

// 获取文件uuid
export function getFilesUuid(data) {
  return request({
    url: "/server/files/uuid",
    method: "post",
    data: data,
  });
}

