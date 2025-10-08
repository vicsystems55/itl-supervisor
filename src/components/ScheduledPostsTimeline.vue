<script setup>
import { VIcon } from 'vuetify/components'

// Example post data
import banner1 from '@/assets/images/banner/banner-1.jpg'
import banner2 from '@/assets/images/banner/banner-2.jpg'
import banner3 from '@/assets/images/banner/banner-3.jpg'

const scheduledPosts = [
  {
    id: 1,
    platform: 'Instagram',
    platformIcon: 'tabler-brand-instagram',
    color: '#E1306C',
    title: 'Summer Vibes Campaign',
    image: banner1,
    date: '2025-09-24',
    time: '10:30 AM',
  },
  {
    id: 2,
    platform: 'Facebook',
    platformIcon: 'tabler-brand-facebook',
    color: '#1877F2',
    title: 'Product Launch Announcement',
    image: banner2,
    date: '2025-09-25',
    time: '2:00 PM',
  },
  {
    id: 3,
    platform: 'YouTube',
    platformIcon: 'tabler-brand-youtube',
    color: '#FF0000',
    title: 'Tutorial Premiere',
    image: banner3,
    date: '2025-09-27',
    time: '6:00 PM',
  },
]

// fake preview handler
const handleClick = post => {
  alert(`Previewing: ${post.title}`)
}
</script>

<template>
  <VCard title="Scheduled Posts Timeline">
    <VCardText>
      <VTimeline
        side="end"
        align="start"
        line-inset="8"
        truncate-line="start"
        density="compact"
      >
        <VTimelineItem
          v-for="post in scheduledPosts"
          :key="post.id"
          size="x-small"
          :dot-color="post.color"
        >
          <!-- Whole item as a clickable card -->
          <VCard
            class="pa-3 mb-2 timeline-card"
            outlined
            rounded="lg"
            hover
            @click="handleClick(post)"
          >
            <!-- Header -->
            <div class="d-flex justify-space-between align-center flex-wrap mb-2">
              <div class="d-flex align-center">
                <VIcon :icon="post.platformIcon" :color="post.color" size="20" />
                <span class="ms-2" :style="{ color: post.color, fontWeight: '500' }">
                  {{ post.platform }}
                </span>
              </div>
              <span class="app-timeline-meta">
                {{ post.date }} • {{ post.time }}
              </span>
            </div>

            <!-- Content -->
            <div class="d-flex align-center">
              <VAvatar
                size="52"
                class="me-3"
                rounded="lg"
                :image="post.image"
              />
              <div class="d-flex flex-column">
                <span class="text-body-1 font-weight-medium">
                  {{ post.title }}
                </span>
              </div>
            </div>
          </VCard>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>

<style scoped>
.app-timeline-meta {
  font-size: 0.8rem;
  color: var(--v-theme-on-surface-variant);
}

.timeline-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--v-theme-shadow-3);
}
</style>
