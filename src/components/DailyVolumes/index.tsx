import { useEffect, useState } from "react";
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title } from 'chart.js';
import bigintLib from "big-integer";
import { formatValue } from "../../helpers/format";

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
      tooltip: {
        callbacks: {
            label: (context: any) => {
                return formatValue(bigintLib(context.parsed.y).toString());
            }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: number) {
            const intValue = value < 1 ? 0 : Number(bigintLib(value).divide(10 ** 18).toString());
            if(intValue < 1000) {
              return `${intValue}`
            } else if(intValue < 1_000_000) {
              return `${Math.round(intValue / 1000)}K`
            } else if(intValue < 1_000_000_000) {
              return `${Math.round(intValue / 1_000_000)}M`
            } else {
              return `${Math.round(intValue / 1_000_000_000)}B`
            }
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
              //  return bigintLib(v.value).toJSNumber()
              return bigintLib(v.value).toString();
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