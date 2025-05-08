<template>
  <div class="users-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="search-area">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索用户名或昵称" 
              clearable 
              @clear="handleSearch"
              @keyup.enter="handleSearch">
              <template #suffix>
                <el-icon class="el-input__icon" @click="handleSearch">
                  <el-icon-search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        border
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          align="center"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
        />
        <el-table-column
          prop="nickname"
          label="昵称"
          width="120"
        />
        <el-table-column
          label="头像"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatarUrl || defaultAvatar" />
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          width="120"
        />
        <el-table-column
          prop="createTime"
          label="注册时间"
          width="180"
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          width="180"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="180"
          align="center"
        >
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户信息"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="rules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="头像" prop="avatarUrl">
          <div class="avatar-upload">
            <el-avatar :size="64" :src="editForm.avatarUrl || defaultAvatar" class="preview-avatar" />
            <el-input v-model="editForm.avatarUrl" placeholder="请输入头像URL地址" />
          </div>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search as ElIconSearch } from '@element-plus/icons-vue'
import { getUserList, updateUser, deleteUser } from '../api/user'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 用户列表数据
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')

// 编辑对话框相关
const dialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatarUrl: ''
})

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {

    const response = await getUserList()
    
      userList.value = response.data
      total.value = response.total || response.data.length
  } finally {
    loading.value = false
  }
}

// 编辑用户
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.username = row.username
  editForm.nickname = row.nickname
  editForm.email = row.email
  editForm.phone = row.phone
  editForm.avatarUrl = row.avatarUrl
  dialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const response = await updateUser(editForm)
        
          ElMessage.success('编辑成功')
          dialogVisible.value = false
          // 更新列表
          await fetchUserList()
      } finally {
        loading.value = false
      }
    }
  })
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认要删除用户 ${row.username} 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      // 更新列表
      await fetchUserList()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  width: 250px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-avatar {
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
}
</style> 