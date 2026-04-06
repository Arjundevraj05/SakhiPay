
import React, { useState } from "react";
import "../styles/schemes.css";

const schemes = [
  // Women Empowerment
  { name: "Stand-Up India", category: "Women Empowerment", description: "Loans for women entrepreneurs.", link: "https://www.standupmitra.in/" },
  { name: "Sukanya Samriddhi Yojana", category: "Women Empowerment", description: "Savings scheme for girl child.", link: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89" },
  { name: "Beti Bachao Beti Padhao", category: "Women Empowerment", description: "Promotes girl education.", link: "https://wcd.nic.in/bbbp-scheme" },
  { name: "Mahila E-Haat", category: "Women Empowerment", description: "Online marketing platform for women.", link: "https://mahilaehaat-rmk.gov.in/" },
  { name: "TREAD Scheme", category: "Women Empowerment", description: "Credit and skill training for women entrepreneurs.", link: "https://msme.gov.in/" },
  { name: "Mudra Yojana for Women", category: "Women Empowerment", description: "Loans for women-led businesses.", link: "https://www.mudra.org.in/" },
  { name: "Working Women Hostel Scheme", category: "Women Empowerment", description: "Safe accommodation for working women.", link: "https://wcd.nic.in/" },
  { name: "Swadhar Greh Scheme", category: "Women Empowerment", description: "Support for women in distress.", link: "https://wcd.nic.in/" },
  
  // Education
  { name: "PM Kaushal Vikas Yojana (PMKVY)", category: "Education", description: "Free skill training for women.", link: "https://pmkvyofficial.org/" },
  { name: "Nai Roshni", category: "Education", description: "Leadership training for minority women.", link: "https://www.nairoshni-moma.gov.in/" },
  { name: "Jan Shikshan Sansthan (JSS)", category: "Education", description: "Free training in traditional and modern skills.", link: "https://www.msde.gov.in/jss.html" },
  { name: "Saakshar Bharat Mission", category: "Education", description: "Literacy programs for adult rural women.", link: "https://www.education.gov.in/" },
  { name: "Pragati Scholarship for Girls", category: "Education", description: "Scholarship for meritorious female students.", link: "https://www.aicte-india.org/" },
  { name: "National Scholarship Scheme", category: "Education", description: "Financial aid for economically weaker students.", link: "https://scholarships.gov.in/" },
  
  // Health
  { name: "Pradhan Mantri Matru Vandana Yojana", category: "Health", description: "Financial assistance for pregnant women.", link: "https://wcd.nic.in/" },
  { name: "Ujjwala Yojana", category: "Health", description: "Free LPG connections for women.", link: "https://www.pmuy.gov.in/" },
  { name: "POSHAN Abhiyaan", category: "Health", description: "Nutrition for women & children.", link: "https://icds-wcd.nic.in/nnm/home.htm" },
  { name: "Ayushman Bharat", category: "Health", description: "Health insurance for families.", link: "https://pmjay.gov.in/" },
  { name: "Mission Indradhanush", category: "Health", description: "Free vaccinations for children and pregnant women.", link: "https://nhm.gov.in/" },
  { name: "Rashtriya Bal Swasthya Karyakram", category: "Health", description: "Healthcare services for children.", link: "https://nhm.gov.in/" },
  
  // Finance & Loans
  { name: "PM Jan Dhan Yojana", category: "Finance", description: "Financial inclusion program.", link: "https://pmjdy.gov.in/" },
  { name: "Atal Pension Yojana", category: "Finance", description: "Pension scheme for workers.", link: "https://npscra.nsdl.co.in/scheme-details.php" },
  { name: "Mahila Samman Savings Certificate", category: "Finance", description: "Special savings scheme for women.", link: "https://www.nsiindia.gov.in/" },
  { name: "Women’s Cooperative Societies Finance Scheme", category: "Finance", description: "Low-interest loans for women’s cooperatives.", link: "https://www.nabard.org/" },
  { name: "PM Vaya Vandana Yojana", category: "Finance", description: "Pension scheme for senior citizens.", link: "https://www.licindia.in/" },
  { name: "Credit Guarantee Fund Scheme for Micro & Small Enterprises", category: "Finance", description: "Credit guarantee for small businesses.", link: "https://www.cgtmse.in/" },
  
  // Agriculture
  { name: "PM Kisan Samman Nidhi", category: "Agriculture", description: "₹6000 per year for farmers.", link: "https://pmkisan.gov.in/" },
  { name: "Dairy Entrepreneurship Development Scheme (DEDS)", category: "Agriculture", description: "Credit-linked subsidy for dairy farming.", link: "https://dahd.nic.in/" },
  { name: "Pashu Kisan Credit Card Scheme", category: "Agriculture", description: "Loan scheme for livestock farming.", link: "https://www.nabard.org/" },
  { name: "Agriculture Infrastructure Fund (AIF)", category: "Agriculture", description: "Financial aid for women-led farm businesses.", link: "https://agriinfra.dac.gov.in/" },
  { name: "National Food Security Mission", category: "Agriculture", description: "Support for sustainable agriculture.", link: "https://nfsm.gov.in/" },
  { name: "Soil Health Card Scheme", category: "Agriculture", description: "Provides soil fertility information to farmers.", link: "https://soilhealth.dac.gov.in/" },
];

const categories = ["All", "Women Empowerment", "Finance", "Health", "Education", "Agriculture"];

const GovtSchemes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filtered Schemes
  const filteredSchemes = schemes.filter((scheme) => {
    return (
      (selectedCategory === "All" || scheme.category === selectedCategory) &&
      (scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       scheme.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="scheme_page">
      <div className="scheme_container">
      <header className="scheme_styled-header">
        <h2>Government Schemes</h2>
      </header>

        {/* Search and Filter */}
        <div className="scheme_search-container">
          <input 
            type="text" 
            className="scheme_search-box" 
            placeholder="Search Schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="scheme_category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Schemes List */}
        <div className="scheme_schemes-container">
          {filteredSchemes.length > 0 ? (
            filteredSchemes.map((scheme, index) => (
              <div key={index} className="scheme_scheme-card">
                <h3>{scheme.name}</h3>
                <hr className="scheme_card-divider" />
                <p>{scheme.description}</p>
                <div className="scheme_card-footer">
                  <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                    Learn More
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="scheme_no-results">No schemes found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovtSchemes;
