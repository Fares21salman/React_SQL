import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileExcel,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import "./Sidebar.css";

const Sidebar = ({ executions, setSelectedExecution }) => {
  const [filter, setFilter] = useState("");
  const [hoveredExecution, setHoveredExecution] = useState(null);
  const [selectedExecution, setSelectedExecutionState] = useState(null);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleExecutionClick = (execution) => {
    setSelectedExecutionState(execution.ExecutionID);
    setSelectedExecution(execution);
  };

  const filteredExecutions = executions.filter((execution) => {
    return filter ? execution.Status === filter : true;
  });

  const handleFileDownload = (execution, fileType) => {
    if (fileType === "pdf") {
      const doc = new jsPDF();
      doc.text(`Name: ${execution.Name}`, 10, 10);
      doc.text(`Status: ${execution.Status}`, 10, 20);
      doc.text(`Start Time: ${execution.StartTime}`, 10, 30);
      doc.text(`End Time: ${execution.EndTime}`, 10, 40);
      doc.save(`${execution.Name}.pdf`);
    } else if (fileType === "excel") {
      const ws = XLSX.utils.json_to_sheet([execution]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Executions");
      XLSX.writeFile(wb, `${execution.Name}.xlsx`);
    }
  };

  if (!filteredExecutions || filteredExecutions.length === 0) {
    return <div>No executions available</div>;
  }

  return (
    <div className="sidebar">
      <h3>Test Executions</h3>
      <div className="filter-container">
        <div className="custom-select">
          <select onChange={handleFilterChange} value={filter}>
            <option value="">All</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Incomplete">Incomplete</option>
          </select>
          <FontAwesomeIcon icon={faFilter} className="filter-icon" />
        </div>
      </div>

      <ul>
        {filteredExecutions.map((execution) => (
          <li
            key={execution.ExecutionID}
            onClick={() => handleExecutionClick(execution)}
            onMouseEnter={() => setHoveredExecution(execution.ExecutionID)}
            onMouseLeave={() => setHoveredExecution(null)}
            className={
              selectedExecution === execution.ExecutionID ? "selected" : ""
            }
          >
            {execution.Name} - {execution.Status}
            {hoveredExecution === execution.ExecutionID && (
              <div className="file-options">
                <span
                  onClick={() => handleFileDownload(execution, "pdf")}
                  title="Download PDF"
                  style={{ cursor: "pointer", marginRight: "10px" }}
                >
                  <FontAwesomeIcon icon={faFilePdf} size="lg" color="#e63946" />
                </span>
                <span
                  onClick={() => handleFileDownload(execution, "excel")}
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
