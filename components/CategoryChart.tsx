'use client'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface CategoryChartProps {
  data: Array<{
    name: string
    amount: number
    color: string
    percentage: number
  }>
  currency?: string
}

export default function CategoryChart({ data, currency = 'USD' }: CategoryChartProps) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.amount),
        backgroundColor: data.map((item) => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets
            return chart.data.labels.map((label: string, i: number) => ({
              text: `${label} (${data[i].percentage.toFixed(1)}%)`,
              fillStyle: datasets[0].backgroundColor[i],
              hidden: false,
              index: i,
            }))
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const percentage = data[context.dataIndex].percentage
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(value)} (${percentage.toFixed(1)}%)`
          },
        },
      },
    },
    cutout: '65%',
  }

  if (data.length === 0) {
    return (
      <div className='h-64 flex items-center justify-center text-gray-500'>
        <p>No expense data available</p>
      </div>
    )
  }

  return (
    <div className='h-64'>
      <Doughnut
        data={chartData}
        options={options}
      />
    </div>
  )
}
