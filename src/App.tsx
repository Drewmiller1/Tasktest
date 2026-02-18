import { useState, useRef, useCallback } from "react";

interface CardType {
  id: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
}

interface ColumnType {
  id: string;
  title: string;
  color: string;
  cards: CardType[];
}

interface BoardData {
  columns: ColumnType[];
}

const INITIAL_DATA: BoardData = {
  columns: [
    {
      id: "todo",
      title: "To Do",
      color: "#6C8EBF",
      cards: [
        { id: "c1", title: "Research competitors", desc: "Analyze top 5 competitors", tag: "Research", tagColor: "#E8F4FD" },
        { id: "c2", title: "Set up project repo", desc: "", tag: "Dev", tagColor: "#E8F8F0" },
      ],
    },
    {
      id: "inprogress",
      title: "In Progress",
      color: "#D4A843",
      cards: [
        { id: "c3", title: "Design wireframes", desc: "Create lo-fi mockups for all screens", tag: "Design", tagColor: "#FEF9E7" },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "#9B6DBF",
      cards: [
        { id: "c4", title: "Landing page copy", desc: "Needs final approval", tag: "Content", tagColor: "#F5EEF8" },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "#58A87B",
      cards: [
        { id: "c5", title: "Kickoff meeting", desc: "All stakeholders aligned", tag: "Meeting", tagColor: "#E8F8F0" },
      ],
    },
  ],
};

const TAG_COLORS = [
  { bg: "#E8F4FD", text: "#2980B9", label: "Blue" },
  { bg: "#E8F8F0", text: "#27AE60", label: "Green" },
  { bg: "#FEF9E7", text: "#D4A843", label: "Yellow" },
  { bg: "#F5EEF8", text: "#8E44AD", label: "Purple" },
  { bg: "#FDEDEC", text: "#E74C3C", label: "Red" },
  { bg: "#FDF2E9", text: "#E67E22", label: "Orange" },
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function getTagTextColor(bg: string): string {
  const map: Record<string, string> = {
    "#E8F4FD": "#2980B9",
    "#E8F8F0": "#27AE60",
    "#FEF9E7": "#B8860B",
    "#F5EEF8": "#8E44AD",
    "#FDEDEC": "#C0392B",
    "#FDF2E9": "#C0770A",
  };
  return map[bg] || "#333";
}

interface CardProps {
  card: CardType;
  columnId: string;
  onDelete: (cardId: string, columnId: string) => void;
  onEdit: (card: CardType, columnId: string) => void;
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  onDragEnd: () => void;
}

function Card({ card, columnId, onDelete, onEdit, onDragStart, onDragEnd }: CardProps) {
  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => onDragStart(e, card.id, columnId)}
      onDragEnd={onDragEnd}
    >
      {card.tag && (
        <span className="card-tag" style={{ background: card.tagColor, color: getTagTextColor(card.tagColor) }}>
          {card.tag}
        </span>
      )}
      <p className="card-title">{card.title}</p>
      {card.desc && <p className="card-desc">{card.desc}</p>}
      <div className="card-actions">
        <button className="card-btn" onClick={() => onEdit(card, columnId)} title="Edit">
          ✏️
        </button>
        <button className="card-btn danger" onClick={() => onDelete(card.id, columnId)} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
}

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string, columnId: string) => void;
  onEditCard: (card: CardType, columnId: string) => void;
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}

