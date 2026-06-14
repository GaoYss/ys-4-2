<template>
  <div class="page-stack">
    <section class="stats-grid">
      <StatCard label="楼栋/房屋" :value="`${stats.building_count || 0} / ${stats.room_count || 0}`" />
      <StatCard label="应收金额" :value="money(stats.receivable_total)" />
      <StatCard label="实收金额" :value="money(stats.paid_total)" />
      <StatCard label="欠费金额" :value="money(stats.unpaid_total)" />
    </section>

    <section class="status-grid">
      <div class="status-item unpaid"><span>未缴</span><strong>{{ stats.status_counts?.unpaid || 0 }}</strong></div>
      <div class="status-item partial_paid"><span>部分缴</span><strong>{{ stats.status_counts?.partial_paid || 0 }}</strong></div>
      <div class="status-item paid"><span>已缴</span><strong>{{ stats.status_counts?.paid || 0 }}</strong></div>
      <div class="status-item overdue"><span>逾期</span><strong>{{ stats.status_counts?.overdue || 0 }}</strong></div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>近期账单</h2>
        <button @click="load">刷新</button>
      </div>
      <DataTable :columns="columns" :rows="stats.recent_bills || []">
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-amount="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
        <template #cell-paid_amount="{ row }">¥{{ Number(row.paid_amount || 0).toFixed(2) }}</template>
        <template #cell-outstanding_amount="{ row }">
          ¥{{ Number(row.outstanding_amount != null ? row.outstanding_amount : row.amount - (row.paid_amount || 0)).toFixed(2) }}
        </template>
      </DataTable>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { propertyApi } from "../api/property";
import DataTable from "../components/DataTable.vue";
import StatCard from "../components/StatCard.vue";
import StatusBadge from "../components/StatusBadge.vue";

const stats = ref({});
const columns = [
  { key: "bill_no", label: "账单编号" },
  { key: "room_label", label: "房屋" },
  { key: "owner_name", label: "业主" },
  { key: "fee_name", label: "费用" },
  { key: "period", label: "账期" },
  { key: "amount", label: "应收" },
  { key: "paid_amount", label: "已缴" },
  { key: "outstanding_amount", label: "欠费" },
  { key: "status", label: "状态" }
];

function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

async function load() {
  stats.value = await propertyApi.dashboard();
}

onMounted(load);
</script>

<style scoped>
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}

.status-item {
  background: #fff;
  border: 1px solid #dce3ea;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 4px solid #cbd5df;
}

.status-item span {
  color: #52606d;
}

.status-item strong {
  font-size: 20px;
}

.status-item.unpaid {
  border-left-color: #f5b301;
}

.status-item.partial_paid {
  border-left-color: #3e79dd;
}

.status-item.paid {
  border-left-color: #28a17d;
}

.status-item.overdue {
  border-left-color: #d92d20;
}
</style>
