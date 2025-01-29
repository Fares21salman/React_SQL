import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faFilePdf,
  faPaperclip,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { faFileExcel } from "@fortawesome/free-regular-svg-icons";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
} from "chart.js";
import "./MainContent.css";
// Register the necessary components for Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale
);

const MainContent = ({ selectedExecution, setSelectedExecution }) => {
  const [executionData, setExecutionData] = useState([]);
  const [showFileOptions, setShowFileOptions] = useState(false);

  // Fetch execution data from API
  useEffect(() => {
    fetch("http://localhost:5004/executions")
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Check the structure of the fetched data
        setExecutionData(data);
      })
      .catch((err) => console.error("Error fetching data: ", err));
  }, []);

  // Handle file downloads
  const handleFileDownload = (fileType) => {
    if (selectedExecution) {
      if (fileType === "pdf") {
        const doc = new jsPDF();
        doc.text(`Name: ${selectedExecution.Name}`, 10, 10);
        doc.text(`Status: ${selectedExecution.Status}`, 10, 20);
        doc.text(`Start Time: ${selectedExecution.StartTime}`, 10, 30);
        doc.text(`End Time: ${selectedExecution.EndTime}`, 10, 40);
        doc.save(`${selectedExecution.Name}.pdf`);
      } else if (fileType === "excel") {
        const ws = XLSX.utils.json_to_sheet([selectedExecution]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Executions");
        XLSX.writeFile(wb, `${selectedExecution.Name}.xlsx`);
      }
    }
  };

  // New bar chart data for passes, fails, and incompletes
  const passFailIncompleteData = {
    labels: executionData.map((exec) => exec.Name),
    datasets: [
      {
        label: "Passed",
        data: executionData.map((exec) => exec.PassedCount),
        backgroundColor: "#2ecc71",
      },
      {
        label: "Failed",
        data: executionData.map((exec) => exec.FailedCount),
        backgroundColor: "#e74c3c",
      },
      {
        label: "Incomplete",
        data: executionData.map((exec) => exec.IncompleteCount),
        backgroundColor: "#f1c40f",
      },
    ],
  };

  // Count Passed, Failed, and Incomplete executions
  const passedCount = executionData.filter(
    (exec) => exec.Status === "Passed"
  ).length;
  const failedCount = executionData.filter(
    (exec) => exec.Status === "Failed"
  ).length;
  const incompleteCount = executionData.filter(
    (exec) => exec.Status === "Incomplete"
  ).length;

  const barData = {
    labels: executionData.map((exec) => exec.Name),
    datasets: [
      {
        label: "Execution Time (in minutes)",
        data: executionData.map(
          (exec) => (new Date(exec.EndTime) - new Date(exec.StartTime)) / 60000
        ),
        backgroundColor: "#3498db",
      },
    ],
  };

  const executionChartData = {
    labels: ["Passed", "Failed", "Incomplete"],
    datasets: [
      {
        label: "Execution Status",
        data: [
          selectedExecution?.PassedCount || 0, // Safely access PassedCount
          selectedExecution?.FailedCount || 0, // Safely access FailedCount
          selectedExecution?.IncompleteCount || 0, // Safely access IncompleteCount
        ],
        backgroundColor: ["#2ecc71", "#e74c3c", "#f1c40f"],
      },
    ],
  };

  const tableData_1 = executionData.map((exec) => ({
    ExecutionID: exec.ExecutionID,
    TestCaseCount: exec.TestCaseCount || 0,
    TestCaseName: exec.Name,
    PassPercentage: ((exec.PassedCount / exec.TestCaseCount) * 100).toFixed(2),
    Failed: exec.FailedCount,
    Incomplete: exec.IncompleteCount,
    Status: exec.Status,
    Start_Time: exec.StartTime,
    End_Time: exec.EndTime,
  }));

  const column_1 = [
    { name: "ExecutionID", label: "ID", options: { display: "excluded" } },
    {
      name: "TestCaseCount",
      label: "Test Case Count",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "TestCaseName",
      label: "Test Case Name",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "PassPercentage",
      label: "Pass Percentage",
      options: {
        customBodyRender: (value) => {
          const percentage = Math.max(0, Math.min(100, Number(value)));
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                {percentage}%
              </span>
              <div
                style={{
                  width: "100px", // Fixed width for uniformity
                  backgroundColor: "whitesmoke",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "8px",
                    backgroundColor: "#2ecc71", // Green for pass
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        },
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
    {
      name: "Failed",
      label: "Failed",
      options: {
        customBodyRender: (value, tableMeta) => {
          const total = tableMeta.rowData[1]; // Assuming `TestCaseCount` is the second column
          const failPercentage = total ? ((value / total) * 100).toFixed(2) : 0;

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                {failPercentage}%
              </span>
              <div
                style={{
                  width: "100px", // Fixed width for uniformity
                  backgroundColor: "whitesmoke",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${failPercentage}%`,
                    height: "8px",
                    backgroundColor: "#e74c3c", // Red for fail
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        },
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
    {
      name: "Incomplete",
      label: "Incomplete",
      options: {
        customBodyRender: (value, tableMeta) => {
          const total = tableMeta.rowData[1]; // Assuming `TestCaseCount` is the second column
          const incompletePercentage = total
            ? ((value / total) * 100).toFixed(2)
            : 0;

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                {incompletePercentage}%
              </span>
              <div
                style={{
                  width: "100px", // Fixed width for uniformity
                  backgroundColor: "whitesmoke",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${incompletePercentage}%`,
                    height: "8px",
                    backgroundColor: "#f1c40f", // Yellow for incomplete
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        },
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
    {
      name: "Status",
      label: "Status",
      options: {
        customBodyRender: (value) => {
          let color;
          switch (value) {
            case "Passed":
              color = "#2ecc71";
              break;
            case "Failed":
              color = "#e74c3c";
              break;
            case "Incomplete":
              color = "#f1c40f";
              break;
            default:
              color = "#000";
          }
          return (
            <div
              style={{
                backgroundColor: color,
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "50px",
                textAlign: "center",
                display: "inline-block",
              }}
            >
              {value}
            </div>
          );
        },
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
    {
      name: "Start_Time",
      label: "Start Time",
      options: { display: "excluded" },
    },
    { name: "End_Time", label: "End Time", options: { display: "excluded" } },
  ];

  const column_2 = [
    {
      name: "ExecutionID",
      label: "Execution ID",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "Name",
      label: "Name",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "Status",
      label: "Status",
      options: {
        customBodyRender: (value) => {
          let color;
          switch (value) {
            case "Passed":
              color = "#2ecc71";
              break;
            case "Failed":
              color = "#e74c3c";
              break;
            case "Incomplete":
              color = "#f1c40f";
              break;
            default:
              color = "#000";
          }
          return (
            <div
              style={{
                backgroundColor: color,
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "50px",
                textAlign: "center",
                display: "inline-block",
              }}
            >
              {value}
            </div>
          );
        },
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
    {
      name: "StartTime",
      label: "Start Time",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "EndTime",
      label: "End Time",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "TestCaseCount",
      label: "Total Test Cases",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "PassedCount",
      label: "Passed",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "FailedCount",
      label: "Failed",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "IncompleteCount",
      label: "Incomplete",
      options: { setCellProps: () => ({ style: { textAlign: "center" } }) },
    },
    {
      name: "PDF",
      label: "PDF",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => (
          <div style={{ textAlign: "center" }}>
            <FontAwesomeIcon
              icon={faFilePdf}
              style={{ cursor: "pointer", fontSize: "20px", color: "#e74c3c" }}
              onClick={() => handleDownloadPDF(tableMeta.rowData)} // Correctly pass tableMeta
            />
          </div>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
    {
      name: "Excel",
      label: "Excel",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => (
          <div style={{ textAlign: "center" }}>
            <FontAwesomeIcon
              icon={faFileExcel}
              style={{ cursor: "pointer", fontSize: "20px", color: "#2ecc71" }}
              onClick={() => handleDownloadExcel(tableMeta.rowData)} // Correctly pass tableMeta
            />
          </div>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
      },
    },
  ];

  const handleDownloadExcel = (rowData) => {
    const data = [
      {
        "Execution ID": rowData[0],
        Name: rowData[1],
        Status: rowData[2],
        "Start Time": rowData[3],
        "End Time": rowData[4],
        "Total Test Cases": rowData[5],
        Passed: rowData[6],
        Failed: rowData[7],
        Incomplete: rowData[8],
      },
    ];

    // Create a new workbook and add data to it
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Execution Data");

    // Export the workbook as an Excel file
    XLSX.writeFile(wb, "execution_data.xlsx");
  };

  // Handler to download as PDF
  const handleDownloadPDF = (rowData) => {
    const doc = new jsPDF();

    // Table data
    const tableData = [
      [
        "Execution ID",
        "Name",
        "Status",
        "Start Time",
        "End Time",
        "Total Test Cases",
        "Passed",
        "Failed",
        "Incomplete",
      ],
      [
        rowData[0],
        rowData[1],
        rowData[2],
        rowData[3],
        rowData[4],
        rowData[5],
        rowData[6],
        rowData[7],
        rowData[8],
      ],
    ];

    // Add the table to the PDF document
    doc.autoTable({
      head: tableData.slice(0, 1),
      body: tableData.slice(1),
    });

    // Save the PDF file
    doc.save("execution_data.pdf");
  };

  // Add the selectedExecution as a row if available
  const tableData_2 = selectedExecution
    ? [
        {
          ExecutionID: selectedExecution.ExecutionID,
          Name: selectedExecution.Name,
          Status: selectedExecution.Status,
          StartTime: selectedExecution.StartTime,
          EndTime: selectedExecution.EndTime,
          TestCaseCount: selectedExecution.TestCaseCount,
          PassedCount: selectedExecution.PassedCount,
          FailedCount: selectedExecution.FailedCount,
          IncompleteCount: selectedExecution.IncompleteCount,
          PDF: "", // Placeholder for PDF column
          Excel: "", // Placeholder for Excel column
        },
      ]
    : []; // Display empty array if no selection

  return (
    <div className="main-content">
      {!selectedExecution ? (
        <>
          <div className="box-container">
            <div className="box box1">
              <FontAwesomeIcon icon={faStore} size="2x" />
              <h3>Executions</h3>
              <p>{executionData.length}</p>
            </div>
            <div className="box box2">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" color="#2ecc71" />
              <h3>Passed</h3>
              <p>{passedCount}</p>
            </div>
            <div className="box box3">
              <FontAwesomeIcon icon={faTimesCircle} size="2x" color="#e74c3c" />
              <h3>Failed</h3>
              <p>{failedCount}</p>
            </div>
            <div className="box box4">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="2x"
                color="#f1c40f"
              />
              <h3>Incomplete</h3>
              <p>{incompleteCount}</p>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper">
              <h3>Passed, Failed, and Incomplete Cases per Execution</h3>
              <Bar data={passFailIncompleteData} />
            </div>
            <div className="chart-wrapper">
              <h3>Execution Times</h3>
              <Bar data={barData} />
            </div>
          </div>

          <MUIDataTable
            className="cus-table"
            title={"Execution Data"}
            data={tableData_1}
            columns={column_1}
            options={{
              filterType: "checkbox",
              responsive: "standard",
              selectableRows: "none",
              setTableProps: () => ({
                className: "custom-table", // Apply the custom class here
              }),
            }}
          />
        </>
      ) : (
        <>
          <div className="box-container">
            <div className="box box1">
              <FontAwesomeIcon icon={faStore} size="2x" />
              <h3>Test Cases</h3>
              <p>{selectedExecution.TestCaseCount}</p>
            </div>
            <div className="box box2">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" color="#2ecc71" />
              <h3>Passed</h3>
              <p>{selectedExecution.PassedCount}</p>
            </div>
            <div className="box box3">
              <FontAwesomeIcon icon={faTimesCircle} size="2x" color="#e74c3c" />
              <h3>Failed</h3>
              <p>{selectedExecution.FailedCount}</p>
            </div>
            <div className="box box4">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="2x"
                color="#f1c40f"
              />
              <h3>Incomplete</h3>
              <p>{selectedExecution.IncompleteCount}</p>
            </div>
          </div>

          <div
            className="execution-details"
            style={{
              border: `2px solid ${
                selectedExecution.Status.toLowerCase() === "passed"
                  ? "#abebc6"
                  : selectedExecution.Status.toLowerCase() === "failed"
                  ? "#f5b7b1"
                  : "#f9e79f"
              }`,
              position: "relative",
              padding: "10px",
              borderRadius: "5px",
              marginTop: "20px",
            }}
          >
            <div
              className="paperclip-icon"
              style={{
                position: "absolute",
                top: "-15px",
                left: "-15px",
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPaperclip} size="lg" />
            </div>
            <div
              className="menu-icon"
              style={{ position: "absolute", top: "10px", right: "10px" }}
              onClick={() => setShowFileOptions((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faEllipsisV} size="lg" />
            </div>
            {showFileOptions && (
              <div
                className="file-options"
                style={{ position: "absolute", top: "30px", right: "10px" }}
              >
                <span
                  onClick={() => handleFileDownload("pdf")}
                  title="Download PDF"
                  style={{ cursor: "pointer", marginRight: "10px" }}
                >
                  <FontAwesomeIcon icon={faFilePdf} size="lg" color="#e63946" />
                </span>
                <span
                  onClick={() => handleFileDownload("excel")}
                  title="Download Excel"
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    size="lg"
                    color="#369801"
                  />
                </span>
              </div>
            )}
            <MUIDataTable
              className="cus-table_2"
              title={`Execution Data for ${selectedExecution.Name}`}
              data={tableData_2}
              columns={column_2}
              options={{
                filterType: "checkbox",
                responsive: "standard",
                selectableRows: "none",
                onRowClick: (rowData, { dataIndex }) => {
                  setSelectedExecution(executionData[dataIndex]); // Update this to use executionData
                },
                setTableProps: () => ({
                  className: "custom-table", // Apply the custom class here
                }),
              }}
            />
            <div className="graph-container">
              <div className="graph-wrapper">
                <h3>Execution Status for {selectedExecution.Name}</h3>
                <Bar data={executionChartData} />
              </div>
            </div>
            <button
              className="clear_selection"
              onClick={() => setSelectedExecution(null)}
            >
              Clear Selection
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MainContent;
