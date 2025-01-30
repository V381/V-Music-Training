<template>
    <div class="learning-paths">
      <h2>Learning Paths</h2>

      <div v-if="!learningPathsStore.currentPath" class="path-selection">
        <div
          v-for="(path, pathId) in learningPathsStore.paths"
          :key="pathId"
          class="path-card"
          @click="selectPath(pathId)"
        >
          <h3>{{ path.name }}</h3>
          <p>{{ path.description }}</p>
          <button class="btn primary">Start Path</button>
        </div>
      </div>

      <div v-else class="current-path">
        <h3>{{ currentPathData.name }}</h3>
        <div class="stages">
          <div
            v-for="stage in currentPathData.stages"
            :key="stage.id"
            class="stage-card"
            :class="{
              'completed': isStageCompleted(stage.id),
              'current': isCurrentStage(stage.id)
            }"
          >
            <h4>{{ stage.name }}</h4>
            <p>{{ stage.description }}</p>

            <div class="tools">
              <div v-for="tool in stage.tools" :key="tool.name" class="tool">
                <h5>{{ tool.name }}</h5>
                <p>Required practice: {{ tool.minimumPracticeTime }} minutes</p>
                <ul>
                  <li v-for="req in tool.requirements" :key="req">{{ req }}</li>
                </ul>
              </div>
            </div>

            <button
              v-if="isCurrentStage(stage.id) && !isStageCompleted(stage.id)"
              class="btn primary"
              @click="completeStage(stage.id)"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { computed } from 'vue'
import { useLearningPathsStore } from '../stores/learningPaths'

const learningPathsStore = useLearningPathsStore()

const currentPathData = computed(() =>
  learningPathsStore.paths[learningPathsStore.currentPath]
)

const selectPath = (pathId) => {
  learningPathsStore.selectPath(pathId)
}

const isStageCompleted = (stageId) => {
  return learningPathsStore.userProgress.completedStages.includes(stageId)
}

const isCurrentStage = (stageId) => {
  return learningPathsStore.userProgress.currentStage === stageId
}

const completeStage = async (stageId) => {
  await learningPathsStore.completeStage(stageId)
}
</script>

  <style lang="scss" scoped>
  .learning-paths {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      margin-bottom: 20px;
      color: #fff;
    }
  }

  .path-selection {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .path-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    h3 {
      color: #c41e3a;
      margin-bottom: 10px;
    }

    p {
      color: #D1D5DB;
      margin-bottom: 15px;
    }
  }

  .stages {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .stage-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #4B5563;

    &.completed {
      border-left-color: #4CAF50;
    }

    &.current {
      border-left-color: #c41e3a;
    }

    h4 {
      color: #fff;
      margin-bottom: 10px;
    }

    .tools {
      margin: 15px 0;

      .tool {
        background: rgba(0, 0, 0, 0.2);
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 10px;

        h5 {
          color: #c41e3a;
          margin-bottom: 8px;
        }

        ul {
          margin-top: 8px;
          padding-left: 20px;
          color: #D1D5DB;
        }
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
