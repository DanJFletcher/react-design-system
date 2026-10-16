import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./RichTextEditor.module.css";

export type RichTextEditorDocument = JSONContent;

export interface RichTextEditorProps {
  label: string;
  description?: string;
  value?: RichTextEditorDocument;
  defaultValue?: RichTextEditorDocument;
  onChange?: (value: RichTextEditorDocument) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  style?: DesignSystemStyle;
}

type InsertForm = "link" | "image" | null;

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.toolButton}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function applyLink(editor: Editor, href: string, text: string) {
  const { empty } = editor.state.selection;
  if (!empty) {
    editor.chain().focus().setLink({ href }).run();
    return;
  }
  editor.chain().focus().insertContent({
    type: "text",
    text,
    marks: [{ type: "link", attrs: { href } }],
  }).run();
  // Keep the caret outside the newly inserted link.
  editor.commands.focus();
}

export function RichTextEditor({
  label,
  description,
  value,
  defaultValue,
  onChange,
  placeholder = "Start writing…",
  readOnly = false,
  disabled = false,
  className,
  style,
}: RichTextEditorProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const controlled = value !== undefined;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [form, setForm] = useState<InsertForm>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [linkText, setLinkText] = useState("");
  const [formError, setFormError] = useState("");
  const lastEmitted = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? defaultValue ?? { type: "doc", content: [{ type: "paragraph" }] },
    editable: !disabled && !readOnly,
    onUpdate: ({ editor: current }) => {
      const document = current.getJSON();
      const serialized = JSON.stringify(document);
      if (serialized === lastEmitted.current) return;
      lastEmitted.current = serialized;
      onChangeRef.current?.(document);
    },
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": `${id}-label`,
        ...(descriptionId ? { "aria-describedby": descriptionId } : {}),
        "aria-disabled": disabled ? "true" : "false",
        "aria-readonly": readOnly ? "true" : "false",
        spellcheck: "true",
      },
    },
  });
  const editorState = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      heading: current?.isActive("heading", { level: 1 }) ? "h1"
        : current?.isActive("heading", { level: 2 }) ? "h2"
          : current?.isActive("heading", { level: 3 }) ? "h3" : "paragraph",
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      blockquote: current?.isActive("blockquote") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !readOnly);
  }, [editor, disabled, readOnly]);

  useEffect(() => {
    if (!editor || !controlled || value === undefined) return;
    const incoming = JSON.stringify(value);
    if (incoming !== JSON.stringify(editor.getJSON())) {
      lastEmitted.current = incoming;
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, controlled, value]);

  const unavailable = !editor || disabled || readOnly;
  const classes = [styles.root, className].filter(Boolean).join(" ");

  function openForm(kind: Exclude<InsertForm, null>) {
    setUrl("");
    setAlt("");
    setLinkText("");
    setFormError("");
    setForm(kind);
  }

  function submitInsert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeEditor = editor!;
    const activeForm = form!;
    if (!isWebUrl(url.trim())) {
      setFormError("Enter a valid HTTP or HTTPS URL.");
      return;
    }
    if (activeForm === "image") {
      if (!alt.trim()) {
        setFormError("Add alternative text for this image.");
        return;
      }
      activeEditor.chain().focus().setImage({ src: url.trim(), alt: alt.trim() }).run();
    } else {
      applyLink(activeEditor, url.trim(), linkText.trim() || url.trim());
    }
    setForm(null);
  }

  return (
    <section className={classes} style={style as CSSProperties | undefined} data-disabled={disabled || undefined}>
      <div className={styles.fieldHeader}>
        <div id={`${id}-label`} className={styles.label}>{label}</div>
        {description && <div id={descriptionId} className={styles.description}>{description}</div>}
      </div>
      <div className={styles.surface} data-readonly={readOnly || undefined}>
        <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`} aria-orientation="horizontal">
          <div className={styles.group} role="group" aria-label="Text style">
            <label className={styles.visuallyHidden} htmlFor={`${id}-block-style`}>Block style</label>
            <select
              id={`${id}-block-style`}
              className={styles.blockSelect}
              aria-label="Block style"
              disabled={unavailable}
              value={editorState.heading}
              onChange={(event) => {
                const activeEditor = editor!;
                const choice = event.currentTarget.value;
                if (choice === "paragraph") activeEditor.chain().focus().setParagraph().run();
                else activeEditor.chain().focus().toggleHeading({ level: Number(choice.slice(1)) as 1 | 2 | 3 }).run();
              }}
            >
              <option value="paragraph">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <div className={styles.group} role="group" aria-label="Inline formatting">
            <ToolButton label="Bold" active={editorState.bold} disabled={unavailable} onClick={() => editor?.chain().focus().toggleBold().run()} />
            <ToolButton label="Italic" active={editorState.italic} disabled={unavailable} onClick={() => editor?.chain().focus().toggleItalic().run()} />
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <div className={styles.group} role="group" aria-label="Blocks">
            <ToolButton label="Bulleted list" active={editorState.bulletList} disabled={unavailable} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
            <ToolButton label="Numbered list" active={editorState.orderedList} disabled={unavailable} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
            <ToolButton label="Blockquote" active={editorState.blockquote} disabled={unavailable} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <div className={styles.group} role="group" aria-label="Insert">
            <ToolButton label="Insert link" disabled={unavailable} onClick={() => openForm("link")} />
            <ToolButton label="Insert image" disabled={unavailable} onClick={() => openForm("image")} />
          </div>
          <span className={styles.toolbarSpacer} />
          <div className={styles.group} role="group" aria-label="History">
            <ToolButton label="Undo" disabled={unavailable || !editorState.canUndo} onClick={() => editor?.chain().focus().undo().run()} />
            <ToolButton label="Redo" disabled={unavailable || !editorState.canRedo} onClick={() => editor?.chain().focus().redo().run()} />
          </div>
        </div>
        {form && (
          <form className={styles.insertForm} onSubmit={submitInsert} aria-label={form === "link" ? "Insert link" : "Insert image"}>
            <div className={styles.formHeading}>{form === "link" ? "Add a link" : "Add an image"}</div>
            <label className={styles.formField}>
              <span>{form === "link" ? "Destination URL" : "Image URL"}</span>
              <input autoFocus type="url" value={url} onChange={(event) => setUrl(event.currentTarget.value)} placeholder="https://…" required />
            </label>
            {form === "link" ? (
              <label className={styles.formField}>
                <span>Link text <span className={styles.optional}>(when no text is selected)</span></span>
                <input value={linkText} onChange={(event) => setLinkText(event.currentTarget.value)} />
              </label>
            ) : (
              <label className={styles.formField}>
                <span>Alternative text</span>
                <input value={alt} onChange={(event) => setAlt(event.currentTarget.value)} required />
              </label>
            )}
            {formError && <div className={styles.formError} role="alert">{formError}</div>}
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className={styles.submitButton}>Insert {form}</button>
            </div>
          </form>
        )}
        <div className={styles.editorFrame} data-disabled={disabled || undefined}>
          <EditorContent editor={editor} className={styles.editorContent} />
        </div>
      </div>
      <div className={styles.srOnly} aria-live="polite">{readOnly ? "Read only" : disabled ? "Disabled" : ""}</div>
    </section>
  );
}
