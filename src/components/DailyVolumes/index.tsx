import { useEffect, useState } from "react";
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title } from 'chart.js';
import bigintLib from "big-integer";

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title);


export default function DailyVolumes({ volumes }: { volumes: Array<{ timestamp: number, value: string }> }) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'BUSD Daily Transfer Volumes',
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: number) {
            return `${bigintLib(value < 1 ? 0 : value).toString()}`
          },
          color: "rgba(30, 50, 150, 0.9)"
        }
      }
    }
  };

  useEffect(() => {
    if (volumes && volumes.length > 0) {
      setChartData({
        type: "bar",
        labels: volumes.map(v => (new Date(v.timestamp).toLocaleDateString("fr", { dateStyle: "short" }))),
        datasets: [{
            data: volumes.map(v => {
              return bigintLib(v.value).toJSNumber();
            }),
            backgroundColor: "rgba(191, 219, 254, 0.9)"
        }]
      });
    }
  }, [volumes])

  return (
    <Chart type="bar" options={options} data={chartData} />
  );
}