function Column({ column, onAddCard, onDeleteCard, onEditCard, onDragStart, onDragEnd, onDragOver, onDrop, isDragOver }: ColumnProps) {
  return (
    <div
      className={`column ${isDragOver ? "drag-over" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="column-header">
        <div className="column-title-row">
          <span className="column-dot" style={{ background: column.color }} />
          <h3 className="column-title">{column.title}</h3>
          <span className="column-count">{column.cards.length}</span>
        </div>
      </div>
      <div className="column-cards">
        {column.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            onDelete={onDeleteCard}
            onEdit={onEditCard}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
      <button className="add-card-btn" onClick={() => onAddCard(column.id)}>
        + Add card
      </button>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: { title: string; desc: string; tag: string; tagColor: string }, columnId: string, cardId?: string) => void;
  initialCard: CardType | null;
  columnId: string | null;
}

function Modal({ isOpen, onClose, onSave, initialCard, columnId }: ModalProps) {
  const [title, setTitle] = useState(initialCard?.title || "");
  const [desc, setDesc] = useState(initialCard?.desc || "");
  const [tag, setTag] = useState(initialCard?.tag || "");
  const [tagColor, setTagColor] = useState(initialCard?.tagColor || TAG_COLORS[0].bg);

  if (!isOpen || !columnId) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), desc: desc.trim(), tag: tag.trim(), tagColor }, columnId, initialCard?.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialCard ? "Edit Card" : "New Card"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="field-label">Title <span style={{ color: "#E74C3C" }}>*</span></label>
          <input
            className="field-input"
            placeholder="Card title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <label className="field-label">Description</label>
          <textarea
            className="field-input"
            placeholder="Optional description..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />
          <label className="field-label">Label</label>
          <input
            className="field-input"
            placeholder="e.g. Design, Dev, Research..."
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <label className="field-label">Label Color</label>
          <div className="color-swatches">
            {TAG_COLORS.map((c) => (
              <button
                key={c.bg}
                className={`swatch ${tagColor === c.bg ? "selected" : ""}`}
                style={{ background: c.bg, border: `2px solid ${tagColor === c.bg ? c.text : "transparent"}` }}
                onClick={() => setTagColor(c.bg)}
                title={c.label}
              />
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!title.trim()}>
            {initialCard ? "Save Changes" : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<BoardData>(INITIAL_DATA);
  const [modal, setModal] = useState<{ open: boolean; columnId: string | null; card: CardType | null }>({ open: false, columnId: null, card: null });
  const [dragOver, setDragOver] = useState<string | null>(null);
  const drag = useRef<{ cardId: string | null; fromCol: string | null }>({ cardId: null, fromCol: null });

  const openAdd = (columnId: string) => setModal({ open: true, columnId, card: null });
  const openEdit = (card: CardType, columnId: string) => setModal({ open: true, columnId, card });
  const closeModal = () => setModal({ open: false, columnId: null, card: null });

  const handleSave = (fields: { title: string; desc: string; tag: string; tagColor: string }, columnId: string, cardId?: string) => {
    setData((prev) => {
      const cols = prev.columns.map((col) => {
        if (cardId && col.id === columnId) {
          return { ...col, cards: col.cards.map((c) => c.id === cardId ? { ...c, ...fields } : c) };
        }
        if (!cardId && col.id === columnId) {
          return { ...col, cards: [...col.cards, { id: generateId(), ...fields }] };
        }
        return col;
      });
      return { columns: cols };
    });
  };

  const handleDelete = (cardId: string, columnId: string) => {
    setData((prev) => ({
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      ),
    }));
  };

  const handleDragStart = (e: React.DragEvent, cardId: string, fromCol: string) => {
    drag.current = { cardId, fromCol };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDragOver(null);
    drag.current = { cardId: null, fromCol: null };
  };

  const handleDragOver = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOver(colId);
  }, []);

  const handleDrop = (e: React.DragEvent, toCol: string) => {
    e.preventDefault();
    const { cardId, fromCol } = drag.current;
    if (!cardId || fromCol === toCol) { setDragOver(null); return; }
    setData((prev) => {
      let card: CardType | undefined;
      const cols = prev.columns.map((col) => {
        if (col.id === fromCol) {
          card = col.cards.find((c) => c.id === cardId);
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        return col;
      }).map((col) => {
        if (col.id === toCol && card) return { ...col, cards: [...col.cards, card] };
        return col;
      });
      return { columns: cols };
    });
    setDragOver(null);
  };

  const addColumn = () => {
    const title = prompt("Column name:");
    if (!title?.trim()) return;
    const colors = ["#6C8EBF", "#D4A843", "#9B6DBF", "#58A87B", "#E07B5A", "#5AAFC4"];
    setData((prev) => ({
      columns: [...prev.columns, { id: generateId(), title: title.trim(), color: colors[prev.columns.length % colors.length], cards: [] }],
    }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #F0F2F5;
          color: #1A1A2E;
          min-height: 100vh;
        }

        .app { display: flex; flex-direction: column; min-height: 100vh; }

        .header {
          background: #1A1A2E;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .header-logo { font-family: 'Fraunces', serif; font-size: 22px; color: #fff; letter-spacing: -0.5px; }
        .header-logo span { color: #6C8EBF; }
        .header-subtitle { font-size: 12px; color: rgba(255,255,255,0.4); margin-left: 12px; }
        .header-left { display: flex; align-items: baseline; }
        .add-col-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: background 0.15s;
        }
        .add-col-btn:hover { background: rgba(255,255,255,0.2); }

        .board {
          display: flex;
          gap: 16px;
          padding: 24px 20px;
          overflow-x: auto;
          flex: 1;
          align-items: flex-start;
        }
        .board::-webkit-scrollbar { height: 6px; }
        .board::-webkit-scrollbar-track { background: transparent; }
        .board::-webkit-scrollbar-thumb { background: #C5C8D0; border-radius: 3px; }

        .column {
          background: #EBECF0;
          border-radius: 12px;
          width: 280px;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.15s;
        }
        .column.drag-over { box-shadow: 0 0 0 2px #6C8EBF inset; background: #E0E4EF; }
        .column-header { padding: 14px 14px 8px; }
        .column-title-row { display: flex; align-items: center; gap: 8px; }
        .column-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .column-title { font-size: 14px; font-weight: 600; color: #172B4D; flex: 1; }
        .column-count { background: rgba(0,0,0,0.1); color: #5E6C84; font-size: 12px; font-weight: 600; border-radius: 10px; padding: 1px 7px; }
        .column-cards { padding: 4px 10px; display: flex; flex-direction: column; gap: 8px; min-height: 8px; }
        .add-card-btn {
          margin: 8px 10px 12px;
          background: transparent;
          border: none;
          color: #5E6C84;
          text-align: left;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: background 0.15s, color 0.15s;
        }
        .add-card-btn:hover { background: rgba(0,0,0,0.05); color: #172B4D; }

        .card {
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); transform: translateY(-1px); }
        .card:active { cursor: grabbing; }
        .card-tag { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.4px; }
        .card-title { font-size: 14px; font-weight: 500; color: #172B4D; line-height: 1.4; margin-bottom: 4px; }
        .card-desc { font-size: 12px; color: #8993A4; line-height: 1.5; margin-bottom: 8px; }
        .card-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
        .card:hover .card-actions { opacity: 1; }
        .card-btn { background: none; border: none; cursor: pointer; font-size: 13px; padding: 3px 5px; border-radius: 4px; transition: background 0.1s; }
        .card-btn:hover { background: #F4F5F7; }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          padding: 16px;
          backdrop-filter: blur(2px);
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .modal-header h2 { font-family: 'Fraunces', serif; font-size: 20px; color: #172B4D; }
        .modal-close { background: none; border: none; cursor: pointer; font-size: 16px; color: #8993A4; padding: 4px 8px; border-radius: 6px; transition: background 0.1s; }
        .modal-close:hover { background: #F4F5F7; }
        .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
        .field-label { font-size: 12px; font-weight: 600; color: #5E6C84; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px; }
        .field-input { width: 100%; padding: 10px 12px; border: 2px solid #DFE1E6; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #172B4D; transition: border-color 0.15s; resize: vertical; outline: none; background: #FAFBFC; }
        .field-input:focus { border-color: #6C8EBF; background: #fff; }
        .color-swatches { display: flex; gap: 10px; flex-wrap: wrap; }
        .swatch { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: transform 0.1s; }
        .swatch:hover { transform: scale(1.15); }
        .swatch.selected { transform: scale(1.15); }
        .modal-footer { padding: 0 24px 24px; display: flex; justify-content: flex-end; gap: 10px; }
        .btn-secondary { background: #F4F5F7; border: none; color: #5E6C84; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; transition: background 0.15s; }
        .btn-secondary:hover { background: #DFE1E6; }
        .btn-primary { background: #1A1A2E; border: none; color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; transition: background 0.15s, opacity 0.15s; }
        .btn-primary:hover { background: #6C8EBF; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 640px) {
          .board { padding: 16px 12px; gap: 12px; }
          .column { min-width: 260px; width: 260px; }
          .header-subtitle { display: none; }
        }
      `}</style>

      <div className="app">
        <header className="header">
          <div className="header-left">
            <div className="header-logo">Task<span>Board</span></div>
            <div className="header-subtitle">drag and drop to reorder</div>
          </div>
          <button className="add-col-btn" onClick={addColumn}>+ Add column</button>
        </header>

        <div className="board">
          {data.columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              onAddCard={openAdd}
              onDeleteCard={handleDelete}
              onEditCard={openEdit}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              isDragOver={dragOver === col.id}
            />
          ))}
        </div>
      </div>

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        onSave={handleSave}
        initialCard={modal.card}
        columnId={modal.columnId}
      />
    </>
  );
}
