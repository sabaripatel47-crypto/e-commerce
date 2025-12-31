import request from "@/utils/request";

// 部门列表查询
export function department() {
  return request({
    url: "/server/files/department",
    method: "get",
  });
}

// 文件查询列表 files/powerFileList
export function fileList(data) {
  return request({
    url: "/server/files/powerFileList",
    method: "post",
    data,
  });
}

// 部门个人筛选 /selectDep/
export function selectDep(type) {
  return request({
    url: `/server/files/selectDep/${type}`,
    method: "get",
  });
}

// 文件上传接口
export function uploadFile(data) {
  return request({
    url: `/server/files/upload`,
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 文件删除 /files/delete
export function deleteFile(data) {
  return request({
    url: `/server/files/delete`,
    method: "delete",
    data,
  });
}

// 分享详情
export function fileDetail(data) {
  return request({
    url: `/server/files/showFileList`,
    method: "post",
    data,
  });
}

// 文件分享
export function shareFile(data) {
  return request({
    url: `/server/files/shareFile`,
    method: "post",
    data,
  });
}

// 修改文件分享状态
export function editShare(data) {
  return request({
    url: `/server/files/shareFile`,
    method: "put",
    data,
  });
}

// 下载文件
export function downloadFile(data) {
  return request({
    url: `/server/files/downLoad`,
    method: "post",
    data,
    responseType: "Blob",
  });
}

// 详情列表文件修改/files/publicFile
export function editFileDel(data) {
  return request({
    url: `/server/files/powerFile`,
    method: "put",
    data,
    responseType: "Blob",
  });
}
