import React from "react";
import Slider from "react-slick";
import "./IntroSection.css";
const IntroSection = () => {
  const introData = [
    { id: 1, content: "Welcome to our platform! Discover amazing features." },
    { id: 2, content: "Join us today and start your journey!" },
    { id: 3, content: "Experience seamless integration and powerful tools." },
  ];
  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Slider {...settings} className="contents">
      {introData.map((slide) => (
        <div key={slide.id} className="intro-content">
          <p>{slide.content}</p>
        </div>
      ))}
    </Slider>
  );
};

export default IntroSection;
