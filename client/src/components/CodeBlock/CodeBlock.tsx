// CodeBlock.tsx

import React from "react";
import Highlight from "react-highlight";
import "highlight.js/styles/monokai-sublime.css";

interface CodeBlockProps {
  code: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, className }) => (
  <Highlight className="terraform">{code}</Highlight>
);

export default CodeBlock;
