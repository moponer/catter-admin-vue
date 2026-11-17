<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('menu.table') }}</h2>
    </div>

    <!-- 搜索区 -->
    <el-card shadow="hover">
      <el-form :inline="true" :model="({} as any)" class="search-form">
        <el-form-item :label="$t('tableDemo.keyword')">
          <el-input :placeholder="$t('tableDemo.keywordPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select :placeholder="$t('common.all')" clearable>
            <el-option :label="$t('tableDemo.published')" value="published" />
            <el-option :label="$t('tableDemo.draft')" value="draft" />
            <el-option :label="$t('tableDemo.archived')" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.dateRange')">
          <el-date-picker type="daterange" :range-separator="$t('common.to')" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">{{ $t('common.search') }}</el-button>
          <el-button>{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="hover" style="margin-top: 16px">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="title" :label="$t('tableDemo.title')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" :label="$t('tableDemo.author')" width="120" />
        <el-table-column prop="category" :label="$t('tableDemo.category')" width="120" />
        <el-table-column prop="status" :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="(statusMap as any)[(row as any).status]?.type || 'info'" size="small">{{ (statusMap as any)[(row as any).status]?.label || (row as any).status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" :label="$t('tableDemo.views')" width="90" align="center" sortable />
        <el-table-column prop="date" :label="$t('common.createTime')" width="170" sortable />
        <el-table-column :label="$t('common.operate')" width="200" align="center" fixed="right">
          <template #default>
            <el-button link type="primary">{{ $t('common.view') }}</el-button>
            <el-button link type="warning">{{ $t('common.edit') }}</el-button>
            <el-button link type="danger">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div>
          <el-button plain size="small">{{ $t('common.batchDelete') }}</el-button>
          <el-button plain size="small">{{ $t('common.export') }}</el-button>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="100"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const statusMap: Record<string, { type: string; label: string }> = {
  published: { type: 'success', label: $t('tableDemo.published') },
  draft: { type: 'warning', label: $t('tableDemo.draft') },
  archived: { type: 'info', label: $t('tableDemo.archived') },
}

const tableData = ref([
  { id: 1, title: 'Vue 3 组合式 API 完全指南', author: '张三', category: '前端开发', status: 'published', views: 1234, date: '2024-04-20 14:30' },
  { id: 2, title: 'TypeScript 最佳实践总结', author: '李四', category: '编程语言', status: 'draft', views: 567, date: '2024-04-19 09:15' },
  { id: 3, title: 'Element Plus 组件库详解', author: '王五', category: 'UI 框架', status: 'published', views: 2345, date: '2024-04-18 16:45' },
  { id: 4, title: 'Vite 构建工具入门到精通', author: '赵六', category: '构建工具', status: 'published', views: 890, date: '2024-04-17 11:20' },
  { id: 5, title: 'Pinia 状态管理实战', author: '钱七', category: '状态管理', status: 'archived', views: 456, date: '2024-04-15 08:00' },
])
</script>

<style scoped>
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--admin-spacing-lg);
}
</style>
