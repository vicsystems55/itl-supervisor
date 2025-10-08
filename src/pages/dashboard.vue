<template>
  <div>
    <!-- Header -->
    <h1 class="text-h5 font-weight-bold mb-6">Welcome back 👋</h1>

    <VRow class="mb-6">
      <VCol
        v-for="(data, index) in jobStats"
        :key="index"
        cols="12"
        md="4"
        sm="6"
      >
        <VCard
          class="logistics-card-statistics cursor-pointer"
          :style="
            data.isHover
              ? `border-block-end-color: rgb(var(--v-theme-${data.color}))`
              : `border-block-end-color: rgba(var(--v-theme-${data.color}),0.38)`
          "
          @mouseenter="data.isHover = true"
          @mouseleave="data.isHover = false"
        >
          <VCardText>
            <div class="d-flex align-center gap-x-4 mb-1">
              <VAvatar variant="tonal" :color="data.color" rounded>
                <VIcon :icon="data.icon" size="28" />
              </VAvatar>
              <h4 class="text-h4">
                {{ data.value }}
              </h4>
            </div>
            <div class="text-body-1 mb-1">
              {{ data.title }}
            </div>
            <div class="d-flex gap-x-2 align-center">
              <h6 class="text-h6">
                {{ data.change > 0 ? "+" : "" }}{{ data.change }}%
              </h6>
              <div class="text-sm text-disabled">than last week</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Resume Status & Profile Completion -->
    <VRow class="mb-6" dense>
      <!-- Profile Completion -->
      <VCol cols="12" md="6" class="d-flex">
        <VCard class="w-100 d-flex flex-column">
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-2">
              <VCardTitle>Profile Completion</VCardTitle>
              <div class="text-caption text-warning">10%</div>
            </div>
            <VProgressLinear
              :model-value="10"
              color="warning"
              height="20"
              rounded
              striped
            />

            <VCardText>
              Complete your profile to get better job matches and visibility.
            </VCardText>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Resume or Info Card -->
      <VCol cols="12" md="6" class="d-flex">
        <VCard
          class="w-100 d-flex flex-column"
          bgColor="bg-red"
          textColor="white"
        >
          <div class="d-flex flex-column-reverse flex-md-row flex-grow-1">
            <div class="flex-grow-1">
              <VCardItem>
                <VCardTitle>Resume Status</VCardTitle>
              </VCardItem>

              <VCardText class="d-flex align-center flex-wrap text-body-1">
                <VRating
                  :model-value="5"
                  readonly
                  class="me-3"
                  density="compact"
                />
                <span>5 Star | 98 reviews</span>
              </VCardText>

              <VCardText>
                Before there was a United States of America, there were coffee
                houses, because how are you supposed to build.
              </VCardText>

              <VCardActions>
                <VBtn>Update Resume</VBtn>
              </VCardActions>
            </div>

            <div class="ma-auto pa-5">
              <VImg :width="176" :src="pages5" class="rounded" />
            </div>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Mid Section: Interviews & Recommendations -->
    <VRow class="mb-6" dense>
      <VCol cols="12" md="12">
        <VCard title="Upcoming Interviews">
          <VCardText>
            <ul class="pl-4">
              <li>Acme Inc – Aug 2, 10:00 AM</li>
              <li>Globex – Aug 5, 1:00 PM</li>
            </ul>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Bottom Section: Activity & Messages -->
    <VRow dense>
      <!-- Activity Timeline -->
      <VCol cols="12" md="">
        <VCard>
          <VCardItem>
            <template #prepend>
              <VIcon
                icon="tabler-list-details"
                size="24"
                color="high-emphasis"
                class="me-1"
              />
            </template>

            <VCardTitle>Activity Timeline</VCardTitle>

            <template #append>
              <div class="me-n2">
                <MoreBtn :menu-list="moreList" />
              </div>
            </template>
          </VCardItem>

          <VCardText>
            <VTimeline
              side="end"
              align="start"
              line-inset="8"
              truncate-line="start"
              density="compact"
            >
              <!-- Timeline Item 1 -->
              <VTimelineItem dot-color="primary" size="x-small">
                <div
                  class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2"
                >
                  <span class="app-timeline-title"
                    >12 Invoices have been paid</span
                  >
                  <span class="app-timeline-meta">12 min ago</span>
                </div>
                <div class="app-timeline-text mt-1">
                  Invoices have been paid to the company
                </div>
                <div class="d-inline-flex align-center timeline-chip mt-2">
                  <img :src="pdf" height="20" class="me-2" alt="img" />
                  <span class="app-timeline-text font-weight-medium"
                    >invoice.pdf</span
                  >
                </div>
              </VTimelineItem>

              <!-- Timeline Item 2 -->
              <VTimelineItem dot-color="success" size="x-small">
                <div
                  class="d-flex justify-space-between align-center flex-wrap mb-2"
                >
                  <span class="app-timeline-title">Client Meeting</span>
                  <span class="app-timeline-meta">45 min ago</span>
                </div>
                <div class="app-timeline-text mt-1">
                  Project meeting with john @10:15am
                </div>
                <div class="d-flex align-center mt-2">
                  <VAvatar size="32" class="me-2" :image="avatar1" />
                  <div>
                    <p
                      class="text-sm font-weight-medium text-medium-emphasis mb-0"
                    >
                      Lester McCarthy (Client)
                    </p>
                    <span class="text-sm">CEO of Pixinvent</span>
                  </div>
                </div>
              </VTimelineItem>

              <!-- Timeline Item 3 -->
              <VTimelineItem dot-color="info" size="x-small">
                <div
                  class="d-flex justify-space-between align-center flex-wrap mb-2"
                >
                  <span class="app-timeline-title"
                    >Create a new project for client</span
                  >
                  <span class="app-timeline-meta">2 days ago</span>
                </div>
                <p class="app-timeline-text mt-1 mb-2">
                  6 team members in a project
                </p>
                <div class="v-avatar-group demo-avatar-group">
                  <VAvatar :size="40">
                    <VImg :src="avatar1" />
                    <VTooltip activator="parent" location="top"
                      >John Doe</VTooltip
                    >
                  </VAvatar>
                  <VAvatar :size="40">
                    <VImg :src="avatar2" />
                    <VTooltip activator="parent" location="top"
                      >Jennie Obrien</VTooltip
                    >
                  </VAvatar>
                  <VAvatar :size="40">
                    <VImg :src="avatar3" />
                    <VTooltip activator="parent" location="top"
                      >Peter Harper</VTooltip
                    >
                  </VAvatar>
                  <VAvatar
                    :size="40"
                    :color="$vuetify.theme.current.dark ? '#373b50' : '#eeedf0'"
                  >
                    +3
                  </VAvatar>
                </div>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
   <VCard class="mb-6">
    <VCardTitle class="text-h5 px-4 pt-4">Recommended Jobs</VCardTitle>
    <VCardText>
      <VList lines="two" class="px-2">
        <VListItem
          v-for="job in jobs"
          :key="job.id"
          class="job-card mb-4"
          :class="job.bgColor"
          rounded
          
           :style="`background-color: ${job.bgColor};`"
        
        >
          <div class="d-flex flex-column flex-md-row justify-space-between align-start w-100 text-white " style="min-height: 160px;">
            <!-- Text Content -->
            <div class="pe-md-4 flex-grow-1">
              <div class="d-flex align-center justify-space-between mb-1">
                <div class="text-h6 font-weight-medium text-white">{{ job.title }}</div>
                <div class="text-caption text-disabled text-white">{{ job.postedAt }}</div>
              </div>
              <div class="text-body-2 mb-2 text-medium-emphasis text-white">
                {{ job.description }}
              </div>

              <!-- Location & Type -->
              <div class="d-flex align-center gap-4 text-sm mb-2">
                <div class="d-flex align-center gap-1">
                  <VIcon icon="tabler-map-pin" size="18" />
                  <span>{{ job.location }}</span>
                </div>
                <div class="d-flex align-center gap-1">
                  <VIcon icon="tabler-briefcase" size="18" />
                  <span>{{ job.type }}</span>
                </div>
              </div>

              <!-- Recruiter Info -->
              <div class="d-flex align-center gap-3 mt-2">
                <VAvatar :image="job.recruiter.logo" size="32" />
                <div>
                  <div class="text-sm font-weight-medium">{{ job.recruiter.name }}</div>
                  <div class="d-flex align-center">
                    <VRating
                      :model-value="job.rating"
                      length="4"
                      clearable='true'
                      readonly
                      density="default"
                      size="30"
                    />
                    <span class="text-caption ms-1">({{ job.rating }})</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Job Image -->
            <VImg
              :src="job.image"
              height="100"
              width="140"
              class="rounded mt-3 mt-md-0"
              cover
            />
          </div>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { h } from "vue";
