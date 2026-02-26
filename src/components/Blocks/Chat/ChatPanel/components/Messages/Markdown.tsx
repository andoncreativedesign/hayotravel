"use client";

import Link from "next/link";
import { memo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./Markdown.module.scss";

const components: Partial<Components> = {
  code: ({ children }) => <code className={styles.code}>{children}</code>,
  pre: ({ children }) => <>{children}</>,
  a: ({ href, children, ...props }) => (
    <Link
      href={href ?? ""}
      target="_blank"
      rel="noreferrer"
      className={styles.link}
      {...props}>
      {children}
    </Link>
  ),
  ul: ({ children, ...props }) => (
    <ul className={styles.ul} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className={styles.ol} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className={styles.li} {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className={styles.strong} {...props}>
      {children}
    </strong>
  ),
  h1: ({ children, ...props }) => (
    <h1 className={styles.h1} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className={styles.h2} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className={styles.h3} {...props}>
      {children}
    </h3>
  ),
  br: () => <br />,
};

const remarkPlugins = [remarkGfm];

function UnmemoizedMarkdown({
  children,
  preserveLineBreaks = false,
}: {
  children: string;
  preserveLineBreaks?: boolean;
}) {
  // For user messages, convert single line breaks to double line breaks
  // to ensure they render as new paragraphs in Markdown
  const processedContent = preserveLineBreaks
    ? children.replace(/\n(?!\n)/g, "\n\n")
    : children;

  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(
  UnmemoizedMarkdown,
  (prev, next) =>
    prev.children === next.children &&
    prev.preserveLineBreaks === next.preserveLineBreaks
);
