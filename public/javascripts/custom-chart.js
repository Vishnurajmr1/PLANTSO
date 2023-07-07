(function ($) {
  "use strict";

  if ($("#chartLine").length) {
    var ctx = document.getElementById("chartLine").getContext("2d");
    var chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Revenue",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(44, 120, 220, 0.2)",
            borderColor: "rgba(44, 120, 220)",
            data: [],
          },

          {
            label: "Products",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(380, 200, 230, 0.2)",
            borderColor: "rgb(380, 200, 230)",
            data: [],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      },
    });

    $.ajax({
      url: "/admin/graph",
      method: "GET",
      success: function (data) {
        if (data.success) {
          console.log(data);
          //graph one
          chart.data.labels = data.labels;
          chart.data.datasets[0].data = data.sales;
          chart.data.datasets[1].data = data.products;

          chart.update();
        } else {
          console.log("Error: " + data.message);
        }
      },
      error: function (error) {
        console.log("Error fetching data:", error);
      },
    });
  }

  // 2nd chart
  if ($("#chartBar").length) {
    var ctx = document.getElementById("chartBar");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Total orders",
            backgroundColor: "#5897fb",
            barThickness: 10,
            data: [],
          },
          {
            label: "Total Stocks",
            backgroundColor: "#7bcf86",
            barThickness: 10,
            data: [],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    $.ajax({
      url: "/admin/chart",
      method: "GET",
      success: function (res) {
        if (res.success) {
          console.log(res);
          myChart.data.labels = res.labels;
          myChart.data.datasets[0].data = res.data;
          myChart.data.datasets[1].data = res.stocks;
          myChart.update();
        } else {
          console.log("Error: " + data.message);
        }
      },
      error: function (error) {
        console.log("Error fetching data:", error);
      },
    });
  }
})(jQuery);
