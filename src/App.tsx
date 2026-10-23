import "./App.css";
import { useEffect, useState } from "react";

type TicketStatus = "Open" | "Closed";

type TicketPriority = "Low" | "Medium" | "High";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  assignedTo?: string;
};

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assignedToFilter, setAssignedToFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editError, setEditError] = useState("");
  const [editPriority, setEditPriority] = useState<TicketPriority>("Medium");
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const savedTickets = localStorage.getItem("tickets");

    if (savedTickets) {
      try {
        const parsedTickets = JSON.parse(savedTickets) as Ticket[];

        return parsedTickets.map((ticket) => ({
          ...ticket,
          createdAt: ticket.createdAt || new Date().toISOString(),
        }));
      } catch {
        localStorage.removeItem("tickets");
      }
      
    }

    return [
      {
        id: 1,
        title: "Laptop will not connect to Wi-Fi",
        description: "User cannot connect their laptop to the office Wi-Fi.",
        status: "Open",
        priority: "High",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
      {
        id: 2,
        title: "Printer is not working",
        description: "Office printer is not responding to print requests.",
        status: "Open",
        priority: "Medium",
        createdAt: "2026-10-02T10:00:00.000Z",
      },
      {
        id: 3,
        title: "Password reset needed",
        description: "User forgot their account password and needs it reset.",
        status: "Closed",
        priority: "Low",
        createdAt: "2026-10-03T10:00:00.000Z",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);


  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim() === "" || description.trim() === "") {
      setError("Please enter both a title and description.");
      return;
    }

    setError("");

    const newTicket: Ticket = {
      id: Date.now(),
      title: title,
      description: description,
      status: "Open",
      priority: priority,
      createdAt: new Date().toISOString(),
      assignedTo: assignedTo.trim(),
    };

    setTickets([...tickets, newTicket]);

    setTitle("");
    setDescription("");
    setAssignedTo("");
    setPriority("Medium");
  }

  function closeTicket(id: number) {
    const updatedTickets: Ticket[] = tickets.map((ticket) => {
      if (ticket.id === id) {
        return {
          ...ticket,
          status: "Closed",
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);
  }

  function reopenTicket(id: number) {
    const updatedTickets: Ticket[] = tickets.map((ticket) => {
      if (ticket.id === id) {
        return {
          ...ticket,
          status: "Open",
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);
  }

  function deleteTicket(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmed) {
      return;
    }

    const updatedTickets = tickets.filter((ticket) => {
      return ticket.id !== id;
    });

    setTickets(updatedTickets);
  }

  function saveEditedTicket(id: number) {
    if (editTitle.trim() === "" || editDescription.trim() === "") {
      setEditError("Please enter both a title and description.");
      return;
    }

    setEditError("");

    const updatedTickets: Ticket[] = tickets.map((ticket) => {
      if (ticket.id === id) {
        return {
          ...ticket,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          assignedTo: editAssignedTo.trim(),
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);
    setEditingTicketId(null);
    setEditAssignedTo("");
  }

  const technicians = [
    ...new Map(
      tickets.map((ticket) =>{ 
        const name = ticket.assignedTo?.trim() || "Unassigned"
        return [name.toLowerCase(), name] as const;
      })
    ).values(),
  ].sort((a, b) => {
    if(a.toLowerCase() === "Unassigned") return 1;
    if(b.toLowerCase() === "Unassigned") return -1;

    return a.localeCompare(b);
  });

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;

    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAssignedTo =
      assignedToFilter === "All" ||
      (ticket.assignedTo?.trim() || "Unassigned").toLowerCase() === 
        assignedToFilter.toLowerCase();

    return ( 
      matchesStatus && 
      matchesPriority && 
      matchesSearch &&
      matchesAssignedTo
    );
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortOrder === "Priority") {
      const priorityValues = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      return priorityValues[b.priority] - priorityValues[a.priority];
    }

    if (sortOrder === "LowestPriority") {
      const priorityValues = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      return priorityValues[a.priority] - priorityValues[b.priority];
    }

    if (sortOrder === "OpenFirst") {
      if (a.status === b.status) {
        return 0;
      }

      return a.status === "Open" ? -1 : 1;
    }

    if (sortOrder === "ClosedFirst") {
      if (a.status === b.status) {
        return 0;
      }

      return a.status === "Closed" ? -1 : 1;
    }

    if (sortOrder === "Newest") {
      return new Date(b.createdAt).getTime() -
             new Date(a.createdAt).getTime();
    }

    return new Date(a.createdAt).getTime() -
           new Date(b.createdAt).getTime();
  });

  return (
    <main className="app">
      <header className="app-header">
        <h1>IT Support Ticket System</h1>
        <p>Create and manage IT support tickets.</p>
      </header>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <h2>Create New Ticket</h2>

        <input
          type="text"
          placeholder="Ticket title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
        />

        <p className={`character-count ${
            title.length >= 90 ? "character-warning" : ""
          }`}
        >
          {title.length} / 100 characters
        </p>

        <div>
          <label htmlFor="assignedTo">Assigned To:</label>
          <input
            id="assignedTo"
            type="text"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            placeholder="Enter technician name"
            maxLength={50}
          />
          <p 
            className={`character-count ${
              assignedTo.length >= 45 ? "character-warning" : ""
            }`}
          >
            {assignedTo.length} / 50 characters
          </p>  
        </div>

        <textarea
          placeholder="Describe the problem"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
        />

        <p className={`character-count ${
            description.length >= 450 ? "character-warning" : ""
          }`}
        >
          {description.length} / 500 characters
        </p>

        <select
          value={priority}
          onChange={(event) => 
            setPriority(event.target.value as TicketPriority)
          }
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {error && <p>{error}</p>}

        <button className="create-button" type="submit">
          Create Ticket
        </button>
      </form>

      <div>
        <label htmlFor="status-filter">Filter by status: </label>

        <select
          id="status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div>
        <label htmlFor="priority-filter">Filter by priority: </label>

        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="assignedToFilter">Assigned To:</label>

        <select
          id="assignedToFilter"
          value={assignedToFilter}
          onChange={(event) => setAssignedToFilter(event.target.value)}
        >
          <option value="All">All Technicians</option>

          {technicians.map((technician) => (
            <option key={technician} value={technician}>
              {technician}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort-order">Sort by: </label>

        <select
          id="sort-order"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        >
          <option value="Newest">Newest First</option>
          <option value="Oldest">Oldest First</option>
          <option value="Priority">Highest Priority First</option>
          <option value="LowestPriority">Lowest Priority First</option>
          <option value="OpenFirst">Open Tickets First</option>
          <option value="ClosedFirst">Closed Tickets First</option>
        </select>
      </div>

      <button
        type="button"
        className="reset-filters-button"
        onClick={() => {
          setSearchTerm("");
          setStatusFilter("All");
          setPriorityFilter("All");
          setAssignedToFilter("All");
          setSortOrder("Newest");
        }}
      >
        Reset Filters
      </button>

      <div className="search-box">
        <label htmlFor="ticket-search">Search tickets: </label>

        <input
          id="ticket-search"
          type="text"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {searchTerm && (
          <button
            type="button"
            className="clear-search-button"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </button>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Tickets</h3>
          <p>{tickets.length}</p>
        </div>

        <div className="summary-card">
          <h3>Open Tickets</h3>
          <p>{tickets.filter((ticket) => ticket.status === "Open").length}</p>
        </div>

        <div className="summary-card">
          <h3>Closed Tickets</h3>
          <p>{tickets.filter((ticket) => ticket.status === "Closed").length}</p>
        </div>

        <div className="summary-card">
          <h3>High Priority Tickets</h3>
          <p>
            {tickets.filter((ticket) => ticket.priority === "High").length}
          </p>
        </div>
      </div>

      {filteredTickets.length === 0 && (
        <p>No tickets found.</p>
      )}

      <p className="results-count">
        Showing {sortedTickets.length} of {tickets.length} tickets
      </p>

      {sortedTickets.map((ticket) => (
        <section className="ticket-card" key={ticket.id}>
          <p className="ticket-id">Ticket #{String(ticket.id).slice(-6)}</p>
          <h2>{ticket.title}</h2>

          {editingTicketId === ticket.id && (
            <div>
              <p className="editing-message">Editing this ticket...</p>

              <label htmlFor={`edit-title-${ticket.id}`}>
                Title:
              </label>

              <input
                id={`edit-title-${ticket.id}`}
                type="text"
                value={editTitle}
                onChange={(event) => { 
                  setEditTitle(event.target.value);
                  setEditError("");
                }}
                maxLength={100}
              />

              <p
                className={`character-count ${
                  editTitle.length >= 90 ? "character-warning" : ""
                }`}
              >
                {editTitle.length} / 100 characters
              </p>

              <div>
                <label htmlFor={`edit-assigned-to-${ticket.id}`}>
                  Assigned To:
                </label>
                <input
                  id={`edit-assigned-to-${ticket.id}`}
                  type="text"
                  value={editAssignedTo}
                  onChange={(event) => setEditAssignedTo(event.target.value)}
                  placeholder="Enter technician name"
                  maxLength={50}
                />
                <p 
                  className={`character-count ${
                    editAssignedTo.length >= 45 ? "character-warning" : ""
                  }`}
                >
                  {editAssignedTo.length} / 50 characters
                </p>

              </div>

              <label htmlFor={`edit-description-${ticket.id}`}>
                Description:
              </label>

              <textarea
                id={`edit-description-${ticket.id}`}
                value={editDescription}
                onChange={(event) => {
                  setEditDescription(event.target.value);
                  setEditError("");
                }}
                maxLength={500}
              />

              <p
                className={`character-count ${
                  editDescription.length >= 450 ? "character-warning" : ""
                }`}
              >
                {editDescription.length} / 500 characters
              </p>

              <label htmlFor={`edit-priority-${ticket.id}`}>
                Priority:
              </label>

              <select
                id={`edit-priority-${ticket.id}`}
                value={editPriority}
                onChange={(event) =>
                  setEditPriority(event.target.value as TicketPriority)
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              {editError && (
                <p className="error-message">{editError}</p>
              )}

              <button
                type="button"
                className="status-button"
                onClick={() => saveEditedTicket(ticket.id)}
              >
                Save Changes
              </button>

              <button
                type="button"
                className="status-button"
                onClick={() =>{ 
                  setEditingTicketId(null);
                  setEditTitle("");
                  setEditDescription("");
                  setEditPriority("Medium");
                  setEditError("");
                  setEditAssignedTo("");
                }}
              >
                Cancel Edit
              </button>
            </div>
          )}

          <p>{ticket.description}</p>

          <p>
            <strong>Assigned To:</strong> {ticket.assignedTo || "Unassigned"}
          </p>

          <p>
            Status:{" "}
            <span className={`badge status-${ticket.status.toLowerCase()}`}>
              {ticket.status}
            </span>
          </p>

          <p>
            Priority:{" "}
            <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </p>
          <p>
            Created: {new Date(ticket.createdAt).toLocaleString()}
          </p>
          <div className="ticket-actions">
            <button
              className="status-button"
              onClick={() => {
                setEditingTicketId(ticket.id);
                setEditTitle(ticket.title);
                setEditDescription(ticket.description);
                setEditPriority(ticket.priority);
                setEditAssignedTo(ticket.assignedTo ?? "");
              }}
            >
              Edit Ticket
            </button>

            {ticket.status === "Open" && (
              <button 
                className="status-button"
                onClick={() => closeTicket(ticket.id)}
              >
                Close Ticket
              </button>
            )}

            {ticket.status === "Closed" && (
              <button 
                className="status-button"
                onClick={() => reopenTicket(ticket.id)}
              >
                Reopen Ticket
              </button>
            )}

            <button 
              className="delete-button"
              onClick={() => deleteTicket(ticket.id)}
            >
              Delete Ticket
            </button>
          </div>
          
        </section> 
      ))}
    </main>
  );
}

export default App;