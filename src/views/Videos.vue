<template>
  <div class="videos-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>视频管理</span>
          <div class="right">
            <el-input
              v-model="query.keyword"
              placeholder="输入标题或描述搜索"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            
            <el-select v-model="query.status" placeholder="状态筛选" clearable @change="fetchVideos">
              <el-option label="全部" value="" />
              <el-option label="正常" :value="1" />
              <el-option label="审核中" :value="2" />
              <el-option label="已下架" :value="3" />
            </el-select>
            
            <el-button @click="fetchVideos" type="primary" size="default" :icon="Refresh">刷新</el-button>
          </div>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="videos" style="width: 100%" border>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="封面" width="120" align="center">
          <template #default="scope">
            <el-image 
              :src="scope.row.coverUrl" 
              :preview-src-list="[scope.row.coverUrl]"
              class="video-cover" 
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="uploaderName" label="上传者" width="120" align="center" />
        <el-table-column prop="category" label="分类" width="100" align="center" />
        <el-table-column prop="views" label="播放量" width="100" align="center" />
        <el-table-column prop="likes" label="点赞数" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button @click="handlePreview(scope.row.id)" type="primary" size="small" :icon="VideoPlay">预览</el-button>
            
            <el-dropdown trigger="click" @command="command => handleCommand(command, scope.row)">
              <el-button type="primary" size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.status === 2" command="approve">通过审核</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 2" command="reject">拒绝审核</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 1" command="disable">下架视频</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 3" command="enable">上架视频</el-dropdown-item>
                  <el-dropdown-item divided command="delete">删除视频</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="30%">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因，将通知用户"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject" :loading="rejectSubmitting">确认拒绝</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, VideoPlay, Search, Picture, ArrowDown } from '@element-plus/icons-vue'
import videoApi from '../api/video'

const router = useRouter()

// 加载状态
const loading = ref(false)

// 视频列表
const videos = ref([])

// 总数
const total = ref(0)

// 查询参数
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: ''
})

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectSubmitting = ref(false)
const rejectForm = reactive({
  id: null,
  reason: ''
})

// 获取视频列表
const fetchVideos = async () => {
  loading.value = true
  try {
    const response = await videoApi.getAllVideos({
      page: query.page,
      size: query.size,
      keyword: query.keyword,
      status: query.status
    })
    videos.value = response.data.videos
    total.value = response.data.total
  } catch (error) {
    console.error('获取视频列表失败', error)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  query.page = 1
  fetchVideos()
}

// 预览视频
const handlePreview = (id) => {
  router.push(`/video-detail/${id}`)
}

// 命令处理
const handleCommand = (command, row) => {
  switch (command) {
    case 'approve':
      handleApprove(row.id)
      break
    case 'reject':
      handleReject(row.id)
      break
    case 'enable':
      handleUpdateStatus(row.id, 1)
      break
    case 'disable':
      handleUpdateStatus(row.id, 3)
      break
    case 'delete':
      handleDelete(row.id)
      break
  }
}

// 审核通过
const handleApprove = async (id) => {
  ElMessageBox.confirm('确认审核通过该视频?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await videoApi.reviewVideo(id, { status: 1 })
      ElMessage.success('审核通过成功')
      fetchVideos()
    } catch (error) {
      console.error('审核通过失败', error)
      ElMessage.error('审核通过失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 拒绝对话框
const handleReject = (id) => {
  rejectForm.id = id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  rejectSubmitting.value = true
  try {
    await videoApi.reviewVideo(rejectForm.id, {
      status: 3,
      rejectReason: rejectForm.reason
    })
    ElMessage.success('已拒绝审核')
    rejectDialogVisible.value = false
    fetchVideos()
  } catch (error) {
    console.error('拒绝审核失败', error)
    ElMessage.error('拒绝审核失败')
  } finally {
    rejectSubmitting.value = false
  }
}

// 更改视频状态
const handleUpdateStatus = async (id, status) => {
  const statusText = status === 1 ? '上架' : '下架'
  ElMessageBox.confirm(`确认${statusText}该视频?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await videoApi.reviewVideo(id, { status })
      ElMessage.success(`${statusText}成功`)
      fetchVideos()
    } catch (error) {
      console.error(`${statusText}失败`, error)
      ElMessage.error(`${statusText}失败`)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 删除视频
const handleDelete = async (id) => {
  ElMessageBox.confirm('确认删除该视频? 删除后不可恢复!', '警告', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      await videoApi.deleteVideo(id)
      ElMessage.success('删除成功')
      fetchVideos()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 分页处理
const handleSizeChange = (size) => {
  query.size = size
  fetchVideos()
}

const handleCurrentChange = (page) => {
  query.page = page
  fetchVideos()
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '处理中',
    1: '正常',
    2: '审核中',
    3: '已下架'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 组件挂载后获取视频列表
onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.videos-container {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 250px;
}

.video-cover {
  width: 100px;
  height: 56px;
  border-radius: 4px;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header .right {
    margin-top: 10px;
    flex-wrap: wrap;
  }
}
</style> 