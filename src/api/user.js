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
    url: "/admin/UserEdit",
    method: "put",
    data
  });
}

//删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/UserDelete/${id}`,
    method: "delete"
  });
}