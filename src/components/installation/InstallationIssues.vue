<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <VCardTitle class="pa-0">Facility Issues</VCardTitle>
      <VBtn color="primary" prepend-icon="tabler-plus" @click="reportIssue">
        Report Issue
      </VBtn>
    </div>
    
    <VTimeline v-if="issues && issues.length > 0" side="end" align="start">
      <VTimelineItem
        v-for="(issue, index) in issues"
        :key="issue.id"
        :dot-color="issue.status === 'resolved' ? 'success' : 'error'"
        size="small"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-start mb-2">
              <div>
                <div class="text-h6 text-primary mb-1">
                  {{ issue.title }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Reported on {{ formatDate(issue.date) }} by {{ issue.reportedBy }}
                </div>
              </div>
              <VChip
                :color="issue.status === 'resolved' ? 'success' : 'error'"
                size="small"
              >
                {{ issue.status === 'resolved' ? 'Resolved' : 'Open' }}
              </VChip>
            </div>
            <p class="text-body-2 mb-2">
              {{ issue.description }}
            </p>
            <div v-if="issue.assignedTo" class="text-caption">
              <strong>Assigned to:</strong> {{ issue.assignedTo }}
            </div>
            <div v-if="issue.resolution" class="text-caption mt-2">
              <strong>Resolution:</strong> {{ issue.resolution }}
            </div>
          </VCardText>
        </VCard>
      </VTimelineItem>
    </VTimeline>
    
    <VAlert
      v-else
      type="info"
      variant="tonal"
    >
      <VAlertTitle>No issues reported</VAlertTitle>
      No issues have been reported for this facility yet.
    </VAlert>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props
const props = defineProps({
  installationId: {
    type: [String, Number],
    required: true
  }
})

// Emits
const emit = defineEmits(['issue-reported', 'issue-resolved'])

// Data
const issues = ref([])

// Methods
const reportIssue = () => {
  console.log('Report issue for installation:', props.installationId)
  emit('issue-reported')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchIssues = async () => {
  // Replace with your API call
  try {
    // const response = await installationService.getInstallationIssues(props.installationId)
    // issues.value = response.data
    
    // Sample data for demonstration
    issues.value = [
      {
        id: 1,
        title: 'Broken HVAC System',
        description: 'The HVAC system in the main storage area is not functioning properly, causing temperature fluctuations.',
        status: 'open',
        date: '2023-10-20',
        reportedBy: 'John Smith',
        assignedTo: 'Maintenance Team',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Leaking Pipe',
        description: 'A pipe in the restroom is leaking and needs immediate attention to prevent water damage.',
        status: 'resolved',
        date: '2023-10-18',
        reportedBy: 'Jane Doe',
        assignedTo: 'Plumbing Team',
        resolution: 'Pipe was replaced on 2023-10-19',
        priority: 'medium'
      }
    ]
  } catch (error) {
    console.error('Error fetching issues:', error)
    issues.value = []
  }
}

// Lifecycle
onMounted(() => {
  fetchIssues()
})
</script>