import { VIcon } from "vuetify/components";

import avatar1 from "@images/avatars/avatar-1.png";
import avatar2 from "@images/avatars/avatar-2.png";
import avatar3 from "@images/avatars/avatar-3.png";
import pdf from "@images/icons/project-icons/pdf.png";
import pages5 from "@images/pages/5.jpg";
import { ref } from "vue";
import jobImage1 from "@images/ad1.png";
import jobImage2 from "@images/ad2.png";
import jobImage3 from "@images/ad3.png";
import recruiterLogo from "@images/avatars/avatar-1.png";

const jobs = ref([
  {
    id: 1,
    title: "Frontend Developer",
    description:
      "Work on exciting web projects using Vue.js and modern tooling.",
    location: "Remote",
    type: "Full-Time",
    postedAt: "3 hours ago",
    rating: 4.8,
    recruiter: {
      name: "TechBridge Inc.",
      logo: recruiterLogo,
    },
    image: jobImage1,
    bgColor: "red",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    description: "Design user interfaces and experiences for mobile apps.",
    location: "Lagos, Nigeria",
    type: "Contract",
    postedAt: "1 day ago",
    rating: 4.5,
    recruiter: {
      name: "Designify Studio",
      logo: recruiterLogo,
    },
    image: jobImage2,
    bgColor: "#151546",
  },
  {
    id: 3,
    title: "Backend Engineer",
    description: "Build scalable APIs and manage backend infrastructure.",
    location: "Hybrid",
    type: "Part-Time",
    postedAt: "5 days ago",
    rating: 4.9,
    recruiter: {
      name: "DataCore Labs",
      logo: recruiterLogo,
    },
    image: jobImage3,
    bgColor: "#151006",
  },
]);

