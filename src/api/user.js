import request from "@/utils/request.js";

//获取用户列表
export function getUserList() {
  return request({
    url: "/admin/UserList",
    method: "get",
  });
}

//更新用户信息
export function updateUser(data) {
  return request({
    url: "/api/admin/updateUser",
    method: "put",
    data
  });
}

//禁用/启用用户
export function toggleUserStatus(id) {
  return request({
    url: `/api/admin/toggleUserStatus/${id}`,
    method: "post"
  });
}

//获取用户详细信息
export function getUserDetail(id) {
  return request({
    url: `/api/admin/user/${id}`,
    method: "get"
  });
}