<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">My Profile</h1>
      <p class="text-body-1 text-medium-emphasis">
        Manage your personal information and job credentials.
      </p>
    </div>

    <!-- Collapsible Sections -->
    <VExpansionPanels multiple class="profile-panels" elevation="1">
      
      <!-- About Me -->
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <VIcon icon="tabler-user" class="me-2" /> About Me
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <p class="text-body-1">
            Passionate software developer with 5+ years of experience building modern web applications...
          </p>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- Work Experience -->
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <VIcon icon="tabler-briefcase" class="me-2" /> Work Experience
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VTimeline>
            <VTimelineItem
              v-for="(job, index) in workExperience"
              :key="index"
              :dot-color="'primary'"
              size="small"
            >
              <div class="text-body-1 font-weight-medium">{{ job.title }} at {{ job.company }}</div>
              <div class="text-caption text-medium-emphasis">{{ job.duration }}</div>
              <div class="text-body-2 mt-1">{{ job.description }}</div>
            </VTimelineItem>
          </VTimeline>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- Education -->
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <VIcon icon="tabler-school" class="me-2" /> Education
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VTimeline>
            <VTimelineItem
              v-for="(edu, index) in education"
              :key="index"
              :dot-color="'info'"
              size="small"
            >
              <div class="text-body-1 font-weight-medium">{{ edu.institution }}</div>
              <div class="text-caption text-medium-emphasis">{{ edu.degree }} ({{ edu.year }})</div>
            </VTimelineItem>
          </VTimeline>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- Skills -->
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <VIcon icon="tabler-star" class="me-2" /> Skills
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VChipGroup column>
            <VChip
              v-for="(skill, index) in skills"
              :key="index"
              color="primary"
              class="ma-1"
            >
              {{ skill }}
            </VChip>
          </VChipGroup>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- Languages -->
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <VIcon icon="tabler-language" class="me-2" /> Languages
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <ul class="pa-0">
            <li
              v-for="(lang, index) in languages"
              :key="index"
              class="text-body-1 mb-1"
            >
              <VIcon icon="tabler-message" size="18" class="me-2" />
              {{ lang.name }} - <span class="text-medium-emphasis">{{ lang.level }}</span>
            </li>
          </ul>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- Resume Upload -->
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <VIcon icon="tabler-file" class="me-2" /> Resume
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div>
              <p class="mb-2 text-body-1">Current Resume:</p>
              <VChip color="success" variant="tonal">resume.pdf</VChip>
            </div>
            <VBtn variant="outlined" color="primary">
              <VIcon icon="tabler-upload" class="me-1" />
              Upload New Resume
            </VBtn>
          </div>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Dummy data
const workExperience = ref([
  {
    title: 'Frontend Developer',
    company: 'TechCorp',
    duration: '2021 - Present',
    description: 'Developed Vue-based interfaces and improved performance by 35%',
  },
  {
    title: 'UI Designer',
    company: 'SoftPlus',
    duration: '2019 - 2021',
    description: 'Designed responsive UIs and built component libraries',
  },
])

const education = ref([
  {
    institution: 'University of Lagos',
    degree: 'BSc. Computer Science',
    year: '2018',
  },
])

const skills = ref(['Vue.js', 'JavaScript', 'SCSS', 'REST API', 'UI/UX', 'Figma'])

const languages = ref([
  { name: 'English', level: 'Fluent' },
  { name: 'French', level: 'Intermediate' },
])
</script>

<style scoped>
.profile-panels {
  border-radius: 12px;
  background-color: #fff;
}
</style>
