"use client";

import { FC } from "react";

interface MarkdownProps {
  children: string;
}

export const Markdown: FC<MarkdownProps> = ({ children }) => {
  const formattedContent = children
    .replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-gray-800 p-3 rounded-md overflow-x-auto text-sm my-2"><code>${code
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code></pre>`;
    })
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">$1</code>',
    )
    .replace(
      /^### (.*$)/gm,
      '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>',
    )
    .replace(
      /^## (.*$)/gm,
      '<h2 class="text-2xl font-semibold mt-5 mb-2">$1</h2>',
    )
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .split("\n\n")
    .join('</p><p class="">');

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{
        __html: `<p class="">${formattedContent}</p>`,
      }}
    />
  );
};

export const PreservedMarkdown = ({ content }: { content: string }) => {
  const formattedContent = content
    .replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-gray-800 p-3 rounded-md overflow-x-auto text-sm my-2"><code>${code
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code></pre>`;
    })
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">$1</code>',
    )
    .replace(
      /^(### )(.*$)/gm,
      '<span class="text-purple-600 dark:text-purple-400">$1</span><span class="font-semibold mt-4 mb-2 text-purple-600 dark:text-purple-400">$2</span>',
    )
    .replace(
      /^(## )(.*$)/gm,
      '<span class="text-blue-600 dark:text-blue-400">$1</span><span class="font-semibold mt-5 mb-2 text-blue-600 dark:text-blue-400">$2</span>',
    )
    .replace(
      /^(# )(.*$)/gm,
      '<span class="text-pink-600 text-lg dark:text-pink-400">$1</span><span class="font-bold mt-6 text-lg mb-3 text-pink-600 dark:text-pink-400">$2</span>',
    )
    .replace(
      /^(\* )(.*$)/gm,
      '<span class="text-gray-500">$1</span><span class="ml-0">$2</span>',
    )
    .replace(
      /^(- )(.*$)/gm,
      '<span class="text-gray-500">$1</span><span class="ml-0">$2</span>',
    )
    .split("\n\n")
    .join('</p><p class="ml-0">');

  return (
    <div
      className="whitespace-pre-wrap overflow-y-auto"
      dangerouslySetInnerHTML={{
        __html: `<p class="text-sm ml-0">${formattedContent}</p>`,
      }}
    />
  );
};
