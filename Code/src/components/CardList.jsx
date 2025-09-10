import React, { useEffect, useMemo, useState } from 'react';
import Card from './Card';
import cardsData from '../constants/Cards.json';
import { getItem, setItem, removeItem } from '../utils/indexedDB';
import './CardList.css';

const CardList = ({ coins, setCoins, resetSignal }) => {
  const defaultOrder = useMemo(() => cardsData.map(c => c.id), []);

  const [order, setOrder] = useState([]);
  const [purchases, setPurchases] = useState({});
  const [stars, setStars] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const savedOrder = await getItem('cardOrder');
        const savedPurchases = await getItem('purchases');
        const savedStars = await getItem('cardStars');

        setOrder(Array.isArray(savedOrder) ? savedOrder : defaultOrder);
        setPurchases(typeof savedPurchases === 'object' && savedPurchases !== null ? savedPurchases : {});
        setStars(typeof savedStars === 'object' && savedStars !== null ? savedStars : {});
      } catch (err) {
        console.error('Error loading CardList data from IndexedDB:', err);
        setOrder(defaultOrder);
        setPurchases({});
        setStars({});
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [defaultOrder]);

  useEffect(() => {
    if (loading) return;

    const jsonIds = cardsData.map(c => c.id);

    const newOrder = [...order, ...jsonIds.filter(id => !order.includes(id))];
    const filteredOrder = newOrder.filter(id => jsonIds.includes(id));
    if (filteredOrder.join(',') !== order.join(',')) {
      setOrder(filteredOrder);
    }

    const filteredPurchases = Object.fromEntries(Object.entries(purchases).filter(([id]) => jsonIds.includes(id)));
    if (Object.keys(filteredPurchases).length !== Object.keys(purchases).length) {
      setPurchases(filteredPurchases);
    }

    const filteredStars = Object.fromEntries(Object.entries(stars).filter(([id]) => jsonIds.includes(id)));
    if (Object.keys(filteredStars).length !== Object.keys(stars).length) {
      setStars(filteredStars);
    }

  }, [cardsData, loading]);


  useEffect(() => {
    if (loading) return;
    setItem('cardOrder', order).catch(err => console.error('Error saving cardOrder:', err));
  }, [order, loading]);

  useEffect(() => {
    if (loading) return;
    setItem('purchases', purchases).catch(err => console.error('Error saving purchases:', err));
  }, [purchases, loading]);

  useEffect(() => {
    if (loading) return;
    setItem('cardStars', stars).catch(err => console.error('Error saving cardStars:', err));
  }, [stars, loading]);


  useEffect(() => {
    if (resetSignal > 0) {
      setPurchases({});
      setStars({});
      setOrder(defaultOrder);
      removeItem('purchases').catch(() => {});
      removeItem('cardStars').catch(() => {});
      removeItem('cardOrder').catch(() => {});
    }

  }, [resetSignal]);

  const displayCards = useMemo(() => {
    return order.map(id => cardsData.find(c => c.id === id)).filter(Boolean);
  }, [order]);

  const handlePurchase = (id, price) => {
    if (coins < price) {
      window.alert('Not enough coins! 💰🚫');
      return;
    }
    setCoins(c => Number((c - price).toFixed(2)));
    setPurchases(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleToggleStar = (id) => {
    setStars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const moveUp = (id) => {
    setOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx > 0) {
        const arr = [...prev];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        return arr;
      }
      return prev;
    });
  };

  const moveDown = (id) => {
    setOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx !== -1 && idx < prev.length - 1) {
        const arr = [...prev];
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
        return arr;
      }
      return prev;
    });
  };

  if (loading) return <div className="loading-text">Loading cards...</div>;

  return (
    <section className="cardlist-root">
      <header className="cardlist-header">
        <h4 className="cardlist-title">Shop / Cards</h4>
        <div className="cardlist-coins">
          <span className="coin-emoji">🪙</span>
          <span className="coin-amount">{coins}</span>
        </div>
      </header>

      <div className="cards-grid" role="list">
        {displayCards.map(card => (
          <div key={card.id} role="listitem" className="card-wrapper">
            <Card
              card={card}
              quantity={purchases[card.id] || 0}
              starred={!!stars[card.id]}
              onPurchase={() => handlePurchase(card.id, Number(card.price || 0))}
              onToggleStar={() => handleToggleStar(card.id)}
              onMoveUp={() => moveUp(card.id)}
              onMoveDown={() => moveDown(card.id)}
              isFirst={order[0] === card.id}
              isLast={order[order.length - 1] === card.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardList;
