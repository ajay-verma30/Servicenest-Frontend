import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import './Sidebar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faTicketAlt, faUsers, faBook, faCode,faGroupArrowsRotate,faUser, faExclamation } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';

function Sidebar() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const isAdminOrAgent = user?.roles?.some(
  (r) => r.title === "Admin" || r.title === "agent"
);

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
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Users
          </Link>
          <br />

          <Link className="btn sidebar-menu" to={`/${orgId}/teams`}>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Teams
          </Link>
          <br />
          <Link className="btn sidebar-menu" to={`/${orgId}/groups`}>
            <FontAwesomeIcon icon={faGroupArrowsRotate} className="me-2" />
            Groups
          </Link>
          <br/>
          <Link className="btn sidebar-menu" to={`/${orgId}/roles`}>
            <FontAwesomeIcon icon={faExclamation} className="me-2" />
            Roles
          </Link>

          {/* <Link className="btn sidebar-menu" to={`/${orgId}/developers`}>
            <FontAwesomeIcon icon={faCode} className="me-2" />
            Developers
          </Link> */}
          <br />
        </>
      )}

      {/* <Link className="btn sidebar-menu" to={`/${orgId}/knowledgeBase`}>
        <FontAwesomeIcon icon={faBook} className="me-2" />
        Knowledge Base
      </Link> */}
      <br />
    </div>
  );
}

export default Sidebar;
