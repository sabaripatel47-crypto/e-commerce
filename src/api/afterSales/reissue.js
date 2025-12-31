import { listKeyData } from "@/api/system/dict/data";
import request from "@/utils/request";
// 新增订单号查询接口
export function getOrderDetail(ids) {
  return request({
    url: `/server/reissue/getOrderDetail/${ids}`,
    method: "get",
  });
}

// 新增补发详情接口
export function getDetail(ids) {
  return request({
    url: `/server/reissue/getDetail/${ids}`,
    method: "get",
  });
}

// 确认补发接口
export function determine(data) {
  return request({
    url: `/server/reissue/determine`,
    method: "post",
    data: data,
  });
}

//补发修改提交接口
export function update(data) {
  return request({
    url: `/server/reissue/update`,
    method: "post",
    data: data,
  });
}

//补发类型下拉框
export function listReissueType() {
  return listKeyData("reissue_type");
}

//补发新增接口
export function addList(data) {
  return request({
    url: `/server/reissue/add`,
    method: "post",
    data: data,
  });
}

//补发新增提交接口
export function spuList(data) {
  return request({
    url: `/server/product_manage/spu_sku`,
    method: "post",
    data: data,
  });
}

//补发等级分页列表接口
export function pageList(data) {
  return request({
    url: `/server/reissue/pageList`,
    method: "post",
    data: data,
  });
}

//补发售后-作废
export function UpdateAfterSalesCancel(data) {
  return request({
    url: `/server/reissue/UpdateAfterSalesCancel`,
    method: "post",
    data: data,
  });
}

//补发客服-作废
export function UpdateCustomerCancel(data) {
  return request({
    url: `/server/reissue/UpdateCustomerCancel`,
    method: "post",
    data: data,
  });
}

// 获取oss文件上传签名
export function getOssSign() {
  return request({
    url: "/server/files/token_file_reissue",
    method: "get",
  });
}
