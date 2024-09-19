import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

function Chart(values) {
    console.log(values.values[0]);
    const labels = values.values.map((_, i) => i+1);

    const data = {
        labels: labels, // X-axis: 1-based index
        datasets: [
        {
            label: 'Values',
            data: values.values, // Y-axis values (your data array)
            fill: false,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            tension: 0.1,
            pointBackgroundColor: 'rgb(255, 255, 255)',
        },
        ],
    };

    const options = {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: '1-Based Index',
            },
            min: 1, // Set minimum value for the X-axis
            max: labels.length, // Set maximum value for the X-axis
            ticks: {
            stepSize: 15, // Set the interval between tick marks
            },
          },
          y: {
            title: {
              display: true,
              text: 'Values',
            },
            min: 0,
            max: 1,
          },
        },
      };
  return (
    <div>
      <Line data={data} options={options}/>
    </div>
  )
}

export default Chart
