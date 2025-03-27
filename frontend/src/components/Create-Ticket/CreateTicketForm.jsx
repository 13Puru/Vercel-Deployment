import React, { useState } from 'react';
import Card from '../Card/Card';
import axios from 'axios';

export const CreateTicketForm = ({ setActiveView }) => {
  const getUserInfo = () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const username = localStorage.getItem("username") || "";
      return { email: userEmail, username };
    } catch (error) {
      console.error("Error retrieving user info:", error);
      return { email: "", username: "" };
    }
  };

  const { email, username } = getUserInfo();

  // Ensuring initial state values to prevent uncontrolled input errors
  const [subject, setSubject] = useState("");
  const [issue, setIssue] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const API_CREATE_TICKET = import.meta.env.VITE_CREATE_TICKET;

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject || !issue || !category || !priority) {
      setError("All fields are required.");
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Unauthorized! Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        API_CREATE_TICKET,
        { subject, issue, category, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Ticket created successfully!");
      setTimeout(() => {
        setSuccess("");
      }, 5000);
      setSubject("");
      setIssue("");
      setCategory("");
      setPriority("");
    } catch (err) {
      console.error("Creation error:", err.response?.data || err);
      setError(err.response?.data?.message || "Error creating ticket.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Ticket</h1>
        <button
          onClick={() => setActiveView("dashboard")}
          className="border-2 border-[#432dd7] hover:bg-[#432da1] font-semibold text-gray-800 hover:text-white px-10 py-1.5 rounded-lg transition"
        >
          Back to Dashboard
        </button>
      </div>
      <h5 className="font-stretch-100% text-gray-800 mb-6">
        A new ticket is being created by <b>{username}</b> having mail-id: <b>{email}</b>
      </h5>
      <Card title="Ticket Details">
        <form onSubmit={handleCreateTicket} className="space-y-6">
          <div>Fields marked with (*) are mandatory</div>
          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
              ❌ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="account access">Account Access</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority*
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              rows="4"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Please provide detailed information about the issue"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments
            </label>
            <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
              <p className="text-sm text-gray-500">
                Drag and drop files here, or click to select files
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium text-white hover:bg-indigo-800"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};