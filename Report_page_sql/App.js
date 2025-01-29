import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import "./App.css";

function App() {
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [filter, setFilter] = useState(""); // Initialize filter state

  useEffect(() => {
    // Fetch execution data from the SQL database API
    const fetchExecutions = async () => {
      try {
        const response = await fetch("http://localhost:5004/executions");
        const data = await response.json();
        console.log("Data--------->>>>>>", data);
        setExecutions(data); // Set the fetched execution data
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchExecutions(); // Call the fetch function
  }, []);

  const handleClearSelection = () => {
    setSelectedExecution(null); // Reset selected execution to clear it in Sidebar
  };

  // Calculate execution counts
  const totalExecutions = executions.length;
  const passedCount = executions.filter(
    (exec) => exec.Status === "Passed"
  ).length;
  const failedCount = executions.filter(
    (exec) => exec.Status === "Failed"
  ).length;
  const incompleteCount = executions.filter(
    (exec) => exec.Status === "Incomplete"
  ).length;

  // Filter executions based on the selected filter
  const filteredExecutions = filter
    ? executions.filter((exec) => exec.Status === filter)
    : executions;

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-layout">
          <Sidebar
            executions={filteredExecutions} // Pass filtered executions to Sidebar
            setSelectedExecution={setSelectedExecution}
            onFilterChange={setFilter} // Pass the filter change handler
            totalExecutions={totalExecutions}
            selectedExecution={selectedExecution}
          />
          <Routes>
            <Route
              path="/"
              element={
                <MainContent
                  executions={filteredExecutions}
                  selectedExecution={selectedExecution}
                  setSelectedExecution={setSelectedExecution}
                  totalExecutions={totalExecutions}
                  passedCount={passedCount}
                  failedCount={failedCount}
                  incompleteCount={incompleteCount}
                  onClearSelection={handleClearSelection} // Pass clear function
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
