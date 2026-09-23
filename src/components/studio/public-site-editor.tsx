import {
  IconCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconExternalLink,
  IconWorld,
} from '@tabler/icons-react';
import { useState } from 'react';
import { studioMedia, studioPet } from './studio-data';
import { StudioPageShell } from './studio-page-shell';
import {
  getTemplatesByKind,
  type SiteTemplatePalette,
  type SiteTemplateTypography,
} from './template-data';

const siteTemplates = getTemplatesByKind('site');
const moduleOptions = ['hero', 'moments', 'gallery', 'about'] as const;
type SiteModule = (typeof moduleOptions)[number];

const paletteOptions: Array<{
  id: SiteTemplatePalette;
  label: string;
}> = [
  { id: 'cream', label: 'Cream' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'forest', label: 'Forest' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'lilac', label: 'Lilac' },
];

export function StudioPublicSiteEditor({
  initialTemplateId,
}: {
  initialTemplateId?: string;
}) {
  const initialTemplate =
    siteTemplates.find((template) => template.id === initialTemplateId) ??
    siteTemplates[0];
  const [title, setTitle] = useState(`${studioPet.name}'s little corner`);
  const [tagline, setTagline] = useState(
    'Small paws, big adventures, and all our favorite days together.'
  );
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [palette, setPalette] = useState<SiteTemplatePalette>(
    initialTemplate?.site?.palette ?? 'cream'
  );
  const [typography, setTypography] = useState<SiteTemplateTypography>(
    initialTemplate?.site?.typography ?? 'serif'
  );
  const [visibleModules, setVisibleModules] = useState<SiteModule[]>([
    ...moduleOptions,
  ]);
  const [published, setPublished] = useState(false);

  const toggleModule = (module: SiteModule) => {
    setVisibleModules((current) =>
      current.includes(module)
        ? current.filter((item) => item !== module)
        : [...current, module]
    );
    setPublished(false);
  };

  return (
    <StudioPageShell>
      <section className="studio-template-page studio-site-editor-page">
        <header className="studio-template-page-heading studio-site-heading">
          <div>
            <p>Public Site · Editor</p>
            <h1>Shape {studioPet.name}'s place on the web</h1>
            <span>
              Personalize a local preview now. Saving and publishing will be
              connected later.
            </span>
          </div>
          <div className="studio-site-heading-actions">
            <span
              className="studio-site-publish-status"
              data-published={published}
            >
              {published ? <IconCheck /> : null}
              {published ? 'Preview published' : 'Draft preview'}
            </span>
            <button
              type="button"
              className="studio-button studio-button-primary"
              onClick={() => setPublished(true)}
            >
              <IconWorld />
              Publish
            </button>
          </div>
        </header>

        <div className="studio-site-editor">
          <aside className="studio-site-controls">
            {initialTemplate ? (
              <div className="studio-site-template-note">
                <img src={initialTemplate.preview} alt="" />
                <span>
                  <small>Starting from</small>
                  <strong>{initialTemplate.name}</strong>
                </span>
              </div>
            ) : null}

            <fieldset className="studio-site-control-group">
              <legend>Site details</legend>
              <label>
                <span>Site title</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setPublished(false);
                  }}
                />
              </label>
              <label>
                <span>Tagline</span>
                <textarea
                  value={tagline}
                  rows={3}
                  onChange={(event) => {
                    setTagline(event.target.value);
                    setPublished(false);
                  }}
                />
              </label>
            </fieldset>

            <fieldset className="studio-site-control-group">
              <legend>Visible sections</legend>
              <div className="studio-site-module-list">
                {moduleOptions.map((module) => (
                  <label key={module}>
                    <span>{module}</span>
                    <input
                      type="checkbox"
                      checked={visibleModules.includes(module)}
                      onChange={() => toggleModule(module)}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="studio-site-control-group">
              <legend>Theme</legend>
              <div className="studio-site-palette-list">
                {paletteOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    data-palette={option.id}
                    aria-label={`${option.label} palette`}
                    aria-pressed={palette === option.id}
                    onClick={() => {
                      setPalette(option.id);
                      setPublished(false);
                    }}
                  >
                    <i />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              <label>
                <span>Typography</span>
                <select
                  value={typography}
                  onChange={(event) => {
                    setTypography(event.target.value as SiteTemplateTypography);
                    setPublished(false);
                  }}
                >
                  <option value="serif">Editorial serif</option>
                  <option value="sans">Clean sans</option>
                  <option value="handwritten">Playful handwritten</option>
                </select>
              </label>
            </fieldset>
          </aside>

          <div className="studio-site-preview-panel">
            <div className="studio-site-preview-toolbar">
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
            <div className="studio-site-preview-stage">
              <div
                className="studio-site-live-preview"
                data-device={device}
                data-palette={palette}
                data-typography={typography}
              >
                <div className="studio-site-live-nav">
                  <strong>{studioPet.name}</strong>
                  <span>Moments · Gallery · About</span>
                </div>
                {visibleModules.includes('hero') ? (
                  <section className="studio-site-live-hero">
                    <img src={initialTemplate?.preview} alt="" />
                    <div>
                      <small>{studioPet.breed}</small>
                      <h2>{title || `${studioPet.name}'s story`}</h2>
                      <p>{tagline || 'A tiny corner for a very big love.'}</p>
                    </div>
                  </section>
                ) : null}
                {visibleModules.includes('moments') ? (
                  <section className="studio-site-live-copy">
                    <small>Favorite moments</small>
                    <h3>Life is better together.</h3>
                    <p>
                      A growing journal of everyday rituals, first adventures,
                      and the quiet moments worth keeping.
                    </p>
                  </section>
                ) : null}
                {visibleModules.includes('gallery') ? (
                  <section className="studio-site-live-gallery">
                    {[
                      studioMedia.flowers,
                      studioMedia.hiking,
                      studioMedia.beach,
                    ].map((image) => (
                      <img key={image} src={image} alt="" />
                    ))}
                  </section>
                ) : null}
                {visibleModules.includes('about') ? (
                  <section className="studio-site-live-about">
                    <img src={studioPet.avatar} alt="" />
                    <div>
                      <small>About {studioPet.name}</small>
                      <h3>{studioPet.note}</h3>
                      <p>{studioPet.age} · Always ready for another walk.</p>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
            <div className="studio-site-preview-meta">
              <div>
                <small>Editing</small>
                <strong>{initialTemplate?.name ?? 'Blank site'}</strong>
              </div>
              <span>deskpet.ai/p/mochi</span>
            </div>
          </div>
        </div>
      </section>
    </StudioPageShell>
  );
}
