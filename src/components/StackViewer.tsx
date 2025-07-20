import React, { useState } from 'react';
import { StackedCanvas } from '../types';

interface StackViewerProps {
  stack: StackedCanvas[];
  currentPlayingId: string | null;
  onRemoveFromStack: (canvasId: string) => void;
  onSetActiveCanvas: (canvasId: string) => void;
  onUpdateCanvasName: (canvasId: string, newName: string) => void;
  onClearStack: () => void;
}

const StackViewer: React.FC<StackViewerProps> = ({
  stack,
  currentPlayingId,
  onRemoveFromStack,
  onSetActiveCanvas,
  onUpdateCanvasName,
  onClearStack
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (canvas: StackedCanvas) => {
    setEditingId(canvas.id);
    setEditingName(canvas.name);
  };

  const handleSaveEdit = (canvasId: string) => {
    if (editingName.trim()) {
      onUpdateCanvasName(canvasId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, canvasId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(canvasId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (stack.length === 0) {
    return (
      <section className="stack-viewer empty" role="complementary" aria-label="Canvas stack">
        <div className="stack-header">
          <h3>Canvas Stack</h3>
          <span className="stack-count">0 canvases</span>
        </div>
        <div className="empty-stack">
          <p>No canvases in stack</p>
          <small>Draw something and click "Add to Stack" to begin</small>
        </div>
      </section>
    );
  }

  return (
    <section className="stack-viewer" role="complementary" aria-label="Canvas stack">
      <div className="stack-header">
        <h3>Canvas Stack</h3>
        <div className="stack-actions">
          <span className="stack-count">{stack.length} canvas{stack.length !== 1 ? 'es' : ''}</span>
          <button
            className="btn btn-danger btn-small"
            onClick={onClearStack}
            aria-label="Clear entire stack"
            title="Clear entire stack"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="stack-list" role="list">
        {stack.map((canvas, index) => (
          <div
            key={canvas.id}
            className={`stack-item ${canvas.isActive ? 'active' : ''} ${currentPlayingId === canvas.id ? 'playing' : ''}`}
            role="listitem"
            aria-label={`Canvas ${index + 1}: ${canvas.name}${canvas.isActive ? ' (active)' : ''}${currentPlayingId === canvas.id ? ' (playing)' : ''}`}
          >
            <div className="stack-thumbnail">
              {canvas.thumbnail ? (
                <img 
                  src={canvas.thumbnail} 
                  alt={`Thumbnail of ${canvas.name}`}
                  className="thumbnail-image"
                />
              ) : (
                <div className="thumbnail-placeholder">🎨</div>
              )}
              <div className="stack-order">{index + 1}</div>
              {currentPlayingId === canvas.id && (
                <div className="playing-indicator" aria-hidden="true">▶️</div>
              )}
            </div>
            
            <div className="stack-info">
              {editingId === canvas.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveEdit(canvas.id)}
                  onKeyDown={(e) => handleKeyDown(e, canvas.id)}
                  className="name-input"
                  autoFocus
                  aria-label="Edit canvas name"
                />
              ) : (
                <h4 
                  className="canvas-name"
                  onClick={() => handleStartEdit(canvas)}
                  title="Click to edit name"
                >
                  {canvas.name}
                </h4>
              )}
              <div className="canvas-meta">
                <span className="canvas-duration">{canvas.duration}s</span>
                <span className="canvas-points">{canvas.data.length} points</span>
              </div>
            </div>
            
            <div className="stack-item-actions">
              <button
                className={`btn btn-small ${canvas.isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onSetActiveCanvas(canvas.id)}
                aria-label={canvas.isActive ? 'Currently active canvas' : 'Set as active canvas'}
                title={canvas.isActive ? 'Currently active' : 'Set as active'}
                disabled={canvas.isActive}
              >
                {canvas.isActive ? '✓' : '○'}
              </button>
              
              <button
                className="btn btn-danger btn-small"
                onClick={() => onRemoveFromStack(canvas.id)}
                aria-label={`Remove ${canvas.name} from stack`}
                title="Remove from stack"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="stack-summary">
        <div className="total-duration">
          Total: {stack.reduce((sum, canvas) => sum + canvas.duration, 0)}s
        </div>
      </div>
    </section>
  );
};

export default StackViewer;