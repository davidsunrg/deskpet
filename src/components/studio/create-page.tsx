import { useState } from 'react';
import { StudioPageShell } from './studio-page-shell';
import { getTemplatesByKind, type StudioTemplateKind } from './template-data';
import { TemplateGallery, TemplateSelection } from './template-gallery';

export type CreateTemplateKind = Extract<StudioTemplateKind, 'photo' | 'video'>;

const createCategories: {
  kind: CreateTemplateKind;
  title: string;
  description: string;
  actionLabel: string;
}[] = [
  {
    kind: 'photo',
    title: 'Create a photo',
    description: 'Choose a style, then make it uniquely Mochi.',
    actionLabel: 'Use photo template',
  },
  {
    kind: 'video',
    title: 'Create a video',
    description: 'Bring favorite moments to life with a short video.',
    actionLabel: 'Use video template',
  },
];

export function StudioCreatePage({
  initialKind = 'photo',
}: {
  initialKind?: CreateTemplateKind;
}) {
  const templates = getTemplatesByKind(initialKind);
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? '');
  const category =
    createCategories.find((item) => item.kind === initialKind) ??
    createCategories[0];
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

        <TemplateGallery
          templates={templates}
          selectedId={selectedId}
          onSelect={(template) => setSelectedId(template.id)}
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
