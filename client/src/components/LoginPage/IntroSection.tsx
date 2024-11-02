import React from "react";
import Slider from "react-slick";
import "./IntroSection.css";
import loginImg from "../../img/login3.svg";
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
    <>
      <div className="img-container">
        <div className="gra-img">
          <h3 className="title-start">
            당신의 클라우드 비전,
            <br /> 현실로 바꾸세요.
          </h3>
          <p className="title-middle">
            Kloudify의 아키텍처 설계와 배포, 그 어떤 것도 어렵지 않습니다.
            아이디어만 있으면 됩니다. Kloudify가 나머지를 처리하니까요.
            자연스러운 대화만으로 복잡한 인프라를 설계하고, 서비스 간의 관계를
            시각화해보세요. 한 번의 클릭으로 최적화된 클라우드 배포까지. 기술의
            복잡함을 줄이고, 당신의 아이디어에만 집중하세요.
          </p>
          <div className="title-end">
            아이디어에서 실행까지,
            <br /> Kloudify로
          </div>
        </div>
      </div>
      {/* <Slider {...settings} className="contents">
        {introData.map((slide) => (
          <div key={slide.id} className="intro-content">
            <p>{slide.content}</p>
          </div>
        ))}
      </Slider> */}
    </>
  );
};

export default IntroSection;
