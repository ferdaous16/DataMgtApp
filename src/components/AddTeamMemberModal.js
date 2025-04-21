import React from "react";

const AddTeamMemberModal = ({
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  onAdd,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Team Member</h2>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option value="">Select an employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name}
            </option>
          ))}
        </select>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={onAdd}
          >
            Add
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
