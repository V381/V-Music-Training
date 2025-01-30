<template>
    <div class="assessment-center">
      <h2>Skill Assessments</h2>

      <div v-if="!assessmentStore.currentAssessment" class="assessment-types">
        <div
          v-for="(assessment, type) in assessmentStore.assessmentTypes"
          :key="type"
          class="assessment-card"
        >
          <h3>{{ assessment.name }}</h3>
          <p>{{ assessment.description }}</p>
          <div class="assessment-stats" v-if="getLastScore(type)">
            <p>Last Score: {{ getLastScore(type) }}%</p>
            <p>Last Attempt: {{ formatDate(getLastAttempt(type)) }}</p>
          </div>
          <button
            class="btn primary"
            @click="startAssessment(type)"
          >
            Start Assessment
          </button>
        </div>
      </div>

      <AssessmentTest
        v-else
        :assessment-type="assessmentStore.currentAssessment.type"
        @complete="handleAssessmentComplete"
      />
    </div>
  </template>

<script setup>
import { onMounted } from 'vue'
import { useAssessmentStore } from '../stores/assessments'
import AssessmentTest from './AssessmentTest.vue'

const assessmentStore = useAssessmentStore()

onMounted(() => {
  assessmentStore.fetchAssessmentHistory()
})

const startAssessment = async (type) => {
  await assessmentStore.startAssessment(type)
}

const getLastScore = (type) => {
  const lastAssessment = assessmentStore.assessmentHistory
    .filter(a => a.type === type && a.completed)
    .sort((a, b) => b.startTime - a.startTime)[0]
  return lastAssessment ? Math.round((lastAssessment.score / lastAssessment.maxScore) * 100) : null
}

const getLastAttempt = (type) => {
  const lastAssessment = assessmentStore.assessmentHistory
    .filter(a => a.type === type && a.completed)
    .sort((a, b) => b.startTime - a.startTime)[0]
  return lastAssessment ? lastAssessment.endTime : null
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const handleAssessmentComplete = async (score) => {
  await assessmentStore.completeAssessment(score)
}
</script>

  <style lang="scss" scoped>
  .assessment-center {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 40px;

    h2 {
      margin-bottom: 20px;
      color: #fff;
    }
  }

  .assessment-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .assessment-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;

    h3 {
      color: #c41e3a;
      margin-bottom: 10px;
    }

    p {
      color: #D1D5DB;
      margin-bottom: 15px;
    }

    .assessment-stats {
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 15px;

      p {
        margin-bottom: 5px;
        font-size: 0.9em;
      }
    }
  }

  .btn {
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    border: none;

    &.primary {
      background: #c41e3a;
      color: white;

      &:hover {
        background: darken(#c41e3a, 10%);
      }
    }
  }
  </style>
