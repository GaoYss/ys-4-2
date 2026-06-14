<template>
  <div class="page-stack">
    <section class="panel">
      <div class="panel-head">
        <h2>欠费账单</h2>
        <div class="toolbar">
          <select v-model="channel">
            <option value="sms">短信</option>
            <option value="phone">电话</option>
            <option value="wechat">微信</option>
            <option value="notice">纸质通知</option>
          </select>
          <button @click="createReminders">生成催缴</button>
        </div>
      </div>
      <DataTable :columns="billColumns" :rows="debtBills">
        <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
        <template #cell-amount="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
        <template #cell-paid_amount="{ row }">¥{{ Number(row.paid_amount || 0).toFixed(2) }}</template>
        <template #cell-outstanding_amount="{ row }">
          <strong class="debt">¥{{ Number(row.outstanding_amount != null ? row.outstanding_amount : row.amount - (row.paid_amount || 0)).toFixed(2) }}</strong>
        </template>
      </DataTable>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>催缴记录</h2>
        <button @click="load">刷新</button>
      </div>
      <DataTable :columns="reminderColumns" :rows="reminders">
        <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
        <template #cell-bill_status="{ row }"><StatusBadge :status="row.bill_status" /></template>
        <template #cell-amount="{ row }">
          <strong class="debt">¥{{ Number(row.amount).toFixed(2) }}</strong>
        </template>
      </DataTable>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { propertyApi } from "../api/property";
import DataTable from "../components/DataTable.vue";
import StatusBadge from "../components/StatusBadge.vue";

const bills = ref([]);
const reminders = ref([]);
const channel = ref("sms");
const debtBills = computed(() =>
  bills.value.filter((bill) => ["unpaid", "partial_paid", "overdue"].includes(bill.status))
);
const billColumns = [
  { key: "room_label", label: "房屋" },
  { key: "owner_name", label: "业主" },
  { key: "phone", label: "电话" },
  { key: "fee_name", label: "费用" },
  { key: "amount", label: "应收" },
  { key: "paid_amount", label: "已缴" },
  { key: "outstanding_amount", label: "欠费" },
  { key: "due_date", label: "截止日期" },
  { key: "status", label: "状态" }
];
const reminderColumns = [
  { key: "reminder_no", label: "催缴编号" },
  { key: "room_label", label: "房屋" },
  { key: "owner_name", label: "业主" },
  { key: "channel", label: "渠道" },
  { key: "amount", label: "欠费" },
  { key: "bill_status", label: "账单状态" },
  { key: "message", label: "内容" },
  { key: "status", label: "发送状态" }
];

async function load() {
  [bills.value, reminders.value] = await Promise.all([propertyApi.listBills(), propertyApi.listReminders()]);
}

async function createReminders() {
  await propertyApi.createOverdueReminders({ channel: channel.value });
  await load();
}

onMounted(load);
</script>

<style scoped>
.debt {
  color: #b42318;
}
</style>
