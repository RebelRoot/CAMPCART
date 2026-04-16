import React, { useState } from "react";
import "./Schemes.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const Schemes = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const currentUser = getCurrentUser();

  const { isLoading, error, data: schemesData } = useQuery({
    queryKey: ["schemes"],
    queryFn: () => newRequest.get("/schemes").then((res) => res.data),
  });

  const categories = ["All", "Central", "Regional", "Engineering", "Medical", "Management", "Research", "Technical"];

  const getMatchDetails = (scheme) => {
    if (!currentUser) return null;
    const criteria = scheme.matchCriteria || {};
    let reasons = [];
    let score = 0;

    // State Match
    if (criteria.state !== "All" && criteria.state === currentUser.state) {
      score += 5;
      reasons.push(`${currentUser.state} Domicile`);
    }

    // Gender Match
    if (criteria.gender === currentUser.gender) {
      score += 3;
      reasons.push(`${currentUser.gender} specific`);
    }

    // Bachelors / Degree Match (UPSC/SSC focus)
    if (scheme.tags.includes("Bachelors Eligible")) {
      score += 2;
      reasons.push("Apply while in Bachelors");
    }

    return score > 0 ? { score, reasons } : null;
  };

  const filteredAndSortedSchemes = (schemesData || [])
    .filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                            s.focus.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || s.category.includes(filter);
      const matchesType = activeType === "All" || s.type === activeType;
      return matchesSearch && matchesFilter && matchesType;
    })
    .sort((a, b) => {
      const matchA = getMatchDetails(a)?.score || 0;
      const matchB = getMatchDetails(b)?.score || 0;
      return matchB - matchA;
    });

  if (isLoading) return <div className="schemes-page"><div className="loader">Updating Encyclopedia...</div></div>;
  if (error) return <div className="schemes-page"><div className="error">Sync Error. Please refresh.</div></div>;

  return (
    <div className="schemes-page">
      <div className="hero-section">
        <h1>Schemes & Entrance Exams Hub</h1>
        <p>Your centralized discovery engine for 70+ student opportunities</p>
        
        <div className="type-toggles">
          <button className={activeType === "All" ? "active" : ""} onClick={() => setActiveType("All")}>All Hubs</button>
          <button className={activeType === "Scheme" ? "active" : ""} onClick={() => setActiveType("Scheme")}>Scholarships</button>
          <button className={activeType === "Exam" ? "active" : ""} onClick={() => setActiveType("Exam")}>Entrance Exams</button>
        </div>

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search UPSC, State PCS, JEE, GATE, or Scholarships..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      <div className="content-container">
        {currentUser && (
          <div className="profile-matching-info">
            <span className="icon">🏆</span>
            <p>
              Exams & Schemes matched for <strong>{currentUser.username}</strong> ({currentUser.state || "National"}).
            </p>
          </div>
        )}

        <div className="filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={filter === cat ? "active" : ""} 
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="schemes-grid">
          {filteredAndSortedSchemes.map(scheme => {
            const matchInfo = getMatchDetails(scheme);
            return (
              <div className={`scheme-card ${matchInfo ? "matched" : ""} ${scheme.type === 'Exam' ? 'exam-type' : ''}`} key={scheme.id}>
                <div className="type-badge">{scheme.type}</div>
                {matchInfo && (
                  <div className="match-badge">
                    ✨ Recommended for You
                  </div>
                )}
                
                <div className="card-header">
                  <span className="badge">{scheme.category}</span>
                  <div className="tags">
                    {scheme.tags.map(tag => <span key={tag} className="tag">#{tag.replace(/\s+/g, '')}</span>)}
                  </div>
                </div>

                <h3>{scheme.title}</h3>
                <p className="focus"><strong>Goal:</strong> {scheme.focus}</p>
                
                <div className="info-row highlight">
                  <span className="icon">📅</span>
                  <div>
                    <label>Application Window</label>
                    <p>{scheme.deadline || "Year-round"}</p>
                  </div>
                </div>

                <div className="info-row">
                  <span className="icon">⏳</span>
                  <div>
                    <label>Eligibility Phase</label>
                    <p>{scheme.eligibleYears || "Varies"}</p>
                  </div>
                </div>

                <div className="reward-section">
                  <span className="icon">{scheme.type === 'Exam' ? '🎯' : '💰'}</span>
                  <div>
                    <label>{scheme.type === 'Exam' ? 'Career Path' : 'Benefit'}</label>
                    <p>{scheme.reward}</p>
                  </div>
                </div>

                {matchInfo && (
                  <div className="match-reasons">
                    {matchInfo.reasons.map((r, i) => (
                      <span key={i} className="reason-pill">✓ {r}</span>
                    ))}
                  </div>
                )}
                
                <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="apply-btn">
                  {scheme.type === 'Exam' ? 'View Syllabus / Apply' : 'Details & Apply'}
                </a>
              </div>
            );
          })}
        </div>

        {filteredAndSortedSchemes.length === 0 && (
          <div className="no-results">
            <p>Try searching for specific keywords like "UPSC" or "Post-Matric".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schemes;
