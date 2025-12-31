import request from "@/utils/request";

// 部门列表查询
export function getParentId(query) {
  return request({
    url: "/server/every/user/parent",
    method: "get",
    params: query,
  });
}

// 文件上传
export function fileUpload(data) {
  return request({
    url: `/server/sku/upload`,
    method: "post",
    data,
  });
}

// 文件删除
export function deleteFile(query) {
  return request({
    url: "/server/oss/delete/filePath",
    method: "post",
    params: query,
  });
}

// 根据id拿姓名
export function getInfo(ids) {
  return request({
    url: `/system/depatment/selectByUserName/${ids}`,
    method: "get",
  });
}

// 根据部门id拿部门名
export function getDeptName(ids) {
  return request({
    url: `/system/feign/user/queryDeptByList/${ids}`,
    method: "get",
  });
}

// 资料信息推送
export function getFilePush() {
  return request({
    url: `/server/file/push`,
    method: "get",
  });
}
