import request from "@/utils/request";

// 大客户管理数据列表
export function getBigCustomerList(query) {
  return request({
    url: "/server/bigCustomer/list",
    method: "post",
    params: query,
  });
}

// 新增大客户
export function addBigCustomer(data) {
  return request({
    url: "/server/bigCustomer/add",
    method: "post",
    data,
  });
}

// 大客户详情
export function bigCustomerDetail(id) {
  return request({
    url: `/server/bigCustomer/${id}`,
    method: "get",
  });
}

// 修改大客户
export function editBigCustomer(data) {
  return request({
    url: `/server/bigCustomer/edit`,
    method: "post",
    data,
  });
}

// 删除大客户
export function deleteBigCustomer(ids) {
  return request({
    url: `/server/bigCustomer/delete/${ids}`,
    method: "post",
  });
}



// 获取文件上传签名密匙-大客户管理主图
export function getUploadSing() {
  return request({
    url: `/server/files/token_file_customer`,
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

