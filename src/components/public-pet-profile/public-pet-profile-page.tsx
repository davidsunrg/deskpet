import {
  IconBook,
  IconCalendarEvent,
  IconHeart,
  IconMenu2,
  IconPaw,
  IconPhoto,
  IconShare3,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import type {
  PublicPetProfile,
  PublicPetProfileStatKind,
} from '@/pets/public-pet-profile';
import '@/styles/public-pet-profile.css';

const statIcons = {
  loved: IconHeart,
  photos: IconPhoto,
  stories: IconBook,
  memories: IconCalendarEvent,
} satisfies Record<PublicPetProfileStatKind, typeof IconHeart>;

type ShareStatus = '' | 'Shared' | 'Link copied' | 'Sharing cancelled';

export function PublicPetProfilePage({
  profile,
}: {
  profile: PublicPetProfile;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus>('');
  const heroPreview = profile.gallery[0];

  async function shareProfile() {
    const shareData = {
      title: `${profile.name} on DeskPet`,
      text: `Meet ${profile.name}, a ${profile.breed}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('Shared');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('Link copied');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareStatus('Sharing cancelled');
        return;
      }
      setShareStatus('Sharing cancelled');
    }
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="pet-profile-theme">
      <div className="pet-profile-page">
        <header className="pet-profile-header">
          <a className="pet-profile-brand" href="#home" onClick={closeMenu}>
            <IconPaw aria-hidden="true" />
            <span>DeskPet</span>
          </a>

          <button
            type="button"
            className="pet-profile-menu-button"
            aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMenuOpen}
            aria-controls="pet-profile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <IconX /> : <IconMenu2 />}
          </button>

          <nav
            id="pet-profile-navigation"
            className="pet-profile-navigation"
            data-open={isMenuOpen}
            aria-label="Pet profile"
          >
            <a href="#home" onClick={closeMenu}>
              Home
            </a>
            <a href="#stories" onClick={closeMenu}>
              Stories
            </a>
            <a href="#about" onClick={closeMenu}>
              About
            </a>
          </nav>

          <div className="pet-profile-header-actions">
            <button
              type="button"
              className="pet-profile-header-share"
              onClick={shareProfile}
            >
              <IconShare3 />
              Share
            </button>
            <output
              className="pet-profile-header-share-status"
              aria-live="polite"
            >
              {shareStatus}
            </output>
          </div>
        </header>

        <main id="home" className="pet-profile-main">
          <section id="about" className="pet-profile-copy">
            <p className="pet-profile-handwriting pet-profile-eyebrow">
              {profile.eyebrow}
              <IconHeart aria-hidden="true" />
            </p>

            <div className="pet-profile-title-row">
              <h1>{profile.name}</h1>
              <IconPaw aria-hidden="true" />
            </div>
            <p className="pet-profile-meta">
              {profile.breed}
              <span aria-hidden="true">·</span>
              {profile.age}
            </p>
            <p className="pet-profile-handwriting pet-profile-note">
              {profile.note}
              <IconHeart aria-hidden="true" />
            </p>

            <dl id="stories" className="pet-profile-stats">
              {profile.stats.map((stat) => {
                const StatIcon = statIcons[stat.kind];

                return (
                  <div key={stat.kind}>
                    <StatIcon aria-hidden="true" />
                    <div>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </section>

          <section
            className={`pet-profile-hero-placeholder pet-profile-tone-${heroPreview?.tone ?? 'cream'}`}
            aria-label={heroPreview?.label ?? `${profile.name} portrait`}
          >
            <div className="pet-profile-placeholder-subject" aria-hidden="true">
              <IconPaw />
            </div>
            <p className="pet-profile-handwriting pet-profile-side-note">
              {profile.sideNote}
              <IconHeart aria-hidden="true" />
            </p>
            <span className="pet-profile-placeholder-label">
              {heroPreview?.label}
            </span>
          </section>
        </main>

        <footer className="pet-profile-footer">
          <div className="pet-profile-footer-paws" aria-hidden="true">
            <IconPaw />
            <IconPaw />
          </div>
          <p className="pet-profile-handwriting">{profile.footerNote}</p>
          <IconHeart aria-hidden="true" />
        </footer>
      </div>
    </div>
  );
}
