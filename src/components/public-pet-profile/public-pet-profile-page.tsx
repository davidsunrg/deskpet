import {
  IconBook,
  IconCalendarEvent,
  IconExternalLink,
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus>('');
  const activeGalleryItem = profile.gallery[activeGalleryIndex];

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
            <a href="#gallery" onClick={closeMenu}>
              Gallery
            </a>
            <a href="#stories" onClick={closeMenu}>
              Stories
            </a>
            <a href="#about" onClick={closeMenu}>
              About
            </a>
          </nav>

          <button
            type="button"
            className="pet-profile-header-share"
            onClick={shareProfile}
          >
            <IconShare3 />
            Share
          </button>
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
                const value =
                  stat.kind === 'loved' && isFollowing
                    ? stat.value + 1
                    : stat.value;

                return (
                  <div key={stat.kind}>
                    <StatIcon aria-hidden="true" />
                    <div>
                      <dt>{stat.label}</dt>
                      <dd>{value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>

            <div className="pet-profile-actions">
              <button
                type="button"
                className="pet-profile-follow"
                aria-pressed={isFollowing}
                onClick={() => setIsFollowing((following) => !following)}
              >
                {isFollowing
                  ? `Following ${profile.name}`
                  : `Follow ${profile.name}`}
                <IconHeart />
              </button>
              <button
                type="button"
                className="pet-profile-share"
                onClick={shareProfile}
              >
                Share
                <IconExternalLink />
              </button>
            </div>
            <output className="pet-profile-share-status" aria-live="polite">
              {shareStatus}
            </output>
          </section>

          <section
            className={`pet-profile-hero-placeholder pet-profile-tone-${activeGalleryItem?.tone ?? 'cream'}`}
            aria-label={activeGalleryItem?.label ?? `${profile.name} portrait`}
          >
            <div className="pet-profile-placeholder-subject" aria-hidden="true">
              <IconPaw />
            </div>
            <p className="pet-profile-handwriting pet-profile-side-note">
              {profile.sideNote}
              <IconHeart aria-hidden="true" />
            </p>
            <span className="pet-profile-placeholder-label">
              {activeGalleryItem?.label}
            </span>
          </section>

          <section
            id="gallery"
            className="pet-profile-gallery"
            aria-label="Gallery"
          >
            {profile.gallery.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`pet-profile-gallery-item pet-profile-tone-${item.tone}`}
                aria-label={`Show ${item.label}`}
                aria-pressed={activeGalleryIndex === index}
                onClick={() => setActiveGalleryIndex(index)}
              >
                <IconPaw aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pet-profile-gallery-more">
              <span aria-hidden="true">+{profile.remainingGalleryCount}</span>
              <span className="sr-only">
                {profile.remainingGalleryCount} more photos
              </span>
            </div>
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
