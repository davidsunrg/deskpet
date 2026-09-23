import { useRef, useState } from 'react';
import { StudioGenerator } from './studio-generator';
import { StudioPageShell } from './studio-page-shell';
import {
  getTemplatesByKind,
  type StudioTemplate,
  type StudioTemplateKind,
} from './template-data';
import { TemplateGallery } from './template-gallery';

export type CreateTemplateKind = Extract<StudioTemplateKind, 'photo' | 'video'>;

const createCategories: {
  kind: CreateTemplateKind;
  title: string;
  description: string;
}[] = [
  {
    kind: 'photo',
    title: 'Create a photo',
    description: 'Choose a style, then make it uniquely Mochi.',
  },
  {
    kind: 'video',
    title: 'Create a video',
    description: 'Bring favorite moments to life with a short video.',
  },
];

export function StudioCreatePage({
  initialKind = 'photo',
}: {
  initialKind?: CreateTemplateKind;
}) {
  const templates = getTemplatesByKind(initialKind);
  const generatorRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('');
  const [appliedTemplate, setAppliedTemplate] = useState<
    StudioTemplate | undefined
  >();
  const [applyVersion, setApplyVersion] = useState(0);
  const category =
    createCategories.find((item) => item.kind === initialKind) ??
    createCategories[0];

  const applyTemplate = (template: StudioTemplate) => {
    setSelectedId(template.id);
    setAppliedTemplate(template);
    setApplyVersion((current) => current + 1);
    requestAnimationFrame(() => {
      generatorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      generatorRef.current?.focus({ preventScroll: true });
    });
  };

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

        <div
          ref={generatorRef}
          className="studio-generator-anchor"
          tabIndex={-1}
        >
          <StudioGenerator
            key={`${initialKind}-${appliedTemplate?.id ?? 'blank'}-${applyVersion}`}
            kind={initialKind}
            appliedTemplate={appliedTemplate}
          />
        </div>

        <section className="studio-template-library">
          <div className="studio-section-heading studio-template-library-heading">
            <div>
              <h2>Start from a template</h2>
              <p>
                Pick a style to apply its prompt and settings to the generator.
              </p>
            </div>
          </div>
          <TemplateGallery
            templates={templates}
            selectedId={selectedId}
            onSelect={applyTemplate}
          />
        </section>
      </section>
    </StudioPageShell>
  );
}
