import React, { useState, useEffect } from 'react';

const THEME = {
  bg: "#0b141a",
  card: "#202c33",
  accent: "#10b981",
  text: "#e9edef",
  textMuted: "#8696a0",
  border: "rgba(255, 255, 255, 0.1)",
};

export default function AdminPanel() {
  const [leads, setLeads] = useState([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const data = JSON.parse(localStorage.getItem("j4_leads") || "[]");
      setLeads(data);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "123456") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password! Access Denied.");
    }
  };

  const clearLeads = () => {
    if (window.confirm("Are you sure you want to clear all lead data?")) {
      localStorage.removeItem("j4_leads");
      setLeads([]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: THEME.bg, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <form onSubmit={handleLogin} style={{ 
          backgroundColor: THEME.card, 
          padding: "40px", 
          borderRadius: "20px", 
          border: `1px solid ${THEME.border}`,
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}>
          <h1 style={{ color: THEME.accent, marginBottom: "10px", fontSize: "24px", fontWeight: "800" }}>Admin Access</h1>
          <p style={{ color: THEME.textMuted, marginBottom: "30px", fontSize: "14px" }}>Please enter your secret password to view leads.</p>
          <input 
            type="password" 
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "15px", 
              backgroundColor: THEME.bg, 
              border: `1px solid ${THEME.border}`, 
              borderRadius: "10px", 
              color: "#fff",
              marginBottom: "20px",
              outline: "none",
              textAlign: "center",
              fontSize: "16px"
            }}
          />
          <button type="submit" style={{ 
            width: "100%", 
            padding: "15px", 
            backgroundColor: THEME.accent, 
            color: "#fff", 
            border: "none", 
            borderRadius: "10px", 
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "16px"
          }}>Login to Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: THEME.bg, 
      color: THEME.text, 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px",
          borderBottom: `1px solid ${THEME.border}`,
          paddingBottom: "20px"
        }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0, color: THEME.accent }}>J4_Innovate Admin Dashboard</h1>
            <p style={{ color: THEME.textMuted, marginTop: "5px" }}>Manage and view all collected leads</p>
          </div>
          <button 
            onClick={clearLeads}
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            Clear All Data
          </button>
        </div>

        {leads.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "100px 0", 
            backgroundColor: THEME.card, 
            borderRadius: "16px",
            border: `1px solid ${THEME.border}`
          }}>
            <div style={{ fontSize: "50px", marginBottom: "20px" }}>📭</div>
            <h2 style={{ fontSize: "20px", fontWeight: "600" }}>No leads collected yet.</h2>
            <p style={{ color: THEME.textMuted }}>When users finish the chatbot flow, their data will appear here.</p>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: THEME.card, 
            borderRadius: "16px", 
            border: `1px solid ${THEME.border}`,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${THEME.border}`, backgroundColor: "rgba(0,0,0,0.2)" }}>
                    <th style={tableHeaderStyle}>Date</th>
                    <th style={tableHeaderStyle}>Name</th>
                    <th style={tableHeaderStyle}>Business</th>
                    <th style={tableHeaderStyle}>Service</th>
                    <th style={tableHeaderStyle}>Contact Info</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: `1px solid ${THEME.border}`, transition: "background 0.2s" }}>
                      <td style={tableCellStyle}>{lead.date}</td>
                      <td style={{...tableCellStyle, fontWeight: "700"}}>{lead.name}</td>
                      <td style={tableCellStyle}>{lead.business}</td>
                      <td style={tableCellStyle}>
                        <span style={{ 
                          padding: "4px 10px", 
                          backgroundColor: "rgba(16, 185, 129, 0.1)", 
                          color: THEME.accent, 
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}>
                          {lead.service}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "13px" }}>📞 {lead.phone}</span>
                          <span style={{ fontSize: "13px", color: THEME.textMuted }}>📧 {lead.email}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: "18px 20px",
  fontSize: "14px",
  fontWeight: "800",
  color: "#8696a0",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const tableCellStyle = {
  padding: "18px 20px",
  fontSize: "14px",
  verticalAlign: "middle"
};
