document.addEventListener('DOMContentLoaded', () => {
    let articles = [];
    let currentIndex = 0;

    let countdownInterval;
    const targetDate = new Date(2024, 10, 5, 12, 0, 0);
    const timeElements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    function updateCountdown() {
        const now = new Date();
        const difference = targetDate - now;
        if (difference < 0) {
            // إذا انتهى الوقت
            clearInterval(countdownInterval);
            Object.values(timeElements).forEach(element => element.textContent = '0');
            return;
        }
        // حساب الوحدات الزمنية
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // تحديث العرض
        timeElements.days.textContent = days;
        timeElements.hours.textContent = hours;
        timeElements.minutes.textContent = minutes;
        timeElements.seconds.textContent = seconds;
    }

    // بدء العد التنازلي
    function startCountdown() {
        updateCountdown(); // تحديث فوري
        countdownInterval = setInterval(updateCountdown, 1000); // تحديث كل ثانية
    }

    // تشغيل العداد عند تحميل الصفحة
    startCountdown();
});


// Month translation object
const monthTranslations = {
    "January": "يناير",
    "February": "فبراير",
    "March": "مارس",
    "April": "أبريل",
    "May": "مايو",
    "June": "يونيو",
    "July": "يوليو",
    "August": "أغسطس",
    "September": "سبتمبر",
    "October": "أكتوبر",
    "November": "نوفمبر",
    "December": "ديسمبر"
  };
  
  // Topic translation object
  const topicTranslations = {
    "Election Integrity": "نزاهة الانتخابات",
    "Economy": "الاقتصاد",
    "Foreign Policy": "السياسة الخارجية",
    "Social Issues": "القضايا الاجتماعية",
    "Immigration": "الهجرة",
    "Healthcare": "الرعاية الصحية",
    "Charisma": "الشخصية",
    "Environment": "البيئة"
  };
  
  // Define a variable to store the previous filtered data
  let previousFilteredData = [];
  
  // Function to translate month names
  function translateMonth(month) {
    return monthTranslations[month] || month; // Fallback to the original month if not found
  }
  
  // Function to translate topic names
  function translateTopic(topic) {
    return topicTranslations[topic] || topic; // Fallback to the original topic if not found
  }
  
  // Initialize date inputs when the page is loaded
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('startDate').value = '2024-01-01';
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('endDate').value = formattedDate;
    loadDataAndFilter(); // Load initial data
  });
  
  // Set up the event listener for the apply button
  window.onload = function() {
    document.querySelector('.apply-btn').addEventListener('click', loadDataAndFilter);
  };
  
  // Initialize a socket connection
  const socket = io('http://localhost:5000');
  
  // Set up a listener for initial data if required
  socket.on('initialPolarityData', (data) => {
    updateDataAndFilter(data);
  });
  
  // Set up a listener for real-time updates
  socket.on('polarityDataUpdated', (change) => {
    console.log('Real-time data update received:', change);
    loadDataAndFilter(); // Fetch the latest data from the server
  });
  
  // Function to load data and apply filters
  function loadDataAndFilter() {
    fetch('http://localhost:5000/api/polaritydata')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        updateDataAndFilter(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  // Function to update data and apply filters
  function updateDataAndFilter(data) {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
  
    // Filter data based on the date range
    const filteredData = data.filter(element => {
      const publishDate = new Date(element.publish_date);
      return (!startDate || publishDate >= startDate) &&
             (!endDate || publishDate <= endDate);
    });
  
    // Check if the filtered data has changed
    if (JSON.stringify(filteredData) !== JSON.stringify(previousFilteredData)) {
      // Apply the functions only if the data has changed
      getFirstDataSet(filteredData);
      getResultChartDataSet(filteredData);
      getTopicsWithNumbersDataSet(filteredData);
      getTopicsCountPerMonth(filteredData);
  
      // Update previousFilteredData to the latest filtered data
      previousFilteredData = filteredData;
    }
  }
  
  // Optionally, load initial data when the page loads
  loadDataAndFilter();
  
  function getFirstDataSet(filteredData) {
      // Count occurrences of each topic
      const topicCounts = {};
      filteredData.forEach(element => {
          const topic = element.topic;
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
  
      // Calculate total count for percentage calculation
      const totalCount = filteredData.length;
  
      // Generate results with count and percentage for each unique topic
      const topicArray = Object.keys(topicCounts).map(topic => {
          const count = topicCounts[topic];
          const percent = ((count / totalCount) * 100).toFixed(2);
          return { topic, count, percent };
      });
  
      document.getElementById('percent1').innerHTML = (topicArray?.find(x => x.topic == 'Election Integrity')?.percent ?? 0) + '%';
      document.getElementById('count1').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Election Integrity')?.count ?? 0) + ')';
  
      document.getElementById('percent2').innerHTML = (topicArray?.find(x => x.topic == 'Charisma')?.percent ?? 0) + '%';
      document.getElementById('count2').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Charisma')?.count ?? 0) + ')';
  
      document.getElementById('percent3').innerHTML = (topicArray?.find(x => x.topic == 'Economy')?.percent ?? 0) + '%';
      document.getElementById('count3').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Economy')?.count ?? 0) + ')';
  
      document.getElementById('percent4').innerHTML = (topicArray?.find(x => x.topic == 'Foreign Policy')?.percent ?? 0) + '%';
      document.getElementById('count4').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Foreign Policy')?.count ?? 0) + ')';
  
      document.getElementById('percent5').innerHTML = (topicArray?.find(x => x.topic == 'Social Issues')?.percent ?? 0) + '%';
      document.getElementById('count5').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Social Issues')?.count ?? 0) + ')';
  
      document.getElementById('percent6').innerHTML = (topicArray?.find(x => x.topic == 'Immigration')?.percent ?? 0) + '%';
      document.getElementById('count6').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Immigration')?.count ?? 0) + ')';
  
      document.getElementById('percent7').innerHTML = (topicArray?.find(x => x.topic == 'Healthcare')?.percent ?? 0) + '%';
      document.getElementById('count7').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Healthcare')?.count ?? 0) + ')';
  
      document.getElementById('percent8').innerHTML = (topicArray?.find(x => x.topic == 'Environment')?.percent ?? 0) + '%';
      document.getElementById('count8').innerHTML = '(' + (topicArray?.find(x => x.topic == 'Environment')?.count ?? 0) + ')';
  
  }
  
  function getResultChartDataSet(filteredData) {
      var TrampPositive = filteredData.filter(x => x.Trump === 'Good').length;
      var TrampNegative = filteredData.filter(x => x.Trump === 'Bad').length;
      var HarrisPositive = filteredData.filter(x => x.Harris === 'Good').length;
      var HarrisNegative = filteredData.filter(x => x.Harris === 'Bad').length;
  
      var TrampResult = ((TrampPositive + HarrisNegative) / (TrampPositive + TrampNegative + HarrisPositive + HarrisNegative)) * 100;
      var HarrisResult = ((HarrisPositive + TrampNegative) / (TrampPositive + TrampNegative + HarrisPositive + HarrisNegative)) * 100;
  
      const ctx = document.getElementById('myDonutChart').getContext('2d');
  
  
          // Chart.register(ChartDataLabels);
  
  
      if (ctx.chart) {
          ctx.chart.destroy();
      }
          const chart = new Chart(ctx, {
              type: 'doughnut',
              data: {
                  datasets: [{
                      data: [TrampResult, HarrisResult],
                      backgroundColor: ['#bb3131', '#1f4b99'],
                      borderWidth: 0
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                      plugins: {
                          datalabels: {
                              color: '#fff',
                              font: {
                                  size: 16,
                                  weight: 'bold'
                              },
                              formatter: (value) => {
                                  const percentage = value.toFixed(2) + '%';
                                  return `${percentage}`;
                              },
                              anchor: 'center',
                              align: 'right',
                              offset: 30,
  
                          },
  
                  },
  
  
              },
              plugins: [ChartDataLabels]
          });
  
      ctx.chart = chart;
  }
  
  
  function getTopicsWithNumbersDataSet(filteredData) {
      // Create an array to store sentiments for each topic
      const sentimentArray = {};
  
      // Initialize sentiment counts for each topic
      filteredData.forEach(element => {
          const topic = element.topic;
          // Initialize if not already present
          if (!sentimentArray[topic]) {
              sentimentArray[topic] = {
                  Trump: { Positive: 0, Negative: 0, Neutral: 0 },
                  Harris: { Positive: 0, Negative: 0, Neutral: 0 }
              };
          }
  
          // Count sentiments for Trump
          if (element.Trump === 'Good') {
              sentimentArray[topic].Trump.Positive += 1;
          } else if (element.Trump === 'Bad') {
              sentimentArray[topic].Trump.Negative += 1;
          } else {
              sentimentArray[topic].Trump.Neutral += 1; // Assuming there's a neutral case
          }
  
          // Count sentiments for Harris
          if (element.Harris === 'Good') {
              sentimentArray[topic].Harris.Positive += 1;
          } else if (element.Harris === 'Bad') {
              sentimentArray[topic].Harris.Negative += 1;
          } else {
              sentimentArray[topic].Harris.Neutral += 1; // Assuming there's a neutral case
          }
      });
  
      // Convert sentiment counts to percentages
      const finalSentimentArray = Object.keys(sentimentArray).map(topic => {
          const trumpCounts = sentimentArray[topic].Trump;
          const harrisCounts = sentimentArray[topic].Harris;
  
          const totalTrump = trumpCounts.Positive + trumpCounts.Negative + trumpCounts.Neutral;
          const totalHarris = harrisCounts.Positive + harrisCounts.Negative + harrisCounts.Neutral;
  
          // Calculate percentages for Trump
          const trumpPercentages = [
              totalTrump ? ((trumpCounts.Negative / totalTrump) * 100).toFixed(2) : '0%', // Negative
              totalTrump ? ((trumpCounts.Neutral / totalTrump) * 100).toFixed(2) : '0%',  // Neutral
              totalTrump ? ((trumpCounts.Positive / totalTrump) * 100).toFixed(2) : '0%'   // Positive
          ];
  
          // Calculate percentages for Harris
          const harrisPercentages = [
              totalHarris ? ((harrisCounts.Negative / totalHarris) * 100).toFixed(2) : '0%', // Negative
              totalHarris ? ((harrisCounts.Neutral / totalHarris) * 100).toFixed(2) : '0%',  // Neutral
              totalHarris ? ((harrisCounts.Positive / totalHarris) * 100).toFixed(2) : '0%'   // Positive
          ];
  
          return {
              topic: topic,
              Trump: trumpPercentages,
              Harris: harrisPercentages
          };
      });
  
  
      const chartDataArray = [
          {
              id: 'myHorizontalBarChart',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Election Integrity').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart2',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Charisma').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart3',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Economy').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart4',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Foreign Policy').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart5',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Social Issues').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart6',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Immigration').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart7',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Healthcare').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart8',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Environment').map(x => x.Harris)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart0',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Election Integrity').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart20',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Charisma').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart30',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Economy').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart40',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Foreign Policy').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart50',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Social Issues').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart60',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Immigration').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart70',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Healthcare').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
          {
              id: 'myHorizontalBarChart80',
              labels: ['طبيعي', 'سلبي', 'ايجابي'],
              data: finalSentimentArray.filter(x => x.topic == 'Environment').map(x => x.Trump)[0],
              backgroundColor: ['#afafaf', '#bb3131', '#00a1ab']
          },
  
  
      ];
  
      // Loop through the array to create charts
      chartDataArray.forEach(createHorizontalBarChart);
  }
  
  // Function to create charts
  function createHorizontalBarChart(chartConfig) {
      const ctx = document.getElementById(chartConfig.id).getContext('2d');
  
      // Check if there is an existing chart
      if (ctx.chart) {
          ctx.chart.destroy(); // Destroy the existing chart instance
      }
  
      ctx.chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: chartConfig.labels,
              datasets: [{
                  data: chartConfig.data,
                  backgroundColor: chartConfig.backgroundColor,
                  borderWidth: 1,
                  borderSkipped: false,
                  barPercentage: .7,
                  categoryPercentage: 1
              }]
          },
          options: {
              indexAxis: 'y', // Makes the chart horizontal
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: {
                      beginAtZero: true,
                      max: 100, // Set to 100 for percentage scale
                      reverse: true, // This makes the chart go from right to left
                      position: 'bottom', // Moves the X-axis to the bottom of the chart
                      ticks: {
                          callback: function (value) {
                              return value + '%'; // Add percentage sign to ticks
                          },
                          padding: 10, // Adds spacing between the bars and labels
                          font: {
                              family: 'Arial',
                              size: 12,
                              weight: 'bold' // Makes the font bold
                          }
                      },
                      grid: {
                          display: false // Hides the grid lines for the x-axis
                      }
                  },
                  y: {
                      beginAtZero: true,
                      reverse: true, // Reverses order of categories for RTL display
                      position: 'right', // Moves Y-axis labels to the right side of the chart
                      ticks: {
                          padding: 10, // Adds spacing between the bars and labels
                          font: {
                              family: 'Arial',
                              size: 15,
                              weight: 'bold' // Makes the font bold
                          }
                      },
                      grid: {
                          display: false // Hides the grid lines for the y-axis
                      }
                  }
              },
              plugins: {
                  legend: {
                      display: false // Hides the legend
                  },
                  tooltip: {
                      callbacks: {
                          label: function (context) {
                              return context.raw + '%';
                          }
                      }
                  }
              }
          }
      });
  }
  
  function getTopicsCountPerMonth(filteredData) {
      // كائن لحفظ عدد المواضيع حسب الشهر
      const monthlyNewsCounts = {};
  
      // هيكل البيانات وتجميع المواضيع حسب الشهر
      filteredData.forEach(element => {
          const publishDate = new Date(element.publish_date);
          const month = publishDate.getMonth() + 1; // الحصول على الشهر كرقم (1-12)
          const year = publishDate.getFullYear();
          const monthYear = `${year}-${month.toString().padStart(2, '0')}`; // صيغة YYYY-MM للترتيب الصحيح
          const topic = element.topic;
  
          if (!monthlyNewsCounts[topic]) {
              monthlyNewsCounts[topic] = {};
          }
  
          if (!monthlyNewsCounts[topic][monthYear]) {
              monthlyNewsCounts[topic][monthYear] = 0;
          }
  
          monthlyNewsCounts[topic][monthYear] += 1;
      });
  
  
      // الحصول على الأشهر الفريدة مرتبة بشكل صحيح
      const uniqueMonths = Array.from(new Set(filteredData.map(element => {
          const publishDate = new Date(element.publish_date);
          const month = publishDate.getMonth() + 1;
          const year = publishDate.getFullYear();
          return `${year}-${month.toString().padStart(2, '0')}`; // YYYY-MM للترتيب السليم
      }))).sort().reverse();
  
      // ترجمة الأشهر
      const translatedMonths = uniqueMonths.map(monthYear => {
          const [year, month] = monthYear.split('-');
          const monthName = new Date(year, month - 1).toLocaleString('en', { month: 'long' });
          return `${monthTranslations[monthName]} ${year}`;
      });
  
      const datasets = Object.keys(monthlyNewsCounts).map(topic => {
          const data = uniqueMonths.map(month => monthlyNewsCounts[topic][month] || 0);
          const color = getRandomColor(); // Get random color for borders
  
          return {
              label: translateTopic(topic),
              data: data,
              fill: true, // Enable fill under the line
              borderColor: color, // Border color
              backgroundColor: getTransparentColor(color, 0.2), // Background color with transparency
              tension: 0.3
          };
      });
  
      // إنشاء الرسم البياني
      const ctx = document.getElementById('myLineChart').getContext('2d');
      if (ctx.chart) {
          ctx.chart.destroy(); // تدمير الرسم البياني القديم
      }
  
      ctx.chart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: translatedMonths,
              datasets: datasets
          },
          options: {
              responsive: true,
              maintainAspectRatio: false, // Allow the chart to fill the container
              plugins: {
                  legend: {
                      position: 'top',
                  },
                  title: {
                      display: true,
  
                  }
              },
              scales: {
                  x: {
                      display: true,
                      ticks: {
                          font: {
                              size: 14,
  
                          },
                          align: 'center',
                      },
                      reverse: true
                  },
                  y: {
                      display: true,
                      ticks: {
                          font: {
                              size: 14,
                          }
                      }
                  }
              }
          }
      });
  }
  
  // Function to generate a random RGB color
  function getRandomColor() {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, 1)`; // Full opacity for border
  }
  
  // Function to generate a transparent color based on the base color
  function getTransparentColor(color, opacity) {
      // Extract the RGB values and return a new rgba string with the desired opacity
      const rgbaMatch = color.match(/rgba?\((\d+), (\d+), (\d+)(?:, (\d+\.?\d*))?\)/);
      if (rgbaMatch) {
          return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
      }
      return color; // Fallback to original color if it doesn't match
  }
  