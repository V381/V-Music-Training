<!-- components/AssessmentTest.vue -->
<template>
    <div class="assessment-test">
      <div class="test-header">
        <div class="test-info">
          <h3>{{ assessmentStore.assessmentTypes[assessmentType].name }}</h3>
          <div class="question-count">Question {{ currentQuestion + 1 }} of {{ totalQuestions }}</div>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(currentQuestion / totalQuestions) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="question-container">
        <component
          :is="questionComponents[questions[currentQuestion].type]"
          :question="questions[currentQuestion]"
          @answer="handleAnswer"
        />
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'
import { useAssessmentStore } from '../stores/assessments'
import NoteIdentificationQuestion from './questions/NoteIdentificationQuestion.vue'

const props = defineProps({
  assessmentType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['complete'])

const assessmentStore = useAssessmentStore()
const currentQuestion = ref(0)
const score = ref(0)
const totalQuestions = 5 // Set fixed number of questions

// Generate 5 questions of the same type
const questions = computed(() => {
  const questionTemplate = assessmentStore.assessmentTypes[props.assessmentType].questions[0]
  return Array(totalQuestions).fill().map(() => ({
    ...questionTemplate,
    // Add a unique ID to ensure component re-renders
    id: Math.random().toString(36).substr(2, 9)
  }))
})

const questionComponents = {
  noteIdentification: NoteIdentificationQuestion
}

const handleAnswer = async (isCorrect) => {
  if (isCorrect) {
    score.value += questions.value[currentQuestion.value].points
  }

  await assessmentStore.submitAnswer({
    questionType: questions.value[currentQuestion.value].type,
    correct: isCorrect,
    points: isCorrect ? questions.value[currentQuestion.value].points : 0
  })

  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
  } else {
    emit('complete', score.value)
  }
}
</script>

  <style lang="scss" scoped>
  .assessment-test {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
  }

  .test-header {
    margin-bottom: 20px;
  }

  .test-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      color: #fff;
    }

    .question-count {
      color: #9CA3AF;
    }
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: #c41e3a;
      transition: width 0.3s ease;
    }
  }

  .question-container {
    background: rgba(0, 0, 0, 0.2);
    padding: 20px;
    border-radius: 6px;
  }
  </style>
