import React from 'react';
import './Card.css';

const StarIcon = ({ filled = false }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.789 1.401 8.168L12 18.896l-7.335 3.857 1.401-8.168L.132 9.21l8.2-1.192L12 .587z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

const CoinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.12" />
    <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.5a2.5 2.5 0 1 0 .001 5.001A2.5 2.5 0 0 0 12 9.5z" fill="currentColor"/>
  </svg>
);

const ArrowIcon = ({ up = true }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {up ? <path d="M7 14l5-5 5 5H7z" fill="currentColor"/> : <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>}
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2h5z" fill="currentColor"/>
  </svg>
);

const Card = ({ card, quantity = 0, starred = false, onPurchase, onToggleStar, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const { id, title, price, image } = card || {};
  const priceNum = Number(price || 0);

  return (
    <article className="store-card" aria-labelledby={`card-title-${id}`}>
      <button
        type="button"
        className="star-btn"
        onClick={onToggleStar}
        aria-pressed={!!starred}
        title={starred ? 'Unstar' : 'Star'}
      >
        <span className={`star-icon ${starred ? 'starred' : ''}`} aria-hidden>
          <StarIcon filled={starred} />
        </span>
      </button>

      <div className="card-image" role="img" aria-label={title || 'item image'}>
        {image ? (
          <img src={image} alt={title || 'card image'} />
        ) : (
          <div className="image-fallback" aria-hidden>
            <svg width="64" height="44" viewBox="0 0 64 44">
              <rect width="64" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
            </svg>
          </div>
        )}
      </div>

      <div className="card-content">
        <h4 id={`card-title-${id}`} className="card-title">{title}</h4>

        <div className="card-meta">
          <span className="coin">
            <CoinIcon />
          </span>
          <span className="price">{priceNum.toFixed(2)}   🪙</span>
        </div>

        {quantity > 0 && (
          <div className="owned-row">
            <span className="owned-badge">Owned</span>
            <span className="owned-qty">{quantity}×</span>
            <button className="icon-small" onClick={onPurchase} title="Buy one more" aria-label="buy-one-more">
              <PlusIcon />
            </button>
          </div>
        )}
      </div>

      <div className="card-actions">
        {quantity === 0 ? (
          <button className="btn-simple btn-buy" onClick={onPurchase} aria-label={`buy ${title}`}>
            Buy
          </button>
        ) : (
          <button className="btn-simple btn-owned" disabled aria-label={`owned ${title}`}>
            Owned
          </button>
        )}

        <div className="move-controls" role="group" aria-label="reorder">
          <button className="icon-ctrl" onClick={onMoveUp} disabled={isFirst} title="Move up" aria-disabled={isFirst}>
            <ArrowIcon up />
          </button>
          <button className="icon-ctrl" onClick={onMoveDown} disabled={isLast} title="Move down" aria-disabled={isLast}>
            <ArrowIcon up={false} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default Card;
