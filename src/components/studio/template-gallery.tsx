import { IconCheck, IconSparkles } from '@tabler/icons-react';
import type { StudioTemplate } from './template-data';

export function TemplateGallery({
  templates,
  selectedId,
  onSelect,
}: {
  templates: StudioTemplate[];
  selectedId: string;
  onSelect: (template: StudioTemplate) => void;
}) {
  return (
    <div className="studio-template-grid">
      {templates.map((template) => {
        const selected = template.id === selectedId;

        return (
          <button
            key={template.id}
            type="button"
            className="studio-template-card"
            data-selected={selected || undefined}
            aria-pressed={selected}
            onClick={() => onSelect(template)}
          >
            <span className="studio-template-preview" data-kind={template.kind}>
              <img src={template.preview} alt="" />
              {template.kind === 'video' && (
                <span className="studio-template-duration">0:15</span>
              )}
              {template.badge && (
                <span className="studio-template-badge">{template.badge}</span>
              )}
              {selected && (
                <span className="studio-template-selected" aria-hidden="true">
                  <IconCheck />
                </span>
              )}
            </span>
            <span className="studio-template-copy">
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TemplateSelection({
  template,
  actionLabel,
}: {
  template: StudioTemplate;
  actionLabel: string;
}) {
  return (
    <aside className="studio-template-selection">
      <div>
        <small>Selected template</small>
        <strong>{template.name}</strong>
        <p>{template.description}</p>
      </div>
      <button type="button" className="studio-button studio-button-primary">
        <IconSparkles />
        {actionLabel}
      </button>
    </aside>
  );
}
