import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/trustedBy/TrustedBy";
import Slide from "../../components/slide/Slide";
import CatCard from "../../components/catCard/CatCard";
import GigCard from "../../components/gigCard/GigCard";
import { cards } from "../../data";
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function Home() {
  const [slidesToShow, setSlidesToShow] = useState(5);
  const [arrowsScroll, setArrowsScroll] = useState(5);

  // Fetch newly listed items from API
  const { data: gigs, isLoading } = useQuery({
    queryKey: ["newGigs"],
    queryFn: () =>
      newRequest.get("/gigs/new?limit=8").then((res) => res.data),
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setSlidesToShow(1);
        setArrowsScroll(1);
      } else {
        setSlidesToShow(5);
        setArrowsScroll(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="home">
      <Featured />
      <TrustedBy />
      <div className="pop_services">
        <span className="title1">Popular on Campus</span>
        <Slide slidesToShow={slidesToShow} arrowsScroll={arrowsScroll}>
          {cards.map((card) => (
            <CatCard key={card.id} card={card} />
          ))}
        </Slide>
      </div>
      <div className="projects">
        <span className="title1">Recent listings on CampCart</span>
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : gigs?.length > 0 ? (
          <Slide slidesToShow={slidesToShow} arrowsScroll={arrowsScroll}>
            {gigs.map((gig) => (
              <GigCard key={gig._id} item={gig} />
            ))}
          </Slide>
        ) : (
          <div className="no-listings">No listings yet. Be the first to sell!</div>
        )}
      </div>
      <div className="features">
        <div className="container">
          <div className="item">
            <h1>Everything you need for campus life</h1>
            <div className="title">
              <img src="./img/check.png" alt="" />
              The best for every budget
            </div>
            <p>
              Find affordable textbooks, electronics, and furniture from seniors. Save money on every purchase.
            </p>
            <div className="title">
              <img src="./img/check.png" alt="" />
              Quality work done quickly
            </div>
            <p>
              Get help with assignments, projects, and tutoring from your seniors within minutes.
            </p>
            <div className="title">
              <img src="./img/check.png" alt="" />
              Protected payments, every time
            </div>
            <p>
              Meet in person on campus for secure exchanges. Pay only after you inspect the item.
            </p>
            <div className="title">
              <img src="./img/check.png" alt="" />
              Late night food delivery
            </div>
            <p>
              Late night hunger? Get Maggi, snacks & food delivered to your hostel room till 2 AM.
            </p>
          </div>
          <div className="item">
            <video
              src="https://fiverr-res.cloudinary.com/video/upload/t_fiverr_hd/vmvv3czyk2ifedefkau7"
              controls
              poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700"
            ></video>
          </div>
        </div>
      </div>
      <div className="explore">
        <div className="container">
          <h1>You need it, we've got it</h1>
          <div className="items">
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/graphics-design.d32a2f8.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Graphics & Design</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/online-marketing.74e221b.svg"
                alt=""
              />
              <div className="line"></div>

              <span>Digital Marketing</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/writing-translation.32ebe2e.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Writing & Translation</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/video-animation.f0d9d71.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Video & Animation</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/music-audio.320af20.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Music & Audio</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/programming.9362366.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Programming & Tech</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/business.bbdf319.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Business</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/lifestyle.745b575.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Lifestyle</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/data.718910f.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Data</span>
            </div>
            <div className="item">
              <img
                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/photography.01cf943.svg"
                alt=""
              />
              <div className="line"></div>
              <span>Photography</span>
            </div>
          </div>
        </div>
      </div>
      <div className="features dark">
        <div className="container">
          <div className="item">
            <h1>
              CampCart <i>Hostel</i>
            </h1>
            <h1>
              Late night delivery for <i>hungry students</i>
            </h1>
            <p>
              Get Maggi, snacks, and beverages delivered to your hostel room
              when the canteen is closed
            </p>
            <div className="title">
              <div className="purpule">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#B1ABFF"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.203.432a1.891 1.891 0 0 0-2.406 0l-1.113.912a1.904 1.904 0 0 1-.783.384l-1.395.318c-.88.2-1.503.997-1.5 1.915l.007 1.456c0 .299-.065.594-.194.863L.194 7.59a1.978 1.978 0 0 0 .535 2.388l1.12.903c.231.185.417.422.543.692l.615 1.314a1.908 1.908 0 0 0 2.166 1.063l1.392-.33c.286-.068.584-.068.87 0l1.392.33a1.908 1.908 0 0 0 2.166-1.063l.615-1.314c.126-.27.312-.507.542-.692l1.121-.903c.707-.57.93-1.563.535-2.388l-.625-1.309a1.983 1.983 0 0 1-.194-.863l.006-1.456a1.947 1.947 0 0 0-1.5-1.915L10.1 1.728a1.904 1.904 0 0 1-.784-.384L8.203.432Zm2.184 5.883a.742.742 0 0 0 0-1.036.71.71 0 0 0-1.018 0L6.565 8.135 5.095 6.73a.71.71 0 0 0-1.018.032.742.742 0 0 0 .032 1.036L6.088 9.69a.71.71 0 0 0 1.001-.016l3.297-3.359Z"
                  ></path>
                </svg>
              </div>
              Connect to sellers in your own hostel or nearby hostels
            </div>

            <div className="title">
              <div className="purpule">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#B1ABFF"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.203.432a1.891 1.891 0 0 0-2.406 0l-1.113.912a1.904 1.904 0 0 1-.783.384l-1.395.318c-.88.2-1.503.997-1.5 1.915l.007 1.456c0 .299-.065.594-.194.863L.194 7.59a1.978 1.978 0 0 0 .535 2.388l1.12.903c.231.185.417.422.543.692l.615 1.314a1.908 1.908 0 0 0 2.166 1.063l1.392-.33c.286-.068.584-.068.87 0l1.392.33a1.908 1.908 0 0 0 2.166-1.063l.615-1.314c.126-.27.312-.507.542-.692l1.121-.903c.707-.57.93-1.563.535-2.388l-.625-1.309a1.983 1.983 0 0 1-.194-.863l.006-1.456a1.947 1.947 0 0 0-1.5-1.915L10.1 1.728a1.904 1.904 0 0 1-.784-.384L8.203.432Zm2.184 5.883a.742.742 0 0 0 0-1.036.71.71 0 0 0-1.018 0L6.565 8.135 5.095 6.73a.71.71 0 0 0-1.018.032.742.742 0 0 0 .032 1.036L6.088 9.69a.71.71 0 0 0 1.001-.016l3.297-3.359Z"
                  ></path>
                </svg>
              </div>
              Find exactly what you need - textbooks, gadgets, or food
            </div>

            <div className="title">
              <div className="purpule">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#B1ABFF"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.203.432a1.891 1.891 0 0 0-2.406 0l-1.113.912a1.904 1.904 0 0 1-.783.384l-1.395.318c-.88.2-1.503.997-1.5 1.915l.007 1.456c0 .299-.065.594-.194.863L.194 7.59a1.978 1.978 0 0 0 .535 2.388l1.12.903c.231.185.417.422.543.692l.615 1.314a1.908 1.908 0 0 0 2.166 1.063l1.392-.33c.286-.068.584-.068.87 0l1.392.33a1.908 1.908 0 0 0 2.166-1.063l.615-1.314c.126-.27.312-.507.542-.692l1.121-.903c.707-.57.93-1.563.535-2.388l-.625-1.309a1.983 1.983 0 0 1-.194-.863l.006-1.456a1.947 1.947 0 0 0-1.5-1.915L10.1 1.728a1.904 1.904 0 0 1-.784-.384L8.203.432Zm2.184 5.883a.742.742 0 0 0 0-1.036.71.71 0 0 0-1.018 0L6.565 8.135 5.095 6.73a.71.71 0 0 0-1.018.032.742.742 0 0 0 .032 1.036L6.088 9.69a.71.71 0 0 0 1.001-.016l3.297-3.359Z"
                  ></path>
                </svg>
              </div>
              Support your fellow students - buy from seniors, sell to juniors
            </div>
            <button>Learn More</button>
          </div>
          <div className="item">
            <img
              src="https://www.architecture-asia.com/Assets/userfiles/images/progjects/fig1(2).jpg"
              alt="St. Andrews Girls Hostel"
            />
          </div>
        </div>
      </div>
      <div className="quote">
        <div className="container">
          <div className="right">
            <img
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600"
              alt=""
            />
          </div>
          <div className="left">
            <div className="title3">
              <span>Rohan Sharma, 3rd Year Computer Science</span>
              <hr />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                alt=""
              />
            </div>
            <div className="desc">
              <span>
                "I've saved thousands on textbooks and electronics through CampCart.
                Sold my old laptop to a junior and found a great tutor for my programming course.
                It's the best platform for students!"
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="banner">
        <div className="container">
          <div className="content">
            <span>
              Buy, Sell, Learn - <span>All on Campus</span>.
            </span>
            <button>Join CampCart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
