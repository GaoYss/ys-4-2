<template>
  <span class="status-badge" :class="status">{{ labels[status] || status }}</span>
</template>

<script setup>
defineProps({ status: { type: String, required: true } });

const labels = {
  unpaid: "未缴",
  partial_paid: "部分缴",
  paid: "已缴",
  overdue: "逾期",
  cancelled: "已作废",
  pending: "待发送",
  sent: "已发送"
};
</script>