const moreList = [
  { title: "Refresh", value: "refresh" },
  { title: "Download", value: "download" },
  { title: "View All", value: "view_all" },
];

const profileCompletion = ref(75); // Set this to any dynamic value
// Stats
const stats = [
  { title: "Total Applied", count: 18, icon: "tabler-send" },
  { title: "Total Submitted", count: 12, icon: "tabler-upload" },
  { title: "Scheduled Interviews", count: 3, icon: "tabler-calendar-event" },
];

const jobStats = ref([
  {
    icon: "tabler-send",
    color: "primary",
    title: "Total Applied",
    value: 18,
    change: 5.6,
    isHover: false,
  },
  {
    icon: "tabler-upload",
    color: "success",
    title: "Total Submitted",
    value: 12,
    change: 3.2,
    isHover: false,
  },
  {
    icon: "tabler-calendar-event",
    color: "info",
    title: "Scheduled Interviews",
    value: 3,
    change: -1.1,
    isHover: false,
  },
]);
</script>

<style scoped lang="scss">
@use "@core/scss/base/mixins" as mixins;

.logistics-card-statistics {
  border-block-end-style: solid;
  border-block-end-width: 2px;

  &:hover {
    border-block-end-width: 3px;
    margin-block-end: -1px;

    @include mixins.elevation(8);

    transition: all 0.1s ease-out;
  }
}

.skin--bordered {
  .logistics-card-statistics {
    border-block-end-width: 2px;

    &:hover {
      border-block-end-width: 3px;
      margin-block-end: -2px;
      transition: all 0.1s ease-out;
    }
  }
}

.job-card {
  border-radius: 12px;
  padding: 16px;
  transition: box-shadow 0.2s ease-in-out;
}

.job-card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}
</style>
