import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconExternalLink,
  IconPencil,
  IconWorld,
} from '@tabler/icons-react';
import { useState } from 'react';
import { studioPet } from './studio-data';
import { StudioPageShell } from './studio-page-shell';
import { getTemplatesByKind } from './template-data';
import { TemplateGallery } from './template-gallery';

const pageTemplates = getTemplatesByKind('page');

export function StudioPetPage() {
  const [selectedId, setSelectedId] = useState(pageTemplates[0]?.id ?? '');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const selectedTemplate =
    pageTemplates.find((template) => template.id === selectedId) ??
    pageTemplates[0];

  return (
    <StudioPageShell>
      <section className="studio-template-page">
        <header className="studio-template-page-heading studio-page-heading">
          <div>
            <p>Pet Page</p>
            <h1>Make Mochi's page feel like home</h1>
            <span>
              Choose a template, personalize the story, and share it with the
              people who care.
            </span>
          </div>
          <div className="studio-page-heading-actions">
            <button type="button" className="studio-button">
              <IconPencil />
              Customize
            </button>
            <button
              type="button"
              className="studio-button studio-button-primary"
            >
              <IconWorld />
              Publish page
            </button>
          </div>
        </header>

        <div className="studio-page-builder">
          <div>
            <div className="studio-section-heading">
              <div>
                <h2>Choose a page template</h2>
                <p>Your content stays the same when you switch templates.</p>
              </div>
            </div>
            <TemplateGallery
              templates={pageTemplates}
              selectedId={selectedId}
              onSelect={(template) => setSelectedId(template.id)}
            />
          </div>

          {selectedTemplate && (
            <aside className="studio-page-preview-panel">
              <div className="studio-page-preview-toolbar">
                <div>
                  <button
                    type="button"
                    aria-label="Desktop preview"
                    aria-pressed={device === 'desktop'}
                    onClick={() => setDevice('desktop')}
                  >
                    <IconDeviceDesktop />
                  </button>
                  <button
                    type="button"
                    aria-label="Mobile preview"
                    aria-pressed={device === 'mobile'}
                    onClick={() => setDevice('mobile')}
                  >
                    <IconDeviceMobile />
                  </button>
                </div>
                <button type="button" aria-label="Open preview">
                  <IconExternalLink />
                </button>
              </div>
              <div className="studio-page-preview-stage">
                <div className="studio-page-preview" data-device={device}>
                  <img src={selectedTemplate.preview} alt="" />
                  <div>
                    <img src={studioPet.avatar} alt="" />
                    <small>{studioPet.breed}</small>
                    <strong>{studioPet.name}</strong>
                    <p>{studioPet.note}</p>
                    <span>View our moments</span>
                  </div>
                </div>
              </div>
              <div className="studio-page-preview-meta">
                <div>
                  <small>Previewing</small>
                  <strong>{selectedTemplate.name}</strong>
                </div>
                <span>deskpet.ai/p/mochi</span>
              </div>
            </aside>
          )}
        </div>
      </section>
    </StudioPageShell>
  );
}
