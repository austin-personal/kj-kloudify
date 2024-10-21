import React from "react";

interface previousChatsProp {
    previousChats: string[];
}

const PreviousChat: React.FC<previousChatsProp> = (previousChats) => {
    return (
        <div>
            <h3>Previous Chat</h3>
            {previousChats.previousChats.map((chat) => (
                <div>
                    {chat}
                </div>
            ))}
        </div>
    )
}

export default PreviousChat