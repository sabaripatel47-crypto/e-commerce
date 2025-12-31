
import request from "@/utils/request";

// 获取erp订单数据
export function getErpOrderData(data) {
    return request({
        url: "/server/smartManagement/list",
        method: "post",
        data
    });
}

// 上传慧经营数据
export function uploadErpOrderData(data) {
    return request({
        url: "/server/smartManagement/upload",
        method: "post",
        data
    });
}

// 获取上传数据状态
export function getUploadDataStatus(uuid) {
    return request({
        url: `/server/smartManagement/getStatus/${uuid}`,
        method: "get",
    });
}

// 删除数据
export function deleteData(uuid) {
    return request({
        url: `/server/smartManagement/delete/${uuid}`,
        method: "delete",
    });
}

// 获取最新上传时间
export function getUploadTime() {
    return request({
        url: "/server/smartManagement/getDeliveryTime",
        method: "get",
    });
}