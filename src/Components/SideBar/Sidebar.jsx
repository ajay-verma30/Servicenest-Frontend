import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import './Sidebar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faTicketAlt, faUsers, faBook, faCode } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';

function Sidebar() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const isAdminOrAgent = user?.role === "admin" || user?.role === "agent";

  return (
    <div className="sidebar">
      <Link className="btn sidebar-menu" to={`/${orgId}/dashboard`}>
        <FontAwesomeIcon icon={faHome} className="me-2" />
        Dashboard
      </Link>
      <br />

      <Link className="btn sidebar-menu" to={`/${orgId}/tickets`}>
        <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
        Tickets
      </Link>
      <br />

      {isAdminOrAgent && (
        <>
          <Link className="btn sidebar-menu" to={`/${orgId}/users`}>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Users
          </Link>
          <br />

          <Link className="btn sidebar-menu" to={`/${orgId}/teams`}>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Teams
          </Link>
          <br />

          <Link className="btn sidebar-menu" to={`/${orgId}/developers`}>
            <FontAwesomeIcon icon={faCode} className="me-2" />
            Developers
          </Link>
          <br />
        </>
      )}

      <Link className="btn sidebar-menu" to={`/${orgId}/knowledgeBase`}>
        <FontAwesomeIcon icon={faBook} className="me-2" />
        Knowledge Base
      </Link>
      <br />
    </div>
  );
}

export default Sidebar;
