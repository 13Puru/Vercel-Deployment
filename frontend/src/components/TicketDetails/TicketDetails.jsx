import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../Card/Card";
import InfoCard from "../InfoCard/InfoCard";
import ActivityLogItem from "../ActivityLogItem/ActivityLogItem";
import actionColors from "../Colors/actionColors";
import { ArrowLeft } from "lucide-react";

const TicketDetails = ({ ticket, onAssign, onSelfAssign, onResolve, onClose, isAuthorized,  setActiveView }) => {
  // State for modal visibility
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  // Agents state declaration
  const [agents, setAgents] = useState([]);
  // State for loading agents
  const [isLoading, setIsLoading] = useState(false);
  // Search term state
  const [searchTerm, setSearchTerm] = useState("");
  // Local ticket state to enable refreshing UI
  const [currentTicket, setCurrentTicket] = useState(ticket);
  // State for comment text
  const [commentText, setCommentText] = useState("");
  // State to track selected response for replying
  const [selectedResponseId, setSelectedResponseId] = useState(null);

  const API_GET_ALL_USER = import.meta.env.VITE_GET_ALL;
  const API_GET_TICKET = import.meta.env.VITE_GET_TICKET;
  const API_RESPOND = import.meta.env.VITE_RESPOND;
  const API_REPLY = import.meta.env.VITE_REPLY;
  const API_ASSIGN = import.meta.env.VITE_ASSIGN;
  const API_RESOLVE = import.meta.env.VITE_RESOLVE;
  const API_CLOSE = import.meta.env.VITE_CLOSE;
  const API_SELF_ASSIGN = import.meta.env.VITE_SELF_ASSIGN;

  // Update local ticket state when prop changes
  useEffect(() => {
    setCurrentTicket(ticket);
  }, [ticket]);

  // Fetch agents data
  useEffect(() => {
    const fetchAgents = async () => {
      const token = localStorage.getItem("userToken");
      setIsLoading(true);

      try {
        const response = await axios.get(API_GET_ALL_USER, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Access the users array from the response object
        const usersArray = response.data.users || [];

        // Filter users with role "agent"
        const filteredAgents = usersArray.filter(user => user.role === "agent");
        setAgents(filteredAgents);
      } catch (error) {
        console.error("Error fetching agents:", error);
        alert("Failed to fetch agents list");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAssignModalOpen) {
      fetchAgents();
    }
  }, [isAssignModalOpen, API_GET_ALL_USER]);

  // Helper function to fetch updated ticket data
  const refreshTicketData = async () => {
    const token = localStorage.getItem("userToken");

    try {
      const response = await axios.get(`${API_GET_TICKET}?ticket_id=${currentTicket.ticket_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.ticket) {
        setCurrentTicket(response.data.ticket);
        return response.data.ticket;
      }
    } catch (error) {
      console.error("Error refreshing ticket data:", error);
      alert("Failed to refresh ticket data");
    }

    return null;
  };

  // Handle undefined or null ticket
  if (!currentTicket) return <p className="text-gray-500">No ticket selected</p>;

  // Ensure responses and replies exist
  const responses = currentTicket.responses || [];
  const replies = currentTicket.replies || [];

  // Handle agent assignment
  const handleAssign = async (agentId) => {
    const token = localStorage.getItem("userToken");

    try {
      await axios.post(
        API_ASSIGN,
        {
          ticket_id: currentTicket.ticket_id,
          assigned_to: agentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Find agent name for UI update
      const assignedAgent = agents.find(agent => agent.user_id === agentId);
      const agentName = assignedAgent ? assignedAgent.username : "Unknown";

      // Update local ticket state immediately for better UX
      setCurrentTicket(prevTicket => ({
        ...prevTicket,
        assigned_to: agentName
      }));

      // Refresh ticket data from server to get all updated fields
      const updatedTicket = await refreshTicketData();

      alert("Ticket assigned successfully!");
      setIsAssignModalOpen(false);

      // Call the onAssign callback to update parent component
      if (onAssign) onAssign(currentTicket.ticket_id, agentId, updatedTicket);
    } catch (error) {
      console.error("Error assigning ticket:", error);

      // Enhanced error handling
      if (error.response) {
        console.error("Error details:", error.response.data);
        alert(`Failed to assign ticket: ${error.response.data.message || "Unknown error"}`);
      } else {
        alert("Failed to assign ticket.");
      }
    }
  };

  // Handle self assignment
  const handleSelfAssign = async () => {
    try {
      const token = localStorage.getItem('userToken'); // Get the auth token
      if (!token) {
        alert("User not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        API_SELF_ASSIGN,
        { ticket_id: currentTicket.ticket_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        await refreshTicketData(); // Refresh ticket details after assignment
        alert("Ticket self-assigned successfully!");
      } else {
        alert(response.data.message || "Failed to self-assign ticket.");
      }
    } catch (error) {
      console.error("Error self-assigning ticket:", error);
      alert("Failed to self-assign ticket. Please try again.");
    }
  };


  const handleResolve = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await axios.post(
        API_RESOLVE,
        { ticket_id: currentTicket.ticket_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Ticket marked as resolved!");
        const updatedTicket = await refreshTicketData();
        if (onResolve) onResolve(currentTicket.ticket_id, updatedTicket);
      } else {
        alert(response.data.message || "Failed to resolve ticket");
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // Handle close ticket
  const handleClose = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await axios.post(
        API_CLOSE,
        { ticket_id: currentTicket.ticket_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Ticket closed successfully!");
        const updatedTicket = await refreshTicketData();
        if (onClose) onClose(currentTicket.ticket_id, updatedTicket);
      } else {
        alert(response.data.message || "Failed to close ticket");
      }
    } catch (error) {
      console.error("Error closing ticket:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // Select a response to reply to
  const handleSelectResponse = (responseId) => {
    setSelectedResponseId(responseId);
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    const token = localStorage.getItem("userToken");
    const userRole = localStorage.getItem('userRole');

    try {
      if (userRole === "user") {
        // For user role, submit a reply to a response

        // Determine which response_id to use
        let responseIdToUse = selectedResponseId;

        // If no response is selected, use the most recent one
        if (!responseIdToUse && responses.length > 0) {
          responseIdToUse = responses[0].response_id;
        }

        // Validate that we have a response to reply to
        if (!responseIdToUse) {
          alert("No response available to reply to");
          return;
        }

        console.log("Replying to response ID:", responseIdToUse);

        // Handle reply submission
        await axios.post(
          API_REPLY,
          {
            response_id: responseIdToUse,
            reply: commentText
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Reset selected response after submission
        setSelectedResponseId(null);
        alert("Reply added successfully!");
      } else {
        // Handle response submission for agents/admins
        await axios.post(
          API_RESPOND,
          {
            ticket_id: currentTicket.ticket_id,
            response: commentText
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        alert("Response added successfully!");
      }

      // Clear the textarea after submission
      setCommentText("");

      // Refresh ticket data to show new comment
      await refreshTicketData();

    } catch (error) {
      console.error("Error adding comment:", error);
      if (error.response) {
        console.error("Error details:", error.response.data);
        alert(`Failed to add comment: ${error.response.data.message || "Unknown error"}`);
      } else {
        alert("Failed to add comment. Please try again.");
      }
    }
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
      <button
          onClick={() => {
            try {
              setActiveView("dashboard");
            } catch (error) {
              console.error("Error setting active view:", error);
              // Fallback mechanism if setActiveView fails
              alert("Unable to navigate back to dashboard");
            }
          }}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{currentTicket.subject}</h1>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full ${currentTicket.status === "resolved"
            ? "bg-green-100 text-green-800"
            : currentTicket.status === "in_progress"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
            }`}>
            {currentTicket.status}
          </span>

          {/* Display last action */}
          {currentTicket.last_action && (
            <span className={`text-sm px-3 py-1 rounded-full ${actionColors[currentTicket.last_action] || 'bg-gray-100 text-gray-800'
              }`}>
              {currentTicket.last_action}
            </span>
          )}

          {/* Only show these buttons for authorized users */}
          {isAuthorized && (
            <>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
              >
                Assign Ticket
              </button>
              <button
                onClick={handleSelfAssign}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200 transition-colors"
              >
                Self Assign
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <InfoCard label="Ticket ID" value={currentTicket.ticket_id} />
        <InfoCard
          label="Priority"
          value={currentTicket.priority}
          className={
            currentTicket.priority === "high"
              ? "text-red-600"
              : currentTicket.priority === "medium"
                ? "text-orange-600"
                : "text-gray-600"
          }
        />
        <InfoCard label="Category" value={currentTicket.category || "N/A"} />
        <InfoCard
          label="Created"
          value={currentTicket.created_at ? new Date(currentTicket.created_at).toLocaleString() : "N/A"}
        />
        <InfoCard label="Created By" value={currentTicket.created_by || "Unknown"} />
        <InfoCard label="Assigned To" value={currentTicket.assigned_to || "Unassigned"} />
      </div>

      <Card title="Description">
        <p className="text-sm text-gray-700">{currentTicket.issue || "No description available."}</p>
      </Card>

      <div className="mt-6">
        <Card title="Responses">
          {responses.length > 0 ? (
            responses.map((response) => (
              <div key={response.response_id} className="mb-3">
                <ActivityLogItem
                  user={response.responder || "Unknown"}
                  action={response.response}
                  time={response.created_at ? new Date(response.created_at).toLocaleString() : "N/A"}
                />
                {/* Reply button for users to select which response to reply to */}
                {localStorage.getItem('userRole') === "user" && (
                  <div className="mt-1 ml-6">
                    <button
                      onClick={() => handleSelectResponse(response.response_id)}
                      className={`text-xs px-2 py-1 rounded ${selectedResponseId === response.response_id
                        ? "bg-indigo-100 text-indigo-700 font-medium"
                        : "text-gray-500 hover:text-indigo-600"
                        }`}
                    >
                      {selectedResponseId === response.response_id ? "Selected for Reply" : "Reply to this"}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No responses yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Replies">
          {replies.length > 0 ? (
            replies.map((reply) => (
              <ActivityLogItem
                key={reply.reply_id}
                user={reply.replier || "Unknown"}
                action={reply.reply}
                time={reply.created_at ? new Date(reply.created_at).toLocaleString() : "N/A"}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No replies yet.</p>
          )}
        </Card>
      </div>

      {currentTicket.last_action !== "closed" && (
        <div className="mt-6">
          <Card title={localStorage.getItem('userRole') === "user"
            ? `Add Reply ${selectedResponseId ? "(Reply Selected)" : "(Will reply to latest response)"}`
            : "Add Response"}>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              placeholder={localStorage.getItem('userRole') === "user" ? "Add your reply..." : "Add your response..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              {localStorage.getItem('userRole') === "user" ? (
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium text-white hover:bg-indigo-800 transition-colors"
                  disabled={responses.length === 0}
                >
                  Add Reply
                </button>
              ) : (
                /* Only show these buttons for authorized users */
                isAuthorized && (
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium text-white hover:bg-indigo-800 transition-colors"
                  >
                    Add Response
                  </button>
                )
              )}

              {isAuthorized && (
                <button
                  onClick={handleResolve}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  disabled={currentTicket.status === "resolved"}
                >
                  Mark as Resolved
                </button>
              )}

              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                disabled={currentTicket.status === "closed"}
              >
                Close Ticket
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Professional Modal with Backdrop Filter */}
      {isAssignModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          // Close modal when clicking outside
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop with blur effect */}
            <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-30 backdrop-blur-sm" aria-hidden="true"></div>

            {/* Modal positioning */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Actual modal */}
            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              // Stop propagation to prevent closing when clicking inside modal
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-4 flex justify-between items-center border-b border-indigo-800">
                <h2 className="text-lg font-semibold text-white">Assign Ticket #{currentTicket.ticket_id}</h2>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 pt-5 pb-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Agent List */}
              <div className="px-6 py-3">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : filteredAgents.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-100">
                    <ul className="divide-y divide-gray-200">
                      {filteredAgents.map((agent) => (
                        <li key={agent.user_id} className="py-3 hover:bg-indigo-50 transition-colors rounded-md px-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {agent.username ? agent.username.substring(0, 2).toUpperCase() : "??"}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{agent.username || "Unknown Agent"}</p>
                                <p className="text-sm text-gray-500">{agent.email || "No email"}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAssign(agent.user_id)}
                              className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Assign
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "No agents match your search" : "No agents available"}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-200">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;