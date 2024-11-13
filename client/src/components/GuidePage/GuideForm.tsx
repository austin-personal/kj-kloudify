import React from "react";
import "./GuideForm.css";
import img1 from "../../img/1.png"
import img2 from "../../img/2.png"
import img3 from "../../img/3.png"
import img4 from "../../img/4.png"
import img5 from "../../img/5.png"
import img6 from "../../img/6.png"

interface GuideFormProps {
  handleSubmit: () => void;
}

const GuideForm: React.FC<GuideFormProps> = ({
  handleSubmit,
}) => {
  return (
    <div className="guide-form">
      <div className="guide-frame-th">
        <div className="instruction">
          <h2>Guide</h2>
          <div className="guide-line">
            <h4>aws_access_key_id와 aws_secret_access_key 생성하기</h4>
            1. AWS Management Console에 로그인합니다.
            <img src={img1} />
            <br />
            2. 상단의 검색창에 "IAM"을 입력하고 IAM 서비스를 선택합니다.
            <img src={img2} />
            <br />
            3. 왼쪽 메뉴에서 Users를 선택한 후, 사용자 목록에서 키를 발급받을 사용자를 선택하거나 새 사용자를 생성합니다.
            <img src={img3} />
            <br />
            4, 사용자를 선택한 후 Security credentials 탭으로 이동합니다.
            <img src={img4} />
            <br />
            5. Create access key 버튼을 클릭합니다.
            <img src={img5} />
            <br />
            6. 새로 생성된 aws_access_key_id와 aws_secret_access_key가 표시되며, 이 정보는 파일로 다운로드하거나 복사해두어야 합니다. (이후에 다시 볼 수 없으니 꼭 저장해두세요!)
            <img src={img6} />
          </div>
        </div>
        <button className="submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default GuideForm;
