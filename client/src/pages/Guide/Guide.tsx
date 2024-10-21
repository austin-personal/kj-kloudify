import React from "react";
import './Guide.css'
import GuideForm from '../../components/GuidePage/GuideForm';
import KeyForm from '../../components/GuidePage/KeyForm'

const Guide: React.FC = () => {
    return (
        <div className="guide-page">
            <KeyForm/>
            <GuideForm/>
        </div>
    )
}

export default Guide;