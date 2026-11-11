import { useEffect, useId, useMemo, useState } from "react";
import { deleteField, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { SITE_DEFAULTS } from "../../content/siteDefaults";
import { CONTENT_SECTIONS } from "../../content/contentSchema";
import { normalizeContent, safeLink } from "../../content/useSiteContent";
import { uploadImage } from "../../content/uploadImage";
import { FESTIVAL_STATUS_TEXT, getFestivalStatus } from "../../content/festival";
import "./ContentEditor.css";

// Empty value for a new list item, based on the field type
function blankValue(field) {
  switch (field.type) {
    case "number":
      return 0;
    case "toggle":
      return false;
    case "select":
      return field.options?.[0]?.value || "";
    case "list":
      return [];
    default:
      return "";
  }
}

function blankItem(listField) {
  if (!listField.fields) return "";
  const item = {};
  listField.fields.forEach((field) => {
    item[field.name] = blankValue(field);
  });
  return item;
}

// Collect problems before saving (only links need checking)
function findErrors(fields, value, prefix = "") {
  const errors = [];

  fields.forEach((field) => {
    const fieldValue = value?.[field.name];
    const label = prefix + field.label;

    if (field.type === "link" && fieldValue && safeLink(fieldValue, "") === "") {
      errors.push(`${label}: use a link starting with https://, #section, mailto: or tel:`);
    }

    if (field.type === "list" && field.fields && Array.isArray(fieldValue)) {
      fieldValue.forEach((item, index) => {
        errors.push(
          ...findErrors(field.fields, item, `${label} → ${field.itemLabel || "Item"} ${index + 1} → `)
        );
      });
    }
  });

  return errors;
}

function ImageField({ value, onChange, folder }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="ce-image">
      {value ? (
        <img src={value} alt="" className="ce-image-preview" />
      ) : (
        <div className="ce-image-empty">No image</div>
      )}

      <div className="ce-image-actions">
        <label className="admin-secondary-button ce-upload-button">
          {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            disabled={uploading}
            hidden
          />
        </label>

        {value && (
          <button type="button" className="admin-danger-button" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>

      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

function ListField({ field, value, onChange, folder }) {
  const items = Array.isArray(value) ? value : [];
  const isObjectList = Boolean(field.fields);

  const update = (index, nextItem) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index) => {
    if (isObjectList && !window.confirm(`Remove ${field.itemLabel || "item"} ${index + 1}?`)) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const itemControls = (index) => (
    <div className="ce-item-controls">
      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
        ↑
      </button>
      <button
        type="button"
        onClick={() => move(index, 1)}
        disabled={index === items.length - 1}
        aria-label="Move down"
      >
        ↓
      </button>
      <button type="button" className="ce-remove" onClick={() => remove(index)} aria-label="Remove">
        ✕
      </button>
    </div>
  );

  return (
    <div className="ce-list">
      {items.map((item, index) =>
        isObjectList ? (
          <details className="ce-list-item" key={index}>
            <summary>
              <span>
                {field.itemLabel || "Item"} {index + 1}
                <b>{item?.name || item?.title || item?.text || item?.value || ""}</b>
              </span>
              {itemControls(index)}
            </summary>

            <div className="ce-list-item-body">
              {field.fields.map((subField) => (
                <FieldEditor
                  key={subField.name}
                  field={subField}
                  value={item?.[subField.name]}
                  folder={folder}
                  onChange={(subValue) => update(index, { ...item, [subField.name]: subValue })}
                />
              ))}
            </div>
          </details>
        ) : (
          <div className="ce-list-row" key={index}>
            {field.itemType === "textarea" ? (
              <textarea rows={3} value={item} onChange={(event) => update(index, event.target.value)} />
            ) : (
              <input type="text" value={item} onChange={(event) => update(index, event.target.value)} />
            )}
            {itemControls(index)}
          </div>
        )
      )}

      <button
        type="button"
        className="ce-add"
        onClick={() => onChange([...items, blankItem(field)])}
      >
        + Add {field.itemLabel || "item"}
      </button>
    </div>
  );
}

function FieldEditor({ field, value, onChange, folder }) {
  const id = useId();

  let input;
  switch (field.type) {
    case "textarea":
      input = (
        <textarea
          id={id}
          rows={4}
          maxLength={field.max}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case "number":
      input = (
        <input
          id={id}
          type="number"
          min="0"
          value={value ?? 0}
          onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
        />
      );
      break;
    case "toggle":
      return (
        <label className="ce-toggle">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
          <span className="ce-toggle-track" aria-hidden="true" />
          <span>{field.label}</span>
        </label>
      );
    case "select":
      input = (
        <select id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "date":
      input = <input id={id} type="date" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />;
      break;
    case "image":
      input = <ImageField value={value} onChange={onChange} folder={folder} />;
      break;
    case "list":
      input = <ListField field={field} value={value} onChange={onChange} folder={folder} />;
      break;
    default:
      input = (
        <input
          id={id}
          type={field.type === "link" ? "url" : "text"}
          maxLength={field.max}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }

  return (
    <div className={`ce-field ce-field-${field.type}`}>
      <label htmlFor={id}>{field.label}</label>
      {input}
      {field.help && <small>{field.help}</small>}
    </div>
  );
}

export default function ContentEditor({ sectionKeys }) {
  const sections = useMemo(
    () => CONTENT_SECTIONS.filter((section) => !sectionKeys || sectionKeys.includes(section.key)),
    [sectionKeys]
  );

  const [activeKey, setActiveKey] = useState(sections[0]?.key);
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const section = sections.find((item) => item.key === activeKey);
  const defaults = SITE_DEFAULTS[activeKey];
  const dirty = saved && draft && JSON.stringify(saved) !== JSON.stringify(draft);

  // Load the saved content of the selected section
  useEffect(() => {
    setSaved(null);
    setDraft(null);
    setMessage("");
    setErrors([]);

    const unsubscribe = onSnapshot(
      doc(db, "siteContent", activeKey),
      (snapshot) => {
        const stored = snapshot.exists() ? snapshot.data()?.content : null;
        const content = stored ? normalizeContent(defaults, stored) : defaults;
        setSaved(content);
        setDraft((current) => current ?? content);
      },
      (error) => {
        console.error("Could not load content:", error);
        setErrors(["Could not load this section. Check your internet and Firestore permissions."]);
        setSaved(defaults);
        setDraft((current) => current ?? defaults);
      }
    );

    return unsubscribe;
  }, [activeKey, defaults]);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function selectSection(key) {
    if (key === activeKey) return;
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setActiveKey(key);
  }

  async function handleSave() {
    const problems = findErrors(section.fields, draft);
    setErrors(problems);
    setMessage("");
    if (problems.length) return;

    setSaving(true);
    try {
      await setDoc(
        doc(db, "siteContent", activeKey),
        { content: draft, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSaved(draft);
      setMessage("Saved! The website is updated.");
    } catch (error) {
      console.error("Save failed:", error);
      setErrors([
        error.code === "permission-denied"
          ? "Save blocked by Firestore rules. The admin needs write access to siteContent."
          : "Save failed. Please check your internet and try again.",
      ]);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm(`Reset "${section.label}" to the original website content?`)) return;

    setSaving(true);
    setErrors([]);
    try {
      await setDoc(
        doc(db, "siteContent", activeKey),
        { content: deleteField(), updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSaved(defaults);
      setDraft(defaults);
      setMessage("Reset to the original content.");
    } catch (error) {
      console.error("Reset failed:", error);
      setErrors(["Reset failed. Please try again."]);
    } finally {
      setSaving(false);
    }
  }

  const festivalStatus = activeKey === "festival" && draft ? getFestivalStatus(draft) : null;

  return (
    <section className={`content-editor ${sections.length === 1 ? "is-single" : ""}`}>
      {sections.length > 1 && (
        <nav className="ce-sections" aria-label="Website sections">
          {sections.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === activeKey ? "active" : ""}
              onClick={() => selectSection(item.key)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <div className="admin-panel-card ce-panel">
        <div className="ce-header">
          <div>
            <p className="admin-eyebrow">WEBSITE CONTENT</p>
            <h2>{section.label}</h2>
            <p className="admin-muted">{section.description}</p>
          </div>

          {section.anchor !== undefined && (
            <a className="admin-secondary-button" href={`/#${section.anchor}`} target="_blank" rel="noreferrer">
              View on website ↗
            </a>
          )}
        </div>

        {festivalStatus && (
          <p className={`ce-festival-status is-${festivalStatus}`}>
            <i aria-hidden="true" /> {FESTIVAL_STATUS_TEXT[festivalStatus]}
            {dirty && " (after you save)"}
          </p>
        )}

        {errors.length > 0 && (
          <div className="admin-error" role="alert">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        {message && !dirty && <p className="admin-success" role="status">{message}</p>}

        {!draft ? (
          <p className="admin-muted">Loading…</p>
        ) : (
          <div className="ce-form">
            {section.fields.map((field) => (
              <FieldEditor
                key={field.name}
                field={field}
                value={draft[field.name]}
                folder={activeKey}
                onChange={(value) => setDraft({ ...draft, [field.name]: value })}
              />
            ))}
          </div>
        )}

        <div className={`ce-save-bar ${dirty ? "is-dirty" : ""}`}>
          <span>{dirty ? "You have unsaved changes" : "All changes saved"}</span>

          <div>
            <button type="button" className="admin-secondary-button" onClick={handleReset} disabled={saving}>
              Reset to default
            </button>
            {dirty && (
              <button type="button" className="admin-secondary-button" onClick={() => setDraft(saved)} disabled={saving}>
                Undo changes
              </button>
            )}
            <button type="button" className="admin-primary-button" onClick={handleSave} disabled={!dirty || saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
