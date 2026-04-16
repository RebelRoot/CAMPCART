import React from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = getCurrentUser();

  const queryClient = useQueryClient();
 

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      newRequest.get(`/gigs/mygigs`).then((res) => res.data),
    onError: (err) => {
      console.error("Error fetching my gigs:", err);
    },
  });


  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/gigs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="myGigs">
      {isLoading ? (
        <div className="container">Loading your listings...</div>
      ) : error ? (
        <div className="container">
          <h1>Error loading your listings</h1>
          <p>Please try refreshing the page</p>
        </div>
      ) : data.length === 0 ? (
        <div className="container">
          <div className="title">
            <h1>My Listings</h1>
            {currentUser?.isSeller && (
              <Link to="/add">
                <button>Add New Listing</button>
              </Link>
            )}
          </div>
          <p>You haven't created any listings yet.</p>
          <Link to="/add">
            <button>Create your first listing</button>
          </Link>
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>My Listings</h1>
            {currentUser?.isSeller && (
              <Link to="/add">
                <button>Add New Listing</button>
              </Link>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((gig) => (
                <tr key={gig._id}>
                  <td>
                    <img className="image" src={gig.cover} alt="" />
                  </td>
                  <td>{gig.title}</td>
                  <td>{gig.price}</td>
                  <td>{gig.sales}</td>
                  <td>
                    <img
                      className="delete"
                      src="./img/delete.png"
                      alt=""
                      onClick={() => handleDelete(gig._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;
