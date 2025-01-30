<template>
    <div class="note-identification">
        <div class="clef-selector">
          <button
            @click="switchClef('treble')"
            :class="{ active: currentClef === 'treble' }"
          >
            Treble Clef
          </button>
          <button
            @click="switchClef('bass')"
            :class="{ active: currentClef === 'bass' }"
          >
            Bass Clef
          </button>
        </div>
      <div class="staff-container">
        <!-- Clef selection -->

        <div class="staff">
          <div v-for="line in 5" :key="`line-${line}`" class="staff-line"></div>

          <span class="clef">
            {{ currentClef === 'treble' ? '𝄞' : '𝄢' }}
          </span>

          <div
            class="note"
            :style="{
              bottom: `${getNotePosition(currentNote)}px`,
              left: '120px'
            }"
          >
            <div class="note-head"></div>
            <div class="note-stem"></div>
            <div
              v-for="line in calculateLedgerLines(currentNote)"
              :key="`ledger-${line}`"
              class="ledger-line"
              :style="{
                bottom: getLedgerLinePosition(line, currentNote)
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="answer-options">
        <button
          v-for="option in currentClefNotes"
          :key="option"
          class="answer-btn"
          @click="checkAnswer(option)"
        >
          {{ option }}
        </button>
      </div>

      <div v-if="feedback" :class="['feedback', feedbackType]">
        {{ feedback }}
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue'

defineProps({
  question: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['answer'])

const notes = {
  trebleClef: [
    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
    'C5', 'D5', 'E5', 'F5', 'G5'
  ],
  bassClef: [
    'G2', 'A2', 'B2',
    'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
    'C4'
  ]
}

const currentClef = ref('treble')
const currentNote = ref('')
const feedback = ref('')
const feedbackType = ref('')

const currentClefNotes = computed(() => notes[`${currentClef.value}Clef`])

const getNotePosition = (note) => {
  const positions = {
    treble: {
      // From bottom to top, each step is 10px (half a space)
      E4: 0, // First line
      G4: 20, // Second line
      B4: 40, // Third line
      D5: 60, // Fourth line
      F5: 80, // Fifth line

      // Spaces (bottom to top)
      F4: 10, // First space between first and second lines
      A4: 30, // Second space
      C5: 50, // Third space
      E5: 70, // Fourth space
      G5: 90, // Space above the staff

      // Below staff
      C4: -20, // Ledger line
      D4: -10 // Space below first line
    },
    bass: {
      // From bottom to top
      G2: -10, // Second ledger line below staff
      A2: 0, // Space below first line
      B2: 10, // First line
      C3: 20, // Space between 1st and 2nd lines
      D3: 30, // Second line
      E3: 40, // Space between 2nd and 3rd lines
      F3: 50, // Third line
      G3: 60, // Space between 3rd and 4th lines
      A3: 70, // Fourth line
      B3: 80, // Space between 4th and 5th lines
      C4: 90 // Fifth line
    }
  }

  return positions[currentClef.value][note] || 0
}

const calculateLedgerLines = (note) => {
  const ledgerLineNotes = {
    treble: {
      below: ['C4'],
      above: ['G5']
    },
    bass: {
      below: ['G2'],
      above: ['C4']
    }
  }

  const currentLedgerLines = ledgerLineNotes[currentClef.value]

  if (currentLedgerLines.below.includes(note)) {
    return ['below']
  } else if (currentLedgerLines.above.includes(note)) {
    return ['above']
  }
  return []
}

const getLedgerLinePosition = (line, note) => {
  const positions = {
    treble: {
      below: -10, // For C4
      above: 100 // For G5
    },
    bass: {
      below: -10, // For G2
      above: 90 // For C4
    }
  }
  return `${positions[currentClef.value][line]}px`
}

const switchClef = (clef) => {
  currentClef.value = clef
  generateQuestion()
}

const generateQuestion = () => {
  const clefNotes = notes[`${currentClef.value}Clef`]
  const noteIndex = Math.floor(Math.random() * clefNotes.length)
  currentNote.value = clefNotes[noteIndex]
}

const checkAnswer = (answer) => {
  const isCorrect = answer === currentNote.value
  feedback.value = isCorrect ? 'Correct!' : `Incorrect. The correct answer was ${currentNote.value}`
  feedbackType.value = isCorrect ? 'correct' : 'incorrect'

  setTimeout(() => {
    feedback.value = ''
    feedbackType.value = ''
    generateQuestion()
    emits('answer', isCorrect)
  }, 1500)
}

// Initialize component
onMounted(() => {
  generateQuestion()
})
</script>

  <style lang="scss" scoped>
  .note-identification {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .staff-container {
    width: 100%;
    max-width: 400px;
    height: 300px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .staff {
    width: 100%;
    height: 120px;
    position: relative;
  }

  .staff-line {
    width: 100%;
    height: 2px;
    background-color: #fff;
    position: absolute;

    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        bottom: #{($i - 1) * 20}px;
      }
    }
  }

  .clef {
  position: absolute;
  left: 20px;
  bottom:5px;
  font-size: 80px;
  color: #fff;
  line-height: 1;
}

  .note {
    position: absolute;
    width: 20px;
    height: 40px;

    .note-head {
      width: 16px;
      height: 12px;
      background-color: #fff;
      border-radius: 50%;
      position: absolute;
      bottom: 0;
    }

    .note-stem {
      width: 2px;
      height: 40px;
      background-color: #fff;
      position: absolute;
      bottom: 8px;
      right: 2px;
    }
  }

  .ledger-line {
    position: absolute;
    width: 20px;
    height: 2px;
    background-color: #fff;
    left: -2px;
  }

  .answer-options {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 800px;
    overflow-y: auto;
    padding: 10px;
  }

  .answer-btn {
    padding: 10px;
    border: none;
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 14px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  .feedback {
    padding: 10px 20px;
    border-radius: 6px;
    text-align: center;

    &.correct {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }

    &.incorrect {
      background-color: rgba(196, 30, 58, 0.2);
      color: #c41e3a;
    }
  }

  // Make it scrollable on mobile
  @media (max-width: 768px) {
    .answer-options {
      grid-template-columns: repeat(4, 1fr);
      max-height: 200px;
    }
  }

  .clef-selector {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;

  button {
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: transparent;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: #c41e3a;
      border-color: #c41e3a;
    }

    &:hover {
      background: rgba(196, 30, 58, 0.2);
    }
  }
}
  </style>
