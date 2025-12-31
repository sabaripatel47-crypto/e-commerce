import request from "@/utils/request";

// 获取推广数据
export function getPromotionData(data) {
    return request({
        url: "/server/promotion/upload/list",
        method: "post",
        data
    });
}

// 根据uuid删除数据
export function deletePromotionData(uuid) {
    return request({
        url: `/server/promotion/upload/delete/${uuid}`,
        method: "delete",
    });
}

// 获取上传数据等状态
export function getPromotionStatus(uuid) {
    return request({
        url: `/server/promotion/upload/getErpOrderStatus/${uuid}`,
        method: "get",
    });
}

// 平台下拉框
export function getPlatformList() {
    return request({
        url: "/server/promotion/upload/push/platform",
        method: "get",
    })
}

// 店铺下拉框
export function getShopList(platform) {
    return request({
        url: `/server/promotion/upload/push/store/${platform}`,
        method: "get",
    })
}

// 上传类型
export function getUploadType(platform) {
    return request({
        url: `/server/promotion/upload/push/uploadType/${platform}`,
        method: "get",
    })
}

// 推广方式
export function getPromotionType() {
    return request({
        url: `/server/promotion/upload/uploadType`,
        method: "get",
    })
}

// 天猫/京东数据导入
export function uploadPromotionData(data) {
    return request({
        url: "/server/promotion/upload/uploadByMaoPerson",
        method: "post",
        data
    });
}

// 拼多多导入
export function uploadPddData(data) {
    return request({
        url: "/server/promotion/upload/uploadByPdd",
        method: "post",
        data
    });
}

// 京东关系表导入
export function uploadJdRelation(data) {
    return request({
        url: "/server/promotion/upload/uploadByJin",
        method: "post",
        data
    });
}

// 获取上传数据状态
export function getUploadStatus(uuid) {
    return request({
        url: `/server/promotion/upload/getErpOrderStatus/${uuid}`,
        method: "get",
    });
}