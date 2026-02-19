function renderChart() {

    const chartContainer = document.querySelector("#progressChart");

    // Jika container tidak ada, jangan jalankan
    if (!chartContainer) return;

    const options = {
        series: [
            { name: "Selesai", data: [85, 72, 60, 45, 30] },
            { name: "Belum", data: [15, 28, 40, 55, 70] }
        ],
        chart: {
            type: "bar",
            height: 350
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            bar: {
                columnWidth: "65%",
                borderRadius: 5,
                borderRadiusApplication: 'end'
            }
            },
            chart: {
            type: "bar",
            height: 350,
            width: "100%",
            toolbar: {
                show: true
            }
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: {
                        width: "100%",
                        height: 300,
                        toolbar: {
                            show: false
                        }
                    }
                }
            }
        ],
        xaxis: {
            categories: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
        },
        yaxis: {
            max: 100
        },
        colors: ["#088395", "#dce4e6"]
    };

    const chart = new ApexCharts(chartContainer, options);
    chart.render();
}

function renderMahasiswaChart() {

    const chartContainer = document.querySelector("#mahasiswaChart");
    if (!chartContainer) return;

    const options = {
        series: [34, 8], // Aktif, Pasif
        chart: {
            type: "donut",
            height: 220
        },
        labels: ["Aktif", "Pasif"],
        colors: ["#088395", "#dce4e6"],
        legend: {
            position: "bottom",
            fontSize: "14px",
            markers: {
                radius: 12
            }
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%"
                }
            }
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                chart: {
                    height: 240
                },
                legend: {
                    position: "bottom"
                }
                }
            }
        ],
        stroke: {
            width: 0
        }
    };

    const chart = new ApexCharts(chartContainer, options);
    chart.render();
}

function renderProgressMingguanChart() {
  const chartContainer = document.querySelector("#progressmingguanChart");
  if (!chartContainer) return;

  const options = {
    series: [
      {
        name: "Penyelesaian",
        data: [25, 40, 55, 48, 65, 72, 68, 80]
      }
    ],
    chart: {
      type: "line",
      height: 300,
      width: "100%",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 800 }
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#088395"]
    },
    markers: {
      size: 5,
      colors: ["#088395"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 7 }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#EBF4F6"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: [
        "M1", "M2", "M3", "M4",
        "M5", "M6", "M7", "M8"
    ],

      labels: {
        style: { colors: "#999", fontSize: "12px" }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: { style: { colors: "#999", fontSize: "12px" } }
    },
    tooltip: {
      theme: "light",
      marker: { show: true },
      x: {
        formatter: function (val, opts) {
          const allLabels = [
            "Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4",
            "Minggu 5", "Minggu 6", "Minggu 7", "Minggu 8"
          ];
          return allLabels[opts.dataPointIndex] || val;
        }
      }
    },
    responsive: [
        {
            breakpoint: 768,
            options: {
            chart: {
                height: 220
            },
            markers: {
                size: 4
            },
            stroke: {
                width: 2
            },
            xaxis: {
                labels: {
                rotate: -45,
                style: {
                    fontSize: "10px"
                }
                }
            },
            yaxis: {
                labels: {
                style: {
                    fontSize: "10px"
                }
                }
            }
            }
        },
        {
            breakpoint: 480,
            options: {
            chart: {
                height: 200
            },
            markers: {
                size: 3
            },
            xaxis: {
                labels: {
                rotate: -30,
                style: {
                    fontSize: "9px"
                }
                }
            }
            }
        }
    ]
  };

  const chart = new ApexCharts(chartContainer, options);
  chart.render();
}


// =============================================
// Chart 2: Kemampuan Literasi (Radar Chart)
// =============================================

// ✅ Hitung ukuran radar secara dinamis berdasarkan lebar container
function getRadarSize(containerWidth) {
  if (containerWidth < 300) return 80;
  if (containerWidth < 400) return 100;
  if (containerWidth < 500) return 120;
  if (containerWidth < 650) return 140;
  return 160;
}

function renderKemampuanLiterasiChart() {
  const chartContainer = document.querySelector("#kemampuanliterasiChart");
  if (!chartContainer) return;

  const containerWidth = chartContainer.offsetWidth || 300;
  const radarSize = getRadarSize(containerWidth);

  const options = {
    series: [
      {
        name: "Rata-rata Kelas",
        data: [65, 60, 55, 50, 55, 62]
      }
    ],
    chart: {
      type: "radar",
      height: 300,
      width: "100%",
      toolbar: { show: false },
      // ✅ Re-render otomatis saat ukuran berubah
      redrawOnParentResize: true,
      redrawOnWindowResize: true
    },
    xaxis: {
      categories: ["Membaca", "Menulis", "Berpikir Kritis", "Kolaborasi", "Digital", "Refleksi"],
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 500,
          colors: ["#071952","#071952","#071952","#071952","#071952","#071952"]
        }
      }
    },
    yaxis: {
      show: true,
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: { style: { colors: "#333", fontSize: "11px" } }
    },
    fill: {
      colors: ["#37B7C3"],
      opacity: 0.4
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#088395"]
    },
    markers: {
      size: 4,
      colors: ["#088395"],
      strokeColors: "#fff",
      strokeWidth: 2
    },
    colors: ["#37B7C3"],
    plotOptions: {
      radar: {
        // ✅ Ukuran dinamis berdasarkan lebar container saat ini
        size: radarSize,
        polygons: {
          strokeColors: "#e0e0e0",
          fill: { colors: ["#f9f9f9", "#fff"] }
        }
      }
    },
    // ✅ Legend "Rata-rata Kelas" sesuai gambar referensi
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 600,
      markers: {
        width: 14,
        height: 14,
        radius: 3,
        fillColors: ["#37B7C3"]
      },
      labels: {
        colors: "#071952"
      },
      itemMargin: {
        horizontal: 10,
        vertical: 8
      }
    },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
    // ✅ Responsive: size polygon ikut mengecil di layar kecil
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: 380 },
          plotOptions: { radar: { size: 130 } },
          xaxis: { labels: { style: { fontSize: "11px" } } }
        }
      },
      {
        breakpoint: 768,
        options: {
          chart: { height: 340 },
          plotOptions: { radar: { size: 110 } },
          xaxis: { labels: { style: { fontSize: "10px" } } }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 300 },
          plotOptions: { radar: { size: 85 } },
          xaxis: { labels: { style: { fontSize: "9px" } } }
        }
      }
    ]
  };

  const radarChart = new ApexCharts(chartContainer, options);
  radarChart.render();

  // ✅ Re-render dengan size baru saat window di-resize
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const newWidth = chartContainer.offsetWidth;
      const newSize = getRadarSize(newWidth);
      radarChart.updateOptions({
        plotOptions: {
          radar: { size: newSize }
        }
      });
    }, 200); // debounce 200ms agar tidak terlalu sering fire
  });
}


