import React, { Fragment } from "react";
import escapeHTML from "escape-html";
import { Text } from "slate";

// This is used to display the 'rich text' payload data type as as React component.
const SerializeRichText = (children) =>
  children.map((node, i) => {
    if (Text.isText(node)) {
      let text = (
        <span dangerouslySetInnerHTML={{ __html: escapeHTML(node.text) }} />
      );

      if (node.bold) {
        text = <strong key={i}>{text}</strong>;
      }

      if (node.code) {
        text = <code key={i}>{text}</code>;
      }

      if (node.italic) {
        text = <em key={i}>{text}</em>;
      }

      // Handle other leaf types here...

      return <Fragment key={i}>{text}</Fragment>;
    }

    if (!node) {
      return null;
    }

    switch (node.type) {
      case "h1":
        return <h1 key={i}>{SerializeRichText(node.children)}</h1>;
      // Iterate through all headings here...
      case "h6":
        return <h6 key={i}>{SerializeRichText(node.children)}</h6>;
      case "blockquote":
        return (
          <blockquote key={i}>{SerializeRichText(node.children)}</blockquote>
        );
      case "ul":
        return <ul key={i}>{SerializeRichText(node.children)}</ul>;
      case "ol":
        return <ol key={i}>{SerializeRichText(node.children)}</ol>;
      case "li":
        return <li key={i}>{SerializeRichText(node.children)}</li>;
      case "link":
        return (
          <a href={escapeHTML(node.url)} key={i}>
            {SerializeRichText(node.children)}
          </a>
        );

      default:
        return <p key={i}>{SerializeRichText(node.children)}</p>;
    }
  });

export default SerializeRichText;
