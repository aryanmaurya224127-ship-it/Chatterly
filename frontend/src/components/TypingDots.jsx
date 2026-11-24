import React from "react";
export default function TypingDots({ name }) { return name ? <div className="typing-line"><span className="dots"><i></i><i></i><i></i></span>{name} is typing</div> : null; }
