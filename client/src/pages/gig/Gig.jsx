import React, { useState } from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import moment from "moment";
import { toast } from "react-toastify";

function Gig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCodModal, setShowCodModal] = useState(false);
  const [submittingCod, setSubmittingCod] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const userId = data?.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  return (
    <div className="gig">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">
              CampCart {">"} Graphics & Design {">"}
            </span>
            <h1>{data.title}</h1>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"}
                  alt=""
                />
                <span>{dataUser.username}</span>
                {!isNaN(data.totalStars / data.starNumber) && (
                  <div className="stars">
                    {Array(Math.round(data.totalStars / data.starNumber))
                      .fill()
                      .map((item, i) => (
                        <img src="/img/star.png" alt="" key={i} />
                      ))}
                    <span>{Math.round(data.totalStars / data.starNumber)}</span>
                  </div>
                )}
              </div>
            )}
            {data.cover || (data.images && data.images.length > 0) ? (
              <Slider slidesToShow={1} arrowsScroll={1} className="slider">
                {data.cover && <img key="cover" src={data.cover} alt="" />}
                {data.images && data.images.map((img) => (
                  <img key={img} src={img} alt="" />
                ))}
              </Slider>
            ) : (
              <img src="/img/noimage.png" alt="No images" className="slider" />
            )}
            <h2>About This Gig</h2>
            <p>{data.desc}</p>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img src={dataUser.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"} alt="" />
                  <div className="info">
                    <span>{dataUser.username}</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="stars">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((item, i) => (
                            <img src="/img/star.png" alt="" key={i} />
                          ))}
                        <span>
                          {Math.round(data.totalStars / data.starNumber)}
                        </span>
                      </div>
                    )}
                    <button>Contact Me</button>
                  </div>
                </div>
                <div className="box">
                  <div className="items">
                    <div className="item">
                      <span className="title">From</span>
                      <span className="desc">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title">Member since</span>
                      <span className="desc">Aug 2022</span>
                    </div>
                    <div className="item">
                      <span className="title">Avg. response time</span>
                      <span className="desc">4 hours</span>
                    </div>
                    <div className="item">
                      <span className="title">Last delivery</span>
                      <span className="desc">1 day</span>
                    </div>
                    <div className="item">
                      <span className="title">Languages</span>
                      <span className="desc">English</span>
                    </div>
                  </div>
                  <hr />
                  <p>{dataUser.desc}</p>
                </div>
              </div>
            )}
            <Reviews gigId={id} />
          </div>
          <div className="right">
            <div className="price">
              <h3>{data.shortTitle}</h3>
              <h2>₹ {data.price}</h2>
            </div>
            <p>{data.shortDesc}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryDate} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>{data.revisionNumber} Revisions</span>
              </div>
            </div>
            <div className="features">
              {data.features.map((feature) => (
                <div className="item" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="payment-options">
              <button 
                className="prepaid-btn"
                onClick={async () => {
                  if (!currentUser) {
                    toast.error("You have to login to make orders!", { position: "top-center" });
                    return;
                  }
                  try {
                    const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
                    navigate(`/pay/${res.data}`);
                  } catch (err) {
                    console.log(err);
                  }
                }}
              >
                Continue (Prepaid)
              </button>
              <button 
                className="cod-btn" 
                onClick={() => {
                  if (!currentUser) {
                    toast.error("You have to login to make orders!", { position: "top-center" });
                    return;
                  }
                  setShowCodModal(true);
                }}
              >
                Order with COD
              </button>
            </div>
          </div>
          
          {showCodModal && (
            <div className="cod-modal-overlay">
              <div className="cod-modal">
                <h2>COD Confirmation</h2>
                <div className="status-badge">Composer</div>
                
                <div className="summary">
                  <div className="line">
                    <span>Base Price:</span>
                    <span>₹{data.price}</span>
                  </div>
                  <div className="line">
                    <span>COD Fee (Late Charge):</span>
                    <span>₹{data.codFee || 0}</span>
                  </div>
                  <hr />
                  <div className="line total">
                    <span>Total Amount:</span>
                    <span>₹{data.price + (data.codFee || 0)}</span>
                  </div>
                </div>

                <div className="timeline-box">
                  <h3>🚚 Estimated Delivery Timeline</h3>
                  <p>Order will be delivered between:</p>
                  <div className="window">
                    <strong>{moment().add(Math.max(0, data.deliveryTime - 2), 'hours').format('MMM Do, h:mm A')}</strong>
                    <span>to</span>
                    <strong>{moment().add(data.deliveryTime, 'hours').format('MMM Do, h:mm A')}</strong>
                  </div>
                  <p className="notice">Note: ₹{data.codFee || 0} late charge applies for COD service availability.</p>
                </div>

                <p className="confirm-text">Do you want to confirm this order?</p>

                <div className="actions">
                  <button className="cancel" onClick={() => setShowCodModal(false)}>No, Cancel</button>
                  <button 
                    className="confirm" 
                    disabled={submittingCod}
                    onClick={async () => {
                      setSubmittingCod(true);
                      try {
                        const timeline = `${moment().add(Math.max(0, data.deliveryTime - 2), 'hours').format('h:mm A')} - ${moment().add(data.deliveryTime, 'hours').format('MMM Do, h:mm A')}`;
                        await newRequest.post(`/orders/create-cod/${id}`, {
                          deliveryTimeline: timeline
                        });
                        navigate("/orders");
                      } catch (err) {
                        console.log(err);
                      } finally {
                        setSubmittingCod(false);
                      }
                    }}
                  >
                    {submittingCod ? "Confirming..." : "Yes, Confirm Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Gig;
