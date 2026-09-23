import { IconArrowRight, IconEye, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { studioMedia, studioPet } from './studio-data';
import { StudioPageShell } from './studio-page-shell';
import {
  getTemplatesByKind,
  type SiteTemplateCategory,
  type StudioTemplate,
} from './template-data';

const siteTemplates = getTemplatesByKind('site');
const filters: Array<'All' | SiteTemplateCategory> = [
  'All',
  'Classic',
  'Adventure',
  'Playful',
  'Memorial',
];

function SiteTemplateMockup({ template }: { template: StudioTemplate }) {
  return (
    <div
      className="studio-site-template-mockup"
      data-palette={template.site?.palette}
      data-layout={template.site?.layout}
      data-typography={template.site?.typography}
    >
      <div className="studio-site-template-nav">
        <strong>{studioPet.name}</strong>
        <span>Story · Gallery · About</span>
      </div>
      <div className="studio-site-template-hero">
        <img src={template.preview} alt="" />
        <div>
          <small>{template.site?.category}</small>
          <h3>{template.name}</h3>
          <p>A little home for a lifetime of stories.</p>
        </div>
      </div>
      <div className="studio-site-template-intro">
        <small>Our story</small>
        <strong>Every day is a favorite memory.</strong>
        <i />
        <i />
      </div>
      <div className="studio-site-template-photos">
        <img src={studioMedia.flowers} alt="" />
        <img src={studioMedia.hiking} alt="" />
        <img src={studioPet.avatar} alt="" />
      </div>
      <div className="studio-site-template-quote">
        “The smallest moments take up the most room.”
      </div>
      <div className="studio-site-template-footer">{studioPet.name} · 2026</div>
    </div>
  );
}

export function StudioPublicSiteTemplates() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const visibleTemplates = useMemo(
    () =>
      filter === 'All'
        ? siteTemplates
        : siteTemplates.filter(
            (template) => template.site?.category === filter
          ),
    [filter]
  );
  const previewTemplate = siteTemplates.find(
    (template) => template.id === previewId
  );

  return (
    <StudioPageShell>
      <section className="studio-template-page studio-site-templates-page">
        <header className="studio-template-page-heading">
          <div>
            <p>Public Site · Templates</p>
            <h1>Start with a story that feels like yours</h1>
            <span>
              Explore placeholder directions now. Each finished template will be
              crafted one by one later.
            </span>
          </div>
        </header>

        <nav className="studio-site-template-filters" aria-label="Categories">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => {
                setFilter(item);
                setPreviewId(null);
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        {previewTemplate ? (
          <section className="studio-site-template-expanded">
            <div className="studio-site-template-expanded-copy">
              <button
                type="button"
                aria-label="Close template preview"
                onClick={() => setPreviewId(null)}
              >
                <IconX />
              </button>
              <small>{previewTemplate.site?.category} template</small>
              <h2>{previewTemplate.name}</h2>
              <p>{previewTemplate.description}</p>
              <LocaleLink
                href={`${Routes.StudioPublicSiteEditor}?template=${previewTemplate.id}`}
                className="studio-button studio-button-primary"
              >
                Use template
                <IconArrowRight />
              </LocaleLink>
            </div>
            <SiteTemplateMockup template={previewTemplate} />
          </section>
        ) : null}

        <div className="studio-site-template-grid">
          {visibleTemplates.map((template) => (
            <article key={template.id} className="studio-site-template-card">
              <div className="studio-site-template-window">
                <span className="studio-site-template-browser">
                  <i />
                  <i />
                  <i />
                </span>
                <SiteTemplateMockup template={template} />
                {template.badge ? (
                  <strong className="studio-site-template-badge">
                    {template.badge}
                  </strong>
                ) : null}
              </div>
              <div className="studio-site-template-card-copy">
                <div>
                  <small>{template.site?.category}</small>
                  <h2>{template.name}</h2>
                  <p>{template.description}</p>
                </div>
                <div className="studio-site-template-actions">
                  <button
                    type="button"
                    className="studio-button"
                    onClick={() => {
                      setPreviewId(template.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <IconEye />
                    Preview
                  </button>
                  <LocaleLink
                    href={`${Routes.StudioPublicSiteEditor}?template=${template.id}`}
                    className="studio-button studio-button-primary"
                  >
                    Use
                    <IconArrowRight />
                  </LocaleLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </StudioPageShell>
  );
}
