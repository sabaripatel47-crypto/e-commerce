import request from "@/utils/request";

// 查询列表
export function getTableList(data) {
    return request({
        url: '/server/smartManagement/config/list',
        method: 'post',
        data
    });
}

// 分类状态下拉
export function getCateList() {
    return request({
        url: '/server/smartManagement/config/cate_status',
        method: 'get'
    });
}

// 停用
export function stop(data) {
    return request({
        url: '/server/smartManagement/config/isOff',
        method: 'post',
        data
    });
}


// 编辑类型
export function editType(data) {
    return request({
        url: '/server/smartManagement/config/update',
        method: 'post',
        data
    });
}

// 关键词下拉
export function getKeywordList(keyword) {
    return request({
        url: `/server/smartManagement/config/push/${keyword}`,
        method: 'get'
    });
}

// 新增
export function add(data) {
    return request({
        url: '/server/smartManagement/config/add',
        method: 'post',
        data
    });
}


// 导出
export function exportExcel(data) {
    return request({
        url: '/server/smartManagement/config/export',
        method: 'post',
        data,
        responseType: 'blob'
    });
}