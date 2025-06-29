import React, { useState } from 'react';

// If you don't have chart.js and react-chartjs-2 installed, run:
// npm install chart.js react-chartjs-2
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const initialReports = [
  { id: 1, title: 'Monthly Sales', description: 'Sales report for June', date: '2024-06-30', value: 1200 },
  { id: 2, title: 'Stock Summary', description: 'Current stock levels', date: '2024-06-30', value: 800 }
];

const Reports = () => {
  const [reports, setReports] = useState(initialReports);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    date: '',
    value: ''
  });

  const handleChange = (e) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

  const handleAddReport = (e) => {
    e.preventDefault();
    if (!newReport.title || !newReport.description || !newReport.date || !newReport.value) return;
    setReports([
      ...reports,
      { ...newReport, id: Date.now(), value: Number(newReport.value) }
    ]);
    setNewReport({ title: '', description: '', date: '', value: '' });
  };

  const handleDelete = (id) => {
    setReports(reports.filter(report => report.id !== id));
  };

  // Doughnut Chart data
  const chartData = {
    labels: reports.map(r => r.title),
    datasets: [
      {
        label: 'Report Value',
        data: reports.map(r => r.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Report Value Distribution' }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <form onSubmit={handleAddReport} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="title"
              value={newReport.title}
              onChange={handleChange}
              placeholder="Report Title"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="text"
              name="description"
              value={newReport.description}
              onChange={handleChange}
              placeholder="Description"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="date"
              name="date"
              value={newReport.date}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="number"
              name="value"
              value={newReport.value}
              onChange={handleChange}
              placeholder="Value"
              className="border px-3 py-2 rounded-lg flex-1"
              required
              min="0"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Title</th>
              <th className="py-2">Description</th>
              <th className="py-2">Date</th>
              <th className="py-2">Value</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="py-2">{report.title}</td>
                <td className="py-2">{report.description}</td>
                <td className="py-2">{report.date}</td>
                <td className="py-2">{report.value}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Reports Circle Chart</h2>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Reports;