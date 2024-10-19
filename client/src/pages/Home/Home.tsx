import React, { useState } from "react";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import "./Home.css";

function Home() {
  //상태 끌어올리기
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="home">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Chat setIsOpen={setIsOpen} />
    </div>
  );
}

export default Home;