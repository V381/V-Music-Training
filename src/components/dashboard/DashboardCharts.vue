<template>
  <div class="charts-section">
    <h2>Practice Analytics</h2>
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Practice Distribution by Tool</h3>
        <div id="pieChart" ref="pieChartRef"></div>
      </div>
      <div class="chart-card">
        <h3>Weekly Practice Trends</h3>
        <div id="lineChart" ref="lineChartRef"></div>
      </div>
      <div class="chart-card">
        <h3>Daily Practice Heatmap</h3>
        <div id="heatmapChart" ref="heatmapRef"></div>
      </div>
      <div class="chart-card">
        <h3>Progress by Goal</h3>
        <div id="progressChart" ref="progressRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePracticeStore } from '../../stores/practice'
import { useGoalStore } from '../../stores/goals'
import * as d3 from 'd3'

const practiceStore = usePracticeStore()
const goalStore = useGoalStore()
const pieChartRef = ref(null)
const lineChartRef = ref(null)
const heatmapRef = ref(null)
const progressRef = ref(null)

const createEnhancedPieChart = (data) => {
  const width = 300
  const height = 300
  const radius = Math.min(width, height) / 2

  d3.select('#pieChart').selectAll('*').remove()

  const svg = d3.select('#pieChart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(['#c41e3a', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'])

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null)

  const arc = d3.arc()
    .innerRadius(radius * 0.4)
    .outerRadius(radius * 0.8)

  const arcs = svg.selectAll('path')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc')

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.name))
    .attr('stroke', '#18181B')
    .style('stroke-width', '2px')
    .style('transition', 'all 0.3s')
    .on('mouseover', function () {
      d3.select(this)
        .attr('opacity', 0.8)
        .attr('transform', 'scale(1.05)')
    })
    .on('mouseout', function () {
      d3.select(this)
        .attr('opacity', 1)
        .attr('transform', 'scale(1)')
    })

  const total = d3.sum(data, d => d.value)
  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => `${Math.round((d.data.value / total) * 100)}%`)

  const legend = svg.append('g')
    .attr('transform', `translate(${width / 2 + 10}, ${-height / 2 + 20})`)
    .selectAll('.legend')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`)

  legend.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', d => color(d.name))

  legend.append('text')
    .attr('x', 15)
    .attr('y', 9)
    .attr('font-size', '12px')
    .attr('fill', 'white')
    .text(d => d.name)
}

const createEnhancedLineChart = (data) => {
  const margin = { top: 30, right: 50, bottom: 40, left: 50 }
  const width = 600 - margin.left - margin.right
  const height = 300 - margin.top - margin.bottom

  d3.select('#lineChart').selectAll('*').remove()

  const svg = d3.select('#lineChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'line-gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', height)
    .attr('x2', 0)
    .attr('y2', 0)

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#c41e3a')
    .attr('stop-opacity', 0.1)

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#c41e3a')
    .attr('stop-opacity', 0.8)

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.duration) * 1.2])
    .range([height, 0])

  svg.append('g')
    .attr('class', 'grid')
    .attr('opacity', 0.1)
    .call(d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat(''))

  const line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(d => x(d.date))
    .y(d => y(d.duration))

  const area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(d => x(d.date))
    .y0(height)
    .y1(d => y(d.duration))

  svg.append('path')
    .datum(data)
    .attr('class', 'area')
    .attr('d', area)
    .attr('fill', 'url(#line-gradient)')

  svg.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', '#c41e3a')
    .attr('stroke-width', 3)
    .attr('d', line)

  svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.date))
    .attr('cy', d => y(d.duration))
    .attr('r', 5)
    .attr('fill', '#c41e3a')
    .on('mouseover', function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 8)

      svg.append('text')
        .attr('class', 'tooltip')
        .attr('x', x(d.date))
        .attr('y', y(d.duration) - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(`${d.duration} min`)
    })
    .on('mouseout', function () {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 5)

      svg.selectAll('.tooltip').remove()
    })

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'white')

  svg.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'white')
}

const createHeatmap = (data) => {
  const margin = { top: 30, right: 30, bottom: 40, left: 40 }
  const containerWidth = heatmapRef.value?.clientWidth || 500
  const width = containerWidth - margin.left - margin.right
  const height = 300 - margin.top - margin.bottom

  d3.select('#heatmapChart').selectAll('*').remove()

  const processedData = data.reduce((acc, session) => {
    const date = new Date(session.date)
    const day = date.getDay()
    const hour = date.getHours()
    const key = `${day}-${hour}`

    if (!acc[key]) {
      acc[key] = {
        day,
        hour,
        value: 0
      }
    }
    acc[key].value += session.duration
    return acc
  }, {})

  const heatmapData = Object.values(processedData)

  const svg = d3.select('#heatmapChart')
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = d3.range(24)

  const x = d3.scaleBand()
    .range([0, width])
    .domain(days)
    .padding(0.05)

  const y = d3.scaleBand()
    .range([height, 0])
    .domain(hours)
    .padding(0.05)

  const color = d3.scaleSequential()
    .interpolator(d3.interpolateReds)
    .domain([0, d3.max(heatmapData, d => d.value)])

  svg.selectAll('rect')
    .data(heatmapData)
    .enter()
    .append('rect')
    .attr('x', d => x(days[d.day]))
    .attr('y', d => y(d.hour))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .style('fill', d => color(d.value))
    .style('stroke', '#18181B')
    .style('stroke-width', 1)
    .on('mouseover', function (event, d) {
      d3.select(this)
        .style('stroke', '#fff')
        .style('stroke-width', 2)

      svg.append('text')
        .attr('class', 'tooltip')
        .attr('x', x(days[d.day]) + x.bandwidth() / 2)
        .attr('y', y(d.hour) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(`${d.value}min`)
    })
    .on('mouseout', function () {
      d3.select(this)
        .style('stroke', '#18181B')
        .style('stroke-width', 1)

      svg.selectAll('.tooltip').remove()
    })

  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'white')
    .style('font-size', '12px')

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(y)
      .tickFormat(d => `${d}:00`)
      .tickValues(d3.range(0, 24, 3))) // Show every 3 hours
    .selectAll('text')
    .style('fill', 'white')
    .style('font-size', '12px')
}

const createProgressChart = (goals) => {
  const margin = { top: 30, right: 60, bottom: 40, left: 150 }
  const containerWidth = progressRef.value?.clientWidth || 600
  const width = containerWidth - margin.left - margin.right
  const height = Math.max(200, goals.length * 40) - margin.top - margin.bottom

  d3.select('#progressChart').selectAll('*').remove()

  const svg = d3.select('#progressChart')
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const y = d3.scaleBand()
    .range([0, height])
    .domain(goals.map(d => d.toolName))
    .padding(0.3)

  const x = d3.scaleLinear()
    .range([0, width])
    .domain([0, d3.max(goals, d => d.targetMinutes)])

  svg.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'white')
    .style('font-size', '12px')

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'white')

  const progressBars = svg.selectAll('.progress-bar')
    .data(goals)
    .enter()
    .append('g')
    .attr('class', 'progress-bar')

  // Background bars
  progressBars.append('rect')
    .attr('x', 0)
    .attr('y', d => y(d.toolName))
    .attr('width', d => x(d.targetMinutes))
    .attr('height', y.bandwidth())
    .attr('fill', 'rgba(255, 255, 255, 0.1)')
    .attr('rx', 4)
    .attr('ry', 4)

  // Progress bars
  progressBars.append('rect')
    .attr('x', 0)
    .attr('y', d => y(d.toolName))
    .attr('width', d => x(Math.min(d.progress || 0, d.targetMinutes)))
    .attr('height', y.bandwidth())
    .attr('fill', d => {
      const progress = (d.progress || 0) / d.targetMinutes
      return progress >= 1 ? '#4CAF50' : '#c41e3a'
    })
    .attr('rx', 4)
    .attr('ry', 4)

  // Percentage labels
  progressBars.append('text')
    .attr('x', d => Math.min(x(d.progress || 0), width) + 5)
    .attr('y', d => y(d.toolName) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .style('font-size', '12px')
    .text(d => {
      const progress = (d.progress || 0) / d.targetMinutes * 100
      return `${Math.round(progress)}%`
    })
}

const updateCharts = () => {
  const history = practiceStore.practiceHistory
  const goals = goalStore.goals

  const toolData = history.reduce((acc, session) => {
    if (!acc[session.toolName]) {
      acc[session.toolName] = 0
    }
    acc[session.toolName] += session.duration
    return acc
  }, {})

  const pieData = Object.entries(toolData).map(([name, value]) => ({ name, value }))

  const lineData = history
    .sort((a, b) => a.date - b.date)
    .map(session => ({
      date: new Date(session.date),
      duration: session.duration
    }))

  createEnhancedPieChart(pieData)
  createEnhancedLineChart(lineData)
  createHeatmap(history)
  createProgressChart(goals)
}

watch([
  () => practiceStore.practiceHistory,
  () => goalStore.goals
], updateCharts, { deep: true })

onMounted(() => {
  if (practiceStore.practiceHistory.length > 0) {
    updateCharts()
  }
})
</script>

  <style lang="scss" scoped>

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  min-height: 400px;

  h3 {
    margin-bottom: 20px;
    color: #fff;
    text-align: center;
  }
}

#heatmapChart {
  width: 100%;
  height: 100%;
}

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

  .chart-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  min-height: 300px;

  h3 {
    margin-bottom: 20px;
    color: #fff;
    text-align: center;
  }
}

#progressChart {
  width: 100%;
  height: 100%;
}
  </style>
