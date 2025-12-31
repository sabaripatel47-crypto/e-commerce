import request from "@/utils/request";

// 获取账号列表
export function getAccountList(data) {
    return request({
        url: "/server/store_password/page",
        method: "post",
        data
    });
}

// 新增账号密码
export function addAccount(data) {
    return request({
        url: "/server/store_password/add",
        method: "post",
        data
    });
}

// 修改账号密码
export function editAccount(data) {
    return request({
        url: "/server/store_password/update",
        method: "post",
        data
    });
}

// 店铺下拉
export function getStoreList() {
    return request({
        url: "/server/store_manage/listPushByManage",
        method: "get"
    });
}

// 是否抓取切换
export function changeStatus(data) {
    return request({
        url: "/server/store_password/is_grab",
        method: "post",
        data: data
    });
}

// 机器id下拉框
export function getMachineList() {
    return request({
        url: "/server/store_password/push/machineId",
        method: "get"
    });
}