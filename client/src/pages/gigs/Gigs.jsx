import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

function Gigs() {
  const [sort, setSort] = useState("createdAt");  // Default to newest first
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();

  const { search } = useLocation();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", search, sort],
    queryFn: async () => {
      const min = minRef.current?.value || 0;
      const max = maxRef.current?.value || 999999;
      const searchParams = new URLSearchParams(search.replace(/^\?/, ''));
      searchParams.set('min', min);
      searchParams.set('max', max);
      let currentSort = sort;
      let order = "desc";
      
      if (sort.includes("-")) {
        const [field, dir] = sort.split("-");
        currentSort = field;
        order = dir === "asc" ? "asc" : "desc";
      }
      
      searchParams.set('sort', currentSort);
      searchParams.set('order', order);
      
      const url = `/gigs?${searchParams.toString()}`;
      console.log("Fetching from URL:", url);
      
      try {
        const res = await newRequest.get(url);
        console.log("API Response:", res.data);
        return res.data;
      } catch (err) {
        console.error("API Error:", err);
        throw err;
      }
    },
  });

  console.log(data);

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort, search]);

  const apply = () => {
    refetch();
  };
  
  // Debug logging
  useEffect(() => {
    console.log("Gigs data:", data);
    console.log("Gigs error:", error);
  }, [data, error]);

  // Get category from URL search params
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get("cat");
  const categoryNames = {
    books: "Used Books & Notes",
    electronics: "Electronics & Gadgets",
    furniture: "Furniture",
    tutoring: "Tutoring & Academic Help",
    assignments: "Assignments & Projects",
    food: "Late Night Food",
    design: "Design Help",
    coding: "Coding Help",
    essentials: "Hostel Essentials",
    services: "Other Services"
  };

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">CampCart &gt; {category ? categoryNames[category] : "All Listings"} &gt;</span>
        <h1>{category ? categoryNames[category] : "All Campus Listings"}</h1>
        <p>
          {category 
            ? `Browse ${categoryNames[category].toLowerCase()} from students on your campus`
            : "Discover textbooks, electronics, services, and more from fellow students"}
        </p>
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={apply}>Apply</button>
          </div>
          <div className="right">
            <div className="sort-container">
              <span className="sortType" onClick={() => setOpen(!open)}>
                {sort === "createdAt" ? "Newest First" : 
                 sort === "price-asc" ? "Price: Low to High" :
                 sort === "price-desc" ? "Price: High to Low" :
                 sort === "sales" ? "Best Selling" : "Recommended"}
                <img src="./img/down.png" alt="" />
              </span>
              {open && (
                <div className="rightMenu">
                  <span onClick={() => reSort("createdAt")}>Newest First</span>
                  <span onClick={() => reSort("price-asc")}>Price: Low to High</span>
                  <span onClick={() => reSort("price-desc")}>Price: High to Low</span>
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="cards">
          {isLoading
            ? "loading"
            : error
            ? "Something went wrong!"
            : data && data.map((gig) => <GigCard key={gig._id} item={gig} />)}
        </div>
      </div>
    </div>
  );
}

export default Gigs;