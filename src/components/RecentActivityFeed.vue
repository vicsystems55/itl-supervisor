<script setup>
// Recent activity messages list
import { VIcon } from "vuetify/components";

const messages = [
  {
    id: 1,
    icon: "tabler-message-circle",
    color: "primary",
    title: "New message from Alice",
    body: "Can you review the shipment details for project X?",
    time: "2m ago",
  },
  {
    id: 2,
    icon: "tabler-check",
    color: "success",
    title: "Delivery completed",
    body: "Delivery #JH-234 has been marked completed by the driver.",
    time: "30m ago",
  },
  {
    id: 3,
    icon: "tabler-alert-circle",
    color: "warning",
    title: "Maintenance required",
    body: "Generator in Warehouse 5 requires oil change.",
    time: "3h ago",
  },
  {
    id: 4,
    icon: "tabler-user-plus",
    color: "info",
    title: "New technician added",
    body: "Technician John Doe was added to Team B.",
    time: "1d ago",
  },
];
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard outlined>
        <VCardTitle class="text-h6">Recent Activity</VCardTitle>
        <VCardText>
          <ul class="recent-activity-list">
            <li v-for="msg in messages" :key="msg.id" class="recent-item">
              <div class="icon-wrap">
                <VIcon :icon="msg.icon" :color="msg.color" size="20" />
              </div>
              <div class="content">
                <div class="title">{{ msg.title }}</div>
                <div class="body text-secondary">{{ msg.body }}</div>
              </div>
              <div class="time text-muted">{{ msg.time }}</div>
            </li>
          </ul>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.recent-activity-list {
  padding: 0;
  margin: 0;
  list-style: none;

  .recent-item {
    display: flex;
    align-items: center;
    border-block-end: 1px solid rgba(var(--v-border-color), 0.06);
    gap: 0.75rem;
    padding-block: 0.75rem;
    padding-inline: 0.5rem;
  }

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: rgba(var(--v-theme-on-surface), 0.03);
    inline-size: 2.25rem;
  }

  .content {
    flex: 1 1 auto;
  }

  .title {
    font-weight: 600;
  }

  .body {
    font-size: 0.875rem;
  }

  .time {
    margin-inline-start: 1rem;
    white-space: nowrap;
  }
}
</style>
