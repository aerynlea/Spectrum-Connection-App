import Image from "next/image";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { SectionHeading } from "@/components/section-heading";
import { instagramHandle, instagramPosts } from "@/lib/social-kit";

export default function InstagramKitPage() {
  return (
    <div className="page">
      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Instagram kit"
            intro="A ready-to-use content bank built from Guiding Light's voice, colors, and core website sections."
            title="Carousel-style post cards and captions for Instagram."
          />
          <div className="stack-list">
            <article className="feature-card">
              <p className="feature-label">Profile</p>
              <h3>{instagramHandle}</h3>
              <p>
                Use these cards as 4:5 portrait post slides. Each set below has one caption
                and five on-brand slides you can post as a carousel.
              </p>
            </article>
            <article className="feature-card">
              <p className="feature-label">Best use</p>
              <h3>Launch with calm, practical, shareable content.</h3>
              <p>
                Start with your welcome post, then alternate between support guides, global
                voices, community stories, and everyday resource spotlights.
              </p>
            </article>
          </div>
          <div className="button-row">
            <Link
              className="button-primary"
              href="https://www.instagram.com/theguidinglightconnect/"
              rel="noreferrer"
              target="_blank"
            >
              Open Instagram profile
            </Link>
            <Link className="button-secondary" href="/resources">
              Pull resource details from the website
            </Link>
          </div>
        </div>

        <div className="section-panel section-panel--accent instagram-kit__intro">
          <div className="instagram-kit__intro-mark">
            <BrandMark size={108} />
          </div>
          <p className="feature-label">Posting rhythm</p>
          <h2>5 carousel posts, 5 slides each, with captions already written.</h2>
          <ul className="instagram-kit__checklist">
            <li>Use portrait 4:5 cards for feed posts.</li>
            <li>Lead with warm cover slides and clear next steps.</li>
            <li>Mix emotional resonance with real resource value.</li>
            <li>Keep captions easy to read and save-worthy.</li>
          </ul>
        </div>
      </section>

      {instagramPosts.map((post, postIndex) => (
        <section className="section instagram-post" id={post.slug} key={post.slug}>
          <div className="instagram-post__header">
            <div>
              <p className="eyebrow">Post {postIndex + 1}</p>
              <h2>{post.title}</h2>
              <p className="section-copy">{post.focus}</p>
            </div>
            <article className="instagram-caption-card">
              <p className="feature-label">Caption</p>
              <p>{post.caption}</p>
            </article>
          </div>

          <div className="instagram-slide-grid">
            {post.slides.map((slide, slideIndex) => (
              <article
                className={`instagram-slide instagram-slide--${slide.tone ?? "brand"}`}
                key={`${post.slug}-${slideIndex + 1}`}
              >
                {slide.imageSrc ? (
                  <>
                    <Image
                      alt={slide.title}
                      className="instagram-slide__image"
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      src={slide.imageSrc}
                    />
                    <div className="instagram-slide__photo-overlay" />
                  </>
                ) : null}
                <div className="instagram-slide__content">
                  <div className="instagram-slide__top">
                    <p className="instagram-slide__eyebrow">{slide.eyebrow}</p>
                    <span className="instagram-slide__count">
                      {slideIndex + 1}/{post.slides.length}
                    </span>
                  </div>
                  <div className="instagram-slide__copy">
                    <h3>{slide.title}</h3>
                    <p>{slide.body}</p>
                  </div>
                  <div className="instagram-slide__footer">
                    <span>{slide.footer ?? instagramHandle}</span>
                    <BrandMark size={48} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
