import { IconPhoto, IconPlayerPlayFilled } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { StudioPageShell } from './studio-page-shell';
import { getTemplatesByKind, type StudioTemplateKind } from './template-data';
import { TemplateGallery, TemplateSelection } from './template-gallery';

export type CreateTemplateKind = Extract<StudioTemplateKind, 'photo' | 'video'>;

const createCategories: {
  kind: CreateTemplateKind;
  label: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: typeof IconPhoto;
}[] = [
  {
    kind: 'photo',
    label: 'Photo',
    title: 'Create a photo',
    description: 'Choose a style, then make it uniquely Mochi.',
    actionLabel: 'Use photo template',
    icon: IconPhoto,
  },
  {
    kind: 'video',
    label: 'Video',
    title: 'Create a video',
    description: 'Bring favorite moments to life with a short video.',
    actionLabel: 'Use video template',
    icon: IconPlayerPlayFilled,
  },
];

export function StudioCreatePage({
  initialKind = 'photo',
}: {
  initialKind?: CreateTemplateKind;
}) {
  const [kind, setKind] = useState<CreateTemplateKind>(initialKind);
  const templates = useMemo(() => getTemplatesByKind(kind), [kind]);
  const [selectedIds, setSelectedIds] = useState<
    Partial<Record<CreateTemplateKind, string>>
  >({});
  const category =
    createCategories.find((item) => item.kind === kind) ?? createCategories[0];
  const selectedId = selectedIds[kind] ?? templates[0]?.id ?? '';
  const selectedTemplate =
    templates.find((template) => template.id === selectedId) ?? templates[0];

  return (
    <StudioPageShell>
      <section className="studio-template-page">
        <header className="studio-template-page-heading">
          <div>
            <p>Create with a template</p>
            <h1>{category.title}</h1>
            <span>{category.description}</span>
          </div>
        </header>

        <fieldset className="studio-template-tabs">
          <legend className="studio-sr-only">Creation type</legend>
          {createCategories.map((item) => (
            <button
              key={item.kind}
              type="button"
              aria-pressed={kind === item.kind}
              onClick={() => setKind(item.kind)}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </fieldset>

        <TemplateGallery
          templates={templates}
          selectedId={selectedId}
          onSelect={(template) =>
            setSelectedIds((current) => ({
              ...current,
              [kind]: template.id,
            }))
          }
        />

        {selectedTemplate && (
          <TemplateSelection
            template={selectedTemplate}
            actionLabel={category.actionLabel}
          />
        )}
      </section>
    </StudioPageShell>
  );
}
