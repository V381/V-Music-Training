<template>
    <div class="charts-section">
      <h2>Practice Analytics</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Practice Time by Tool</h3>
          <div id="pieChart" ref="pieChartRef"></div>
        </div>
        <div class="chart-card">
          <h3>Practice Trends</h3>
          <div id="lineChart" ref="lineChartRef"></div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePracticeStore } from '../../stores/practice'
import * as d3 from 'd3'

const practiceStore = usePracticeStore()
const pieChartRef = ref(null)
const lineChartRef = ref(null)

const createPieChart = (data) => {
  const width = 300
  const height = 300
  const radius = Math.min(width, height) / 2

  // Clear previous chart
  d3.select('#pieChart').selectAll('*').remove()

  const svg = d3.select('#pieChart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  const color = d3.scaleOrdinal(d3.schemeCategory10)

  const pie = d3.pie()
    .value(d => d.value)

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

  const arcs = svg.selectAll('arc')
    .data(pie(data))
    .enter()
    .append('g')

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')

  // Add labels
  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => d.data.name)
}

const createLineChart = (data) => {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 }
  const width = 500 - margin.left - margin.right
  const height = 300 - margin.top - margin.bottom

  // Clear previous chart
  d3.select('#lineChart').selectAll('*').remove()

  const svg = d3.select('#lineChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.duration)])
    .range([height, 0])

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.duration))

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'white')

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'white')

  // Add the line
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#c41e3a')
    .attr('stroke-width', 2)
    .attr('d', line)
}

const updateCharts = () => {
  const history = practiceStore.practiceHistory

  // Prepare data for pie chart
  const toolData = history.reduce((acc, session) => {
    if (!acc[session.toolName]) {
      acc[session.toolName] = 0
    }
    acc[session.toolName] += session.duration
    return acc
  }, {})

  const pieData = Object.entries(toolData).map(([name, value]) => ({ name, value }))

  // Prepare data for line chart
  const lineData = history
    .sort((a, b) => a.date - b.date)
    .map(session => ({
      date: new Date(session.date),
      duration: session.duration
    }))

  createPieChart(pieData)
  createLineChart(lineData)
}

watch(() => practiceStore.practiceHistory, updateCharts, { deep: true })

onMounted(() => {
  if (practiceStore.practiceHistory.length > 0) {
    updateCharts()
  }
})
</script>

  <style lang="scss" scoped>
  .charts-section {
    margin-top: 40px;
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      margin-bottom: 20px;
      color: #fff;
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .chart-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;

    h3 {
      margin-bottom: 20px;
      color: #fff;
      text-align: center;
    }
  }

  #pieChart, #lineChart {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
