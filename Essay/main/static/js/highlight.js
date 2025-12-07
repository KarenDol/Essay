const Inline = Quill.import("blots/inline");

class HighlightBlot extends Inline {
  static sanitize = true;

  static create(commentId) {
    let node = super.create();
    node.setAttribute("data-comment-id", commentId);
    node.classList.add("highlight");   // highlight color
    return node;
  }

  static formats(node) {
    return node.getAttribute("data-comment-id");
  }
}

HighlightBlot.blotName = "highlight";
HighlightBlot.tagName = "span";

Quill.register(HighlightBlot);