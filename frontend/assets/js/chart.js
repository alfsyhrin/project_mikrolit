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

