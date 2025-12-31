import request from "@/utils/request";

// 字典管理数据列表
export function getDictDataList(query) {
  return request({
    url: "/server/dictData/list",
    method: "post",
    params: query,
  });
}

// 根据字典名获取字典值
export function getDictValue(query) {
  return request({
    url: "/server/dictData/dictName",
    method: "get",
    params: query,
  });
}

// 新增字典
export function addDictData(data) {
  return request({
    url: "/server/dictData/add",
    method: "post",
    data,
  });
}

// 字典详情
export function dictDataDetail(id) {
  return request({
    url: `/server/dictData/${id}`,
    method: "get",
  });
}

// 修改字典
export function editDictData(data) {
  return request({
    url: `/server/dictData/edit`,
    method: "post",
    data,
  });
}

// 删除字典
export function deleteDictData(ids) {
  return request({
    url: `/server/dictData/delete/${ids}`,
    method: "post",
  });
}



// 新的字典管理
export function getDictData(query) {
  return request({
    url: `/server/dict/listDict`,
    method: "get",
    params: query,
  });
}
