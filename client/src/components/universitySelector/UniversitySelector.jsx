import React, { useState, useEffect, useMemo } from "react";
import "./UniversitySelector.scss";
// Using dynamic import to avoid blocking main bundle if possible, 
// but for simplicity we'll import it or load it on demand.
import collegeData from "../../data/colleges.json";

const UniversitySelector = ({ value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Search logic
  useEffect(() => {
    if (searchTerm && searchTerm.length > 1 && searchTerm !== value) {
      const filtered = collegeData.filter(item => 
        (item.institute_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.district?.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 15); // Show top 15 results
      
      setResults(filtered);
      setShowResults(true);
    } else {
      setResults([]);
      if (searchTerm === value) setShowResults(false);
    }
  }, [searchTerm, value]);

  const handleSelect = (uni) => {
    const displayValue = `${uni.institute_name} (${uni.district})`;
    setSearchTerm(displayValue);
    setShowResults(false);
    onChange(displayValue);
  };

  return (
    <div className="universitySelector">
      <input
        type="text"
        placeholder={placeholder || "Search name or district..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm && searchTerm.length > 1 && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />
      {showResults && (
        <div className="results">
          {results.length > 0 ? (
            results.map((uni, idx) => (
              <div
                key={idx}
                className="result-item"
                onClick={() => handleSelect(uni)}
              >
                {uni.institute_name}
                <span className="country">{uni.district}</span>
              </div>
            ))
          ) : (
            searchTerm.length > 1 && <div className="no-results">No colleges found in catalog</div>
          )}
        </div>
      )}
    </div>
  );
};


export default UniversitySelector;
