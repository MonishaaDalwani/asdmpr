import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterRead, setFilterRead] = useState('all');
  const [search, setSearch] = useState('');
  const [alertState, setAlertState] = useState({ type: '', text: '' });

  // Reply Modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [page, filterRead]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterRead !== 'all') params.isRead = filterRead === 'read';
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/messages', { params });
      if (res.data.success) {
        setMessages(res.data.messages);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      setAlertState({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load inquiries.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  const handleOpenReplyModal = (msg) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyMessage || '');
  };

  const handleCloseReplyModal = () => {
    setSelectedMessage(null);
    setReplyText('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedMessage) return;
    setSubmittingReply(true);

    try {
      const res = await api.put(`/messages/${selectedMessage._id}/reply`, { replyText });
      if (res.data.success) {
        setAlertState({ type: 'success', text: 'Reply saved and inquiry resolved.' });
        handleCloseReplyModal();
        fetchMessages();
      }
    } catch (err) {
      setAlertState({
        type: 'error',
        text: err.response?.data?.message || 'Failed to record reply.',
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message record?')) return;

    try {
      const res = await api.delete(`/messages/${id}`);
      if (res.data.success) {
        setAlertState({ type: 'success', text: 'Message deleted successfully.' });
        fetchMessages();
      }
    } catch (err) {
      setAlertState({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete message.',
      });
    }
  };

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">COMMUNICATION DESK</span>
          <h1 className="content-title">Patient Inquiries & Feedback</h1>
          <p className="content-desc">
            Review incoming public contact form submissions and record administrative responses.
          </p>
        </div>
      </div>

      {alertState.text && (
        <Alert
          type={alertState.type}
          message={alertState.text}
          onClose={() => setAlertState({ type: '', text: '' })}
        />
      )}

      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row">
          <input
            type="text"
            className="form-input"
            placeholder="Search inquiries by sender, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-select-group">
          <div className="select-wrapper">
            <label className="select-label">Status:</label>
            <select
              className="form-input"
              value={filterRead}
              onChange={(e) => {
                setFilterRead(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Inquiries</option>
              <option value="false">Unread Only</option>
              <option value="read">Read / Replied</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Subject & Content</th>
                <th>Status</th>
                <th>Date Received</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <LoadingSpinner message="Loading messages..." />
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className={!msg.isRead ? 'unread-row' : ''}>
                    <td>
                      <strong>{msg.name}</strong>
                      <div className="table-subtext">{msg.email}</div>
                      {msg.phone && <div className="table-subtext">{msg.phone}</div>}
                    </td>
                    <td>
                      <strong className="msg-subject-text">{msg.subject}</strong>
                      <p className="table-msg-preview">{msg.message}</p>
                      {msg.replyMessage && (
                        <div className="table-reply-box">
                          <strong>Hospital Response:</strong> {msg.replyMessage}
                        </div>
                      )}
                    </td>
                    <td>
                      {msg.replyMessage ? (
                        <span className="badge badge-success">Replied</span>
                      ) : msg.isRead ? (
                        <span className="badge badge-muted">Read</span>
                      ) : (
                        <span className="badge badge-warning">Unread</span>
                      )}
                    </td>
                    <td>
                      <div className="table-subtext">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-action-btns">
                        <button
                          onClick={() => handleOpenReplyModal(msg)}
                          className="btn btn-outline btn-xs"
                        >
                          {msg.replyMessage ? 'View / Edit Reply' : 'Reply'}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="btn btn-outline-danger btn-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Respond to Patient Inquiry</h3>
              <button onClick={handleCloseReplyModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSendReply}>
              <div className="modal-body">
                <div className="inquiry-preview-box">
                  <div className="inq-sender">
                    From: <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                  </div>
                  <div className="inq-subject">
                    Subject: <em>{selectedMessage.subject}</em>
                  </div>
                  <div className="inq-msg">{selectedMessage.message}</div>
                </div>

                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="form-label">Hospital Response / Reply Notes *</label>
                  <textarea
                    className="form-input form-textarea"
                    rows="4"
                    placeholder="Enter the official response to be logged or emailed to the patient..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseReplyModal}
                  className="btn btn-ghost"
                  disabled={submittingReply}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingReply}
                >
                  {submittingReply ? 'Recording Reply...' : 'Save & Mark Replied'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManagement;
