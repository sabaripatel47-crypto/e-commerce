import request from "@/utils/request";

export function recycleinsert(data) {
  return request({
    url: `/server/recycleBin/insert`,
    method: "post",
    data
  });
}

export function getList(query) {
  return request({
    url: `/server/recycleBin/list`,
    method: "post",
    params: query,
  });
}

export function deleteRecycle(ids) {
  return request({
    url: `/server/recycleBin/delete/${ids}`,
    method: "post",
  });
}