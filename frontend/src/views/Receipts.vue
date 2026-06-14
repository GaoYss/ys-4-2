<template>
  <div class="split-layout">
    <section class="panel">
      <div class="panel-head">
        <h2>票据列表</h2>
        <button @click="load">刷新</button>
      </div>
      <DataTable :columns="columns" :rows="payments" @click="noop">
        <template #cell-amount="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
        <template #cell-bill_status="{ row }"><StatusBadge :status="row.bill_status" /></template>
        <template #actions="{ row }">
          <button @click="selected = row">预览</button>
        </template>
      </DataTable>
    </section>

    <section class="receipt-panel">
      <article v-if="selected" class="receipt">
        <header>
          <h2>物业费电子票据</h2>
          <span>{{ selected.receipt_no }}</span>
        </header>
        <dl>
          <div><dt>房屋</dt><dd>{{ selected.room_label }}</dd></div>
          <div><dt>业主</dt><dd>{{ selected.owner_name }}</dd></div>
          <div><dt>费用</dt><dd>{{ selected.period }} {{ selected.fee_name }}</dd></div>
          <div><dt>账单编号</dt><dd>{{ selected.bill_no }}</dd></div>
          <div><dt>应收金额</dt><dd>¥{{ Number(selected.bill_amount).toFixed(2) }}</dd></div>
          <div><dt>已缴金额</dt><dd>¥{{ Number(selected.bill_paid_amount).toFixed(2) }}</dd></div>
          <div><dt>欠费金额</dt><dd class="debt">¥{{ Number(selected.bill_outstanding_amount).toFixed(2) }}</dd></div>
          <div><dt>本次缴费</dt><dd class="highlight">¥{{ Number(selected.amount).toFixed(2) }}</dd></div>
          <div><dt>账单状态</dt><dd><StatusBadge :status="selected.bill_status" /></dd></div>
          <div><dt>支付方式</dt><dd>{{ methodLabel(selected.method) }}</dd></div>
          <div><dt>支付时间</dt><dd>{{ selected.paid_at }}</dd></div>
        </dl>
        <footer>
          <span>收款单位：小区物业服务中心</span>
          <button @click="printReceipt">打印票据</button>
        </footer>
      </article>
      <div v-else class="placeholder">选择一条缴费记录预览票据</div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { propertyApi } from "../api/property";
import DataTable from "../components/DataTable.vue";
import StatusBadge from "../components/StatusBadge.vue";

const payments = ref([]);
const selected = ref(null);
const columns = [
  { key: "receipt_no", label: "票据编号" },
  { key: "bill_no", label: "账单编号" },
  { key: "room_label", label: "房屋" },
  { key: "owner_name", label: "业主" },
  { key: "fee_name", label: "费用" },
  { key: "amount", label: "本次缴费" },
  { key: "bill_status", label: "账单状态" },
  { key: "paid_at", label: "支付时间" }
];

const methodLabels = {
  wechat: "微信",
  alipay: "支付宝",
  bank: "银行卡",
  cash: "现金"
};

function methodLabel(method) {
  return methodLabels[method] || method;
}

async function load() {
  payments.value = await propertyApi.listPayments();
  selected.value = selected.value || payments.value[0] || null;
}

function printReceipt() {
  window.print();
}

function noop() {}

onMounted(load);
</script>

<style scoped>
.debt {
  color: #b42318;
  font-weight: 600;
}

.highlight {
  color: #147050;
  font-weight: 700;
  font-size: 15px;
}
</style>
