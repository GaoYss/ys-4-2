<template>
  <div class="page-stack">
    <section class="panel">
      <div class="panel-head">
        <h2>待缴账单</h2>
        <button @click="load">刷新</button>
      </div>
      <DataTable :columns="billColumns" :rows="unpaidBills">
        <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
        <template #cell-amount="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
        <template #cell-paid_amount="{ row }">¥{{ Number(row.paid_amount || 0).toFixed(2) }}</template>
        <template #cell-outstanding_amount="{ row }">
          <strong class="debt">¥{{ Number(row.outstanding_amount || row.amount).toFixed(2) }}</strong>
        </template>
        <template #actions="{ row }">
          <button @click="openPay(row)">缴费</button>
        </template>
      </DataTable>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>缴费记录</h2>
      </div>
      <DataTable :columns="paymentColumns" :rows="payments">
        <template #cell-amount="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
      </DataTable>
    </section>

    <div v-if="payingBill" class="modal-mask" @click.self="payingBill = null">
      <div class="modal">
        <header>
          <h3>缴费</h3>
          <button class="close" @click="payingBill = null">×</button>
        </header>
        <div class="modal-body">
          <div class="info-grid">
            <div><span>账单编号</span><strong>{{ payingBill.bill_no }}</strong></div>
            <div><span>房屋</span><strong>{{ payingBill.room_label }}</strong></div>
            <div><span>业主</span><strong>{{ payingBill.owner_name }}</strong></div>
            <div><span>账期</span><strong>{{ payingBill.period }} {{ payingBill.fee_name }}</strong></div>
            <div><span>应收金额</span><strong>¥{{ Number(payingBill.amount).toFixed(2) }}</strong></div>
            <div><span>已缴金额</span><strong>¥{{ Number(payingBill.paid_amount || 0).toFixed(2) }}</strong></div>
            <div class="full"><span>欠费金额</span><strong class="debt">¥{{ Number(payingBill.outstanding_amount || payingBill.amount).toFixed(2) }}</strong></div>
          </div>
          <label>本次缴费金额
            <input
              v-model.number="payForm.amount"
              type="number"
              min="0.01"
              :step="0.01"
              :max="Number(payingBill.outstanding_amount || payingBill.amount).toFixed(2)"
            />
          </label>
          <label>支付方式
            <select v-model="payForm.method">
              <option value="wechat">微信</option>
              <option value="alipay">支付宝</option>
              <option value="bank">银行卡</option>
              <option value="cash">现金</option>
            </select>
          </label>
          <label>付款人
            <input v-model="payForm.payer" />
          </label>
          <p v-if="payError" class="error">{{ payError }}</p>
        </div>
        <footer>
          <button @click="payingBill = null">取消</button>
          <button class="primary" @click="confirmPay">确认缴费</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { propertyApi } from "../api/property";
import DataTable from "../components/DataTable.vue";
import StatusBadge from "../components/StatusBadge.vue";

const bills = ref([]);
const payments = ref([]);
const payingBill = ref(null);
const payError = ref("");
const payForm = reactive({ amount: 0, method: "wechat", payer: "" });

const unpaidBills = computed(() =>
  bills.value.filter((bill) => ["unpaid", "partial_paid", "overdue"].includes(bill.status))
);

const billColumns = [
  { key: "bill_no", label: "账单编号" },
  { key: "room_label", label: "房屋" },
  { key: "owner_name", label: "业主" },
  { key: "amount", label: "应收" },
  { key: "paid_amount", label: "已缴" },
  { key: "outstanding_amount", label: "欠费" },
  { key: "due_date", label: "截止日期" },
  { key: "status", label: "状态" }
];

const paymentColumns = [
  { key: "receipt_no", label: "票据编号" },
  { key: "bill_no", label: "账单编号" },
  { key: "room_label", label: "房屋" },
  { key: "owner_name", label: "付款人" },
  { key: "amount", label: "金额" },
  { key: "method", label: "方式" },
  { key: "paid_at", label: "支付时间" }
];

async function load() {
  [bills.value, payments.value] = await Promise.all([propertyApi.listBills(), propertyApi.listPayments()]);
}

function openPay(row) {
  payingBill.value = row;
  payError.value = "";
  payForm.amount = Number(row.outstanding_amount || row.amount).toFixed(2);
  payForm.method = "wechat";
  payForm.payer = row.owner_name || "";
}

async function confirmPay() {
  payError.value = "";
  try {
    await propertyApi.payBill(payingBill.value.id, {
      method: payForm.method,
      payer: payForm.payer,
      amount: payForm.amount
    });
    payingBill.value = null;
    await load();
  } catch (err) {
    payError.value = err?.detail || err?.message || "缴费失败，请重试";
  }
}

onMounted(load);
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  border-radius: 10px;
  width: 460px;
  max-width: calc(100vw - 32px);
  overflow: hidden;
}

.modal header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #e6edf2;
}

.modal header h3 {
  margin: 0;
  font-size: 16px;
}

.close {
  background: transparent;
  color: #687684;
  font-size: 22px;
  padding: 0 6px;
  min-height: 28px;
}

.close:hover {
  background: #f1f5f9;
  color: #1f2933;
}

.modal-body {
  padding: 16px 18px;
  display: grid;
  gap: 12px;
}

.modal-body label {
  display: grid;
  gap: 6px;
  color: #52606d;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  padding: 12px;
  background: #f6f8fa;
  border-radius: 8px;
}

.info-grid > div {
  display: grid;
  gap: 4px;
}

.info-grid > div.full {
  grid-column: 1 / -1;
}

.info-grid span {
  color: #687684;
  font-size: 12px;
}

.info-grid strong {
  font-weight: 600;
}

.debt {
  color: #b42318;
}

.error {
  margin: 0;
  color: #b42318;
}

.modal footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid #e6edf2;
}

.modal footer button.primary {
  background: #28a17d;
}

.modal footer button.primary:hover {
  background: #1f8566;
}
</style>
