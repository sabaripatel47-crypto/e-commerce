import request from "@/utils/request";

// 店铺查询
export function getStoreList(data) {
    return request({
        url: "/server/system_data_permission/store_page",
        method: "post",
        data
    });
}

// 店铺下拉
export function getStoreListSelect() {
    return request({
        url: "/server/store_manage/listPushByManage",
        method: "get"
    });
}