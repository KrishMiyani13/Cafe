import React, { useState, useEffect } from 'react';
import { useCafe } from '../context/CafeContext';
import type { Order, MenuItem } from '../context/CafeContext';
import { Modal } from '../components/Modal';
import { 
  ClipboardList, Coffee, Layers, QrCode, Sliders, LogOut, 
  Plus, Check, Trash2, Edit2, Play, CheckSquare, DollarSign, 
  ExternalLink, User, Phone, Sparkles, AlertCircle, 
  Star, BarChart3, MessageSquare, ChefHat, Bell, CheckCircle2 
} from 'lucide-react';

type Tab = 'orders' | 'menu' | 'tables' | 'design' | 'analytics' | 'reviews';
type Role = 'manager' | 'chef' | 'waiter';

const BRAND_PRESETS = [
  {
    name: 'Warm Mocha (Default)',
    colors: {
      primary: '#854d0e',
      secondary: '#ca8a04',
      bg: '#fefcf8',
      card: '#ffffff',
      text: '#451a03',
      textMuted: '#78350f',
      border: '#fef08a',
    }
  },
  {
    name: 'Emerald Garden',
    colors: {
      primary: '#065f46',
      secondary: '#059669',
      bg: '#f0fdf4',
      card: '#ffffff',
      text: '#022c22',
      textMuted: '#064e3b',
      border: '#bbf7d0',
    }
  },
  {
    name: 'Neon Lounge',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      bg: '#0f172a',
      card: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      border: '#334155',
    }
  },
  {
    name: 'Sunset Bistro',
    colors: {
      primary: '#ea580c',
      secondary: '#facc15',
      bg: '#fff7ed',
      card: '#ffffff',
      text: '#431407',
      textMuted: '#7c2d12',
      border: '#fed7aa',
    }
  }
];

export const Dashboard: React.FC = () => {
  const { 
    currentCafe, logout, orders, updateOrderStatus,
    addMenuItem, updateMenuItem, deleteMenuItem,
    addTable, deleteTable, updateCafeDesign,
    waiterCalls, feedbacks, resolveWaiterCall,
    isCloudSyncActive
  } = useCafe();

  const [currentRole, setCurrentRole] = useState<Role>('manager');
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Live timer tick for KDS and Waiter Panels
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Form states for menu items
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemVeg, setItemVeg] = useState(true);
  const [itemAvailable, setItemAvailable] = useState(true);

  // Form states for table additions
  const [newTableNum, setNewTableNum] = useState('');
  const [tableError, setTableError] = useState('');

  // Form states for Customization
  const [cafeName, setCafeName] = useState('');
  const [cafeLogo, setCafeLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [cardColor, setCardColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [textMutedColor, setTextMutedColor] = useState('');
  const [borderColor, setBorderColor] = useState('');

  // Track counts to trigger chimes
  const [lastOrdersCount, setLastOrdersCount] = useState(0);
  const [lastCallsCount, setLastCallsCount] = useState(0);

  const pendingOrders = orders.filter(o => o.cafeId === currentCafe?.id && o.status === 'pending');
  const preparingOrders = orders.filter(o => o.cafeId === currentCafe?.id && o.status === 'preparing');
  const servedOrders = orders.filter(o => o.cafeId === currentCafe?.id && o.status === 'served');
  const paidOrders = orders.filter(o => o.cafeId === currentCafe?.id && o.status === 'paid');

  const pendingCalls = waiterCalls.filter(c => c.cafeId === currentCafe?.id && c.status === 'pending');

  // Load customizations when currentCafe changes
  useEffect(() => {
    if (currentCafe) {
      setCafeName(currentCafe.name);
      setCafeLogo(currentCafe.logoUrl || '');
      setPrimaryColor(currentCafe.colors.primary);
      setSecondaryColor(currentCafe.colors.secondary);
      setBgColor(currentCafe.colors.bg);
      setCardColor(currentCafe.colors.card);
      setTextColor(currentCafe.colors.text);
      setTextMutedColor(currentCafe.colors.textMuted);
      setBorderColor(currentCafe.colors.border);
    }
  }, [currentCafe]);

  // Audio alerts for new orders & waiter calls
  useEffect(() => {
    const cafeOrders = orders.filter(o => o.cafeId === currentCafe?.id && o.status === 'pending');
    if (cafeOrders.length > lastOrdersCount) {
      playChime(true);
    }
    setLastOrdersCount(cafeOrders.length);
  }, [orders, currentCafe]);

  useEffect(() => {
    const cafeCalls = waiterCalls.filter(c => c.cafeId === currentCafe?.id && c.status === 'pending');
    if (cafeCalls.length > lastCallsCount) {
      playChime(false);
    }
    setLastCallsCount(cafeCalls.length);
  }, [waiterCalls, currentCafe]);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentCafe) {
      window.location.hash = '#/';
    }
  }, [currentCafe]);

  if (!currentCafe) return null;

  const playChime = (isOrder: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      if (isOrder) {
        // High double beep for orders
        playTone(523.25, 0, 0.15); // C5
        playTone(659.25, 0.12, 0.25); // E5
      } else {
        // High alert ping for waiter calls
        playTone(880, 0, 0.1); // A5
        playTone(880, 0.15, 0.1); // A5
      }
    } catch (e) {
      console.log('Audio blocked');
    }
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: itemName,
      description: itemDesc,
      price: parseFloat(itemPrice) || 0,
      image: itemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      category: itemCategory || 'General',
      isVeg: itemVeg,
      isAvailable: itemAvailable
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }

    setIsItemModalOpen(false);
    setEditingItem(null);
    setItemName('');
    setItemDesc('');
    setItemPrice('');
    setItemImage('');
    setItemCategory('');
    setItemVeg(true);
    setItemAvailable(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price.toString());
    setItemImage(item.image);
    setItemCategory(item.category);
    setItemVeg(item.isVeg);
    setItemAvailable(item.isAvailable);
    setIsItemModalOpen(true);
  };

  const handleDesignSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCafeDesign(
      {
        primary: primaryColor,
        secondary: secondaryColor,
        bg: bgColor,
        card: cardColor,
        text: textColor,
        textMuted: textMutedColor,
        border: borderColor,
      },
      cafeName,
      cafeLogo
    );
  };

  const applyPreset = (presetColors: typeof BRAND_PRESETS[0]['colors']) => {
    setPrimaryColor(presetColors.primary);
    setSecondaryColor(presetColors.secondary);
    setBgColor(presetColors.bg);
    setCardColor(presetColors.card);
    setTextColor(presetColors.text);
    setTextMutedColor(presetColors.textMuted);
    setBorderColor(presetColors.border);
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTableError('');
    const tNum = parseInt(newTableNum);
    if (!tNum || tNum <= 0) {
      setTableError('Please enter a valid table number.');
      return;
    }
    if (currentCafe.tables.includes(tNum)) {
      setTableError(`Table ${tNum} already exists.`);
      return;
    }
    addTable(tNum);
    setNewTableNum('');
  };

  const getTableUrl = (tableNum: number) => {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}#/cafe/${currentCafe.id}/table/${tableNum}`;
  };

  const getQRUrl = (tableNum: number) => {
    const orderUrl = getTableUrl(tableNum);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(orderUrl)}`;
  };

  // Helper formatting for durations
  const formatTimeElapsed = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  // Computations for Analytics Tab
  const cafeOrders = orders.filter(o => o.cafeId === currentCafe.id);
  const totalRevenue = cafeOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const avgOrderValue = cafeOrders.length ? totalRevenue / cafeOrders.length : 0;
  const cafeReviews = feedbacks.filter(r => r.cafeId === currentCafe.id);
  const avgRating = cafeReviews.length 
    ? cafeReviews.reduce((acc, curr) => acc + curr.rating, 0) / cafeReviews.length 
    : 0;

  // Bestsellers items calculator
  const itemSalesCounts: { [name: string]: { qty: number, rev: number } } = {};
  cafeOrders.forEach(o => {
    o.items.forEach(itm => {
      if (!itemSalesCounts[itm.menuItem.name]) {
        itemSalesCounts[itm.menuItem.name] = { qty: 0, rev: 0 };
      }
      itemSalesCounts[itm.menuItem.name].qty += itm.quantity;
      itemSalesCounts[itm.menuItem.name].rev += itm.menuItem.price * itm.quantity;
    });
  });

  const bestsellers = Object.entries(itemSalesCounts)
    .map(([name, stat]) => ({ name, qty: stat.qty, revenue: stat.rev }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxQtySold = bestsellers.length ? Math.max(...bestsellers.map(b => b.qty)) : 1;

  // Peak Hourly analytics calculator
  const hourlyCounts = Array(24).fill(0);
  cafeOrders.forEach(o => {
    const hour = new Date(o.timestamp).getHours();
    hourlyCounts[hour] += 1;
  });

  const activeHours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const maxHourOrders = Math.max(...activeHours.map(h => hourlyCounts[h])) || 1;

  return (
    <div style={{ backgroundColor: 'var(--bg-platform)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="app-header">
        <div className="container flex-between">
          <div className="app-logo">
            <Coffee size={28} />
            <span>TableBite</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '4px', marginLeft: '12px', fontWeight: 600 }}>
              {currentRole.toUpperCase()} PORTAL
            </span>
          </div>

          <div className="flex-row">
            {/* Cloud Sync Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isCloudSyncActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', padding: '6px 12px', borderRadius: '8px', border: isCloudSyncActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.8rem', color: isCloudSyncActive ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isCloudSyncActive ? '#10b981' : '#f59e0b', display: 'inline-block' }} className={isCloudSyncActive ? 'pulse-glow' : ''}></span>
              <span className="desktop-only">{isCloudSyncActive ? 'Cloud Sync Active' : 'Offline Demo Mode'}</span>
              <span className="mobile-only">{isCloudSyncActive ? 'Cloud' : 'Offline'}</span>
            </div>

            {/* SaaS Role Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role:</span>
              <select 
                value={currentRole} 
                onChange={(e) => setCurrentRole(e.target.value as Role)}
                style={{ 
                  background: 'none', border: 'none', color: '#fff', 
                  fontSize: '0.85rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
                  paddingRight: '20px'
                }}
              >
                <option value="manager" style={{ background: '#0e111a', color: '#fff' }}>Manager / Owner</option>
                <option value="chef" style={{ background: '#0e111a', color: '#fff' }}>Chef (KDS)</option>
                <option value="waiter" style={{ background: '#0e111a', color: '#fff' }}>Waiter Floor</option>
              </select>
            </div>

            {currentCafe.logoUrl && (
              <img 
                src={currentCafe.logoUrl} 
                alt="Logo" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
              />
            )}
            <span style={{ fontWeight: 600 }} className="desktop-only">{currentCafe.name}</span>
            <button className="btn btn-outline btn-sm" onClick={logout} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="dashboard-layout container">
        
        {/* Sidebar (Adapts based on Active Role) */}
        <aside className="sidebar">
          {currentRole === 'manager' && (
            <>
              <div className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                <ClipboardList size={20} />
                <span>Live Orders</span>
                {pendingOrders.length > 0 && (
                  <span style={{ background: 'var(--danger)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto', fontWeight: 'bold' }} className="pulse-glow">
                    {pendingOrders.length}
                  </span>
                )}
              </div>
              <div className={`sidebar-link ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
                <Layers size={20} />
                <span>Menu Editor</span>
              </div>
              <div className={`sidebar-link ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>
                <QrCode size={20} />
                <span>Tables & QRs</span>
              </div>
              <div className={`sidebar-link ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>
                <Sliders size={20} />
                <span>Customization</span>
              </div>
              <div className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                <BarChart3 size={20} />
                <span>Analytics</span>
              </div>
              <div className={`sidebar-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                <MessageSquare size={20} />
                <span>Reviews & Feed</span>
                {cafeReviews.length > 0 && (
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>
                    {cafeReviews.length}
                  </span>
                )}
              </div>
            </>
          )}

          {currentRole === 'chef' && (
            <div className="sidebar-link active">
              <ChefHat size={20} />
              <span>Kitchen Screen</span>
              {(pendingOrders.length + preparingOrders.length) > 0 && (
                <span style={{ background: 'var(--danger)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>
                  {pendingOrders.length + preparingOrders.length}
                </span>
              )}
            </div>
          )}

          {currentRole === 'waiter' && (
            <div className="sidebar-link active">
              <Bell size={20} />
              <span>Floor Alerts</span>
              {pendingCalls.length > 0 && (
                <span style={{ background: 'var(--warning)', color: '#000', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto', fontWeight: 'bold' }} className="pulse-glow">
                  {pendingCalls.length}
                </span>
              )}
            </div>
          )}

          {/* Cloud Sync Integration Card (Desktop only, under the sidebar links) */}
          <div className="desktop-only" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isCloudSyncActive ? (
              <div className="glass-card" style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.04)', borderColor: 'rgba(16, 185, 129, 0.15)', margin: 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: '#34d399' }}>Cloud Connected</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      Real-time cloud database sync and cross-device alerts are running.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.03)', borderColor: 'rgba(245, 158, 11, 0.15)', margin: 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: '#fbbf24' }}>Offline Demo Mode</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      Using local storage. Connect Supabase to test live split-screen updates.
                    </p>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px', borderRadius: '6px', fontSize: '0.68rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>How to link:</div>
                  <ol style={{ paddingLeft: '12px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <li>Create Supabase project</li>
                    <li>Run script in SQL Editor</li>
                    <li>Copy keys to <code style={{ color: '#016dc1', background: 'rgba(255,255,255,0.02)', padding: '1px 3px', borderRadius: '2px' }}>.env</code></li>
                    <li>Restart local dev server</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Dashboard Panels */}
        <main className="dashboard-content animate-fade-in">
          
          {/* ================= ROLE: MANAGER VIEWS ================= */}
          {currentRole === 'manager' && (
            <>
              {/* TAB 1: LIVE ORDERS QUEUE */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.75rem' }}>Live Order Queue</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time orders placing from cafe tables</p>
                    </div>
                  </div>

                  {pendingOrders.length > 0 && (
                    <div className="new-order-banner">
                      <div className="flex-row">
                        <AlertCircle size={20} />
                        <span>You have {pendingOrders.length} new pending orders!</span>
                      </div>
                    </div>
                  )}

                  {cafeOrders.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                      <h3>No Orders Yet</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '8px auto' }}>
                        Open a Customer Menu tab via "Tables & QRs", submit an order, and watch it show up here instantly in real-time!
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {pendingOrders.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--warning)', marginBottom: '16px', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '8px' }}>
                            New Requests ({pendingOrders.length})
                          </h3>
                          <div className="orders-grid">
                            {pendingOrders.map(order => (
                              <OrderCard key={order.id} order={order} onAdvance={updateOrderStatus} />
                            ))}
                          </div>
                        </div>
                      )}

                      {preparingOrders.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3b82f6', marginBottom: '16px', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '8px' }}>
                            In Kitchen ({preparingOrders.length})
                          </h3>
                          <div className="orders-grid">
                            {preparingOrders.map(order => (
                              <OrderCard key={order.id} order={order} onAdvance={updateOrderStatus} />
                            ))}
                          </div>
                        </div>
                      )}

                      {servedOrders.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '16px', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', paddingBottom: '8px' }}>
                            Served - Unpaid ({servedOrders.length})
                          </h3>
                          <div className="orders-grid">
                            {servedOrders.map(order => (
                              <OrderCard key={order.id} order={order} onAdvance={updateOrderStatus} />
                            ))}
                          </div>
                        </div>
                      )}

                      {paidOrders.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary)', marginBottom: '16px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '8px' }}>
                            Paid & Completed ({paidOrders.length})
                          </h3>
                          <div className="orders-grid">
                            {paidOrders.map(order => (
                              <OrderCard key={order.id} order={order} onAdvance={updateOrderStatus} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MENU MANAGER */}
              {activeTab === 'menu' && (
                <div>
                  <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.75rem' }}>Menu Management</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add, update, or remove items from your menu card</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingItem(null);
                        setItemName('');
                        setItemDesc('');
                        setItemPrice('');
                        setItemImage('');
                        setItemCategory('');
                        setItemVeg(true);
                        setItemAvailable(true);
                        setIsItemModalOpen(true);
                      }}
                    >
                      <Plus size={18} /> Add Menu Item
                    </button>
                  </div>

                  {currentCafe.menu.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                      <h3>Your Menu is Empty</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Add some delicious food items to get started.</p>
                    </div>
                  ) : (
                    <>
                      <div className="desktop-only">
                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                <th style={{ padding: '16px 24px' }}>Item</th>
                                <th style={{ padding: '16px 24px' }}>Category</th>
                                <th style={{ padding: '16px 24px' }}>Price</th>
                                <th style={{ padding: '16px 24px' }}>Diet</th>
                                <th style={{ padding: '16px 24px' }}>Availability</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentCafe.menu.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                                    />
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {item.description}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                      {item.category}
                                    </span>
                                  </td>
                                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>${item.price.toFixed(2)}</td>
                                  <td style={{ padding: '16px 24px' }}>
                                    {item.isVeg ? (
                                      <span className="diet-indicator veg" title="Vegetarian" />
                                    ) : (
                                      <span className="diet-indicator nonveg" title="Non-Vegetarian" />
                                    )}
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <button 
                                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                      onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                                    >
                                      {item.isAvailable ? (
                                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)' }}>In Stock</span>
                                      ) : (
                                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>Sold Out</span>
                                      )}
                                    </button>
                                  </td>
                                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                      <button className="btn btn-outline btn-sm" style={{ padding: '6px' }} onClick={() => handleEditClick(item)}>
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        className="btn btn-outline btn-sm" 
                                        style={{ padding: '6px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                                        onClick={() => {
                                          if (confirm('Delete this menu item?')) {
                                            deleteMenuItem(item.id);
                                          }
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {currentCafe.menu.map((item) => (
                          <div key={item.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} 
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                  <h4 style={{ fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</h4>
                                  <span style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>${item.price.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {item.category}
                                  </span>
                                  {item.isVeg ? (
                                    <span className="diet-indicator veg" style={{ scale: '0.8' }} title="Vegetarian" />
                                  ) : (
                                    <span className="diet-indicator nonveg" style={{ scale: '0.8' }} title="Non-Vegetarian" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                              {item.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                              <button 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                              >
                                {item.isAvailable ? (
                                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.75rem', padding: '4px 8px' }}>In Stock</span>
                                ) : (
                                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '0.75rem', padding: '4px 8px' }}>Sold Out</span>
                                )}
                              </button>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} onClick={() => handleEditClick(item)}>
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button 
                                  className="btn btn-outline btn-sm" 
                                  style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                                  onClick={() => {
                                    if (confirm('Delete this menu item?')) {
                                      deleteMenuItem(item.id);
                                    }
                                  }}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: TABLES & QR CODE GENERATOR */}
              {activeTab === 'tables' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Table Management & QR Codes</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generate table QRs for quick scanning and ordering</p>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Add a New Table</h3>
                    <form onSubmit={handleAddTableSubmit} className="flex-row" style={{ flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                        <input 
                          type="number" 
                          className="glass-input" 
                          placeholder="e.g. 6" 
                          value={newTableNum}
                          onChange={(e) => setNewTableNum(e.target.value)}
                          style={{ padding: '8px 12px' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ height: '42px' }}>
                        <Plus size={16} /> Add Table
                      </button>
                      {tableError && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{tableError}</span>}
                    </form>
                  </div>

                  {currentCafe.tables.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                      <QrCode size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                      <h3>No Tables Registered</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Register table numbers to generate order links and QR codes.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                      {currentCafe.tables.map(tNum => (
                        <div key={tNum} className="glass-card qr-card">
                          <div className="flex-between" style={{ width: '100%' }}>
                            <h4 style={{ fontSize: '1.2rem' }}>Table {tNum}</h4>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                              onClick={() => {
                                if (confirm(`Remove Table ${tNum}? This will disable the corresponding QR code.`)) {
                                  deleteTable(tNum);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="qr-image-wrapper">
                            <img src={getQRUrl(tNum)} alt={`Table ${tNum} QR Code`} className="qr-image" />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <a href={getTableUrl(tNum)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <ExternalLink size={14} /> Open Menu Page
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BRAND CUSTOMIZATION */}
              {activeTab === 'design' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Branding & Customization</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customize your guest ordering page styles and branding assets</p>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: 'var(--secondary)' }} /> Brand Palette Presets
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {BRAND_PRESETS.map((preset, i) => (
                        <button key={i} type="button" className="btn btn-outline btn-sm" onClick={() => applyPreset(preset.colors)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.colors.primary }} />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleDesignSave} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>General Branding Details</h3>
                    
                    <div className="grid-2">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Display Name</label>
                        <input type="text" className="glass-input" value={cafeName} onChange={(e) => setCafeName(e.target.value)} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logo Image URL</label>
                        <input type="text" className="glass-input" placeholder="e.g. https://domain.com/logo.jpg" value={cafeLogo} onChange={(e) => setCafeLogo(e.target.value)} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '12px' }}>Color Scheme Customization</h3>
                    
                    <div className="grid-3">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Color</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: primaryColor }}>
                            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secondary Accent</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: secondaryColor }}>
                            <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Background Theme</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: bgColor }}>
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Card Color</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: cardColor }}>
                            <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={cardColor} onChange={(e) => setCardColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Text</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: textColor }}>
                            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Muted Text</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: textMutedColor }}>
                            <input type="color" value={textMutedColor} onChange={(e) => setTextMutedColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={textMutedColor} onChange={(e) => setTextMutedColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Borders & Divs</label>
                        <div className="color-picker-group">
                          <div className="color-swatch" style={{ background: borderColor }}>
                            <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                          </div>
                          <input type="text" className="glass-input" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem', flex: 1 }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                      <button type="submit" className="btn btn-primary">
                        <Check size={18} /> Save Settings & Apply Theme
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: ANALYTICS DASHBOARD (Vanilla CSS Charts) */}
              {activeTab === 'analytics' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Business Insights & Analytics</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time revenue reports and dining metrics</p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</span>
                      <h3 style={{ fontSize: '2rem', marginTop: '8px', color: 'var(--secondary)' }}>${totalRevenue.toFixed(2)}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From {cafeOrders.length} orders</span>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Avg. Order Size</span>
                      <h3 style={{ fontSize: '2rem', marginTop: '8px', color: 'var(--primary)' }}>${avgOrderValue.toFixed(2)}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per checkout session</span>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Reviews</span>
                      <h3 style={{ fontSize: '2rem', marginTop: '8px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {avgRating.toFixed(1)} <Star size={24} fill="currentColor" />
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {cafeReviews.length} reviews</span>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Calls</span>
                      <h3 style={{ fontSize: '2rem', marginTop: '8px', color: '#f59e0b' }}>{pendingCalls.length} Alerts</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting waiter action</span>
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '32px' }}>
                    {/* Bestseller Items (Horizontal CSS Bar Chart) */}
                    <div className="glass-card" style={{ padding: '28px' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Bestselling Dishes</h3>
                      
                      {bestsellers.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No items sold yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {bestsellers.map((item, idx) => {
                            const percent = (item.qty / maxQtySold) * 100;
                            return (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>{item.qty} units sold (${item.revenue.toFixed(2)})</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #a78bfa 100%)', borderRadius: '4px' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Hourly Peak Analysis (Vertical CSS Bar Chart) */}
                    <div className="glass-card" style={{ padding: '28px' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Hourly Peak Analytics</h3>
                      
                      <div style={{ display: 'flex', height: '180px', alignItems: 'end', gap: '10px', justifyContent: 'space-between', padding: '10px 0' }}>
                        {activeHours.map((hr) => {
                          const orderCount = hourlyCounts[hr];
                          const heightPct = (orderCount / maxHourOrders) * 100;
                          return (
                            <div key={hr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'end', gap: '8px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: orderCount > 0 ? 1 : 0.4 }}>
                                {orderCount}
                              </div>
                              <div 
                                style={{ 
                                  width: '100%', 
                                  height: `${heightPct}%`, 
                                  background: 'linear-gradient(180deg, var(--secondary) 0%, #047857 100%)', 
                                  borderRadius: '3px',
                                  transition: 'height 0.5s ease',
                                  minHeight: orderCount > 0 ? '4px' : '0px'
                                }} 
                                title={`${orderCount} orders at ${hr}:00`}
                              />
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {hr > 12 ? `${hr - 12}p` : `${hr}a`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: FEEDBACK & REVIEWS */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Guest Feedback & Reviews</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real comments and ratings left by checked-out table customers</p>
                  </div>

                  {cafeReviews.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                      <h3>No Reviews Yet</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reviews will appear once customers place orders and submit feedback.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {cafeReviews.map((review) => (
                        <div key={review.id} className="glass-card" style={{ padding: '24px' }}>
                          <div className="flex-between" style={{ marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{review.customerName}</h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(review.timestamp).toLocaleDateString()} at {new Date(review.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '2px', color: 'var(--warning)' }}>
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} stroke="currentColor" />
                              ))}
                            </div>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.6 }}>
                            "{review.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ================= ROLE: CHEF KDS PANEL ================= */}
          {currentRole === 'chef' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ChefHat size={32} style={{ color: 'var(--primary)' }} /> Kitchen Display Screen (KDS)
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active food preparation orders and elapsed ticket timers</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    Active Orders: {pendingOrders.length + preparingOrders.length}
                  </span>
                </div>
              </div>

              {(pendingOrders.length + preparingOrders.length) === 0 ? (
                <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center' }}>
                  <CheckCircle2 size={48} style={{ color: 'var(--secondary)', marginBottom: '16px' }} />
                  <h3>All Orders Served!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Excellent work! Ready for new orders.</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {[...pendingOrders, ...preparingOrders].map((order) => {
                    const elapsed = formatTimeElapsed(order.timestamp);
                    const isNew = order.status === 'pending';
                    
                    return (
                      <div key={order.id} className={`glass-card order-card status-${order.status}`} style={{ padding: '24px', background: isNew ? 'rgba(245, 158, 11, 0.03)' : 'rgba(13,16,27,0.7)' }}>
                        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '1.25rem' }}>Table {order.tableNum}</h4>
                            <span 
                              style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                fontSize: '0.75rem', fontWeight: 700, marginTop: '4px',
                                color: isNew ? 'var(--warning)' : '#60a5fa'
                              }}
                            >
                              <ClockIcon size={12} /> Waiting: {elapsed}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', background: isNew ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: isNew ? '#fbbf24' : '#60a5fa', border: isNew ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(59,130,246,0.3)' }}>
                            {isNew ? 'AWAITING START' : 'PREPARING'}
                          </span>
                        </div>

                        {/* Order Items list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0', minHeight: '100px' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 600 }}>
                              <span>{item.quantity}x {item.menuItem.name}</span>
                              {item.menuItem.isVeg ? (
                                <span className="diet-indicator veg" style={{ scale: '0.8' }} />
                              ) : (
                                <span className="diet-indicator nonveg" style={{ scale: '0.8' }} />
                              )}
                            </div>
                          ))}
                        </div>

                        {isNew ? (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                          >
                            <Play size={14} /> Start Preparation
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ width: '100%', padding: '12px', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' }}
                            onClick={() => updateOrderStatus(order.id, 'served')}
                          >
                            <CheckSquare size={14} /> Mark as Ready
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= ROLE: WAITER FLOOR VIEW ================= */}
          {currentRole === 'waiter' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={32} style={{ color: 'var(--warning)' }} /> Waiter Floor Management
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Live table assistance requests and call list</p>
                </div>
                <div>
                  <span style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.25)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }} className={pendingCalls.length > 0 ? 'pulse-glow' : ''}>
                    Pending Alerts: {pendingCalls.length}
                  </span>
                </div>
              </div>

              {/* Waiter Calls Queue */}
              {pendingCalls.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', marginBottom: '32px' }}>
                  <Bell size={44} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h3>No Active Service Requests</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Table alerts will trigger audio pings and appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  {pendingCalls.map((call) => {
                    const elapsed = formatTimeElapsed(call.timestamp);
                    let alertType = 'Needs Assistance';
                    let alertColor = 'var(--primary)';
                    let alertBg = 'rgba(99,102,241,0.12)';
                    
                    if (call.type === 'water') {
                      alertType = 'Requested Water';
                      alertColor = '#60a5fa';
                      alertBg = 'rgba(96,165,250,0.12)';
                    } else if (call.type === 'bill') {
                      alertType = 'Requested Bill';
                      alertColor = '#34d399';
                      alertBg = 'rgba(52,211,153,0.12)';
                    }

                    return (
                      <div key={call.id} className="glass-card pulse-glow" style={{ padding: '20px', borderLeft: `4px solid ${alertColor}` }}>
                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '1.2rem' }}>Table {call.tableNum}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ClockIcon size={10} /> {elapsed} ago
                          </span>
                        </div>
                        
                        <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', background: alertBg, color: alertColor, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>
                          {alertType}
                        </div>

                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                          onClick={() => {
                            resolveWaiterCall(call.id);
                            playChime(true); // play a resolver confirmation chime
                          }}
                        >
                          <Check size={14} /> Mark as Resolved
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Floor status list */}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Table Floor Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {currentCafe.tables.map((tNum) => {
                  const hasAlert = pendingCalls.some(c => c.tableNum === tNum);
                  const activeOrder = orders.find(o => o.cafeId === currentCafe.id && o.tableNum === tNum && o.status !== 'paid');
                  
                  return (
                    <div 
                      key={tNum} 
                      className="glass-card" 
                      style={{ 
                        padding: '20px', 
                        borderColor: hasAlert ? 'var(--warning)' : activeOrder ? 'var(--primary)' : 'var(--border-color)',
                        background: hasAlert ? 'rgba(245,158,11,0.02)' : activeOrder ? 'rgba(99,102,241,0.02)' : 'rgba(13,16,27,0.7)'
                      }}
                    >
                      <h4 style={{ fontSize: '1.15rem' }}>Table {tNum}</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Status:{' '}
                          <strong style={{ color: hasAlert ? 'var(--warning)' : activeOrder ? 'var(--primary)' : 'var(--secondary)' }}>
                            {hasAlert ? 'ALERTING' : activeOrder ? activeOrder.status.toUpperCase() : 'FREE'}
                          </strong>
                        </span>
                        {activeOrder && (
                          <span>Guest: {activeOrder.customerName}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Item Modal Form */}
      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}>
        <form onSubmit={handleItemSubmit} className="payment-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item Name</label>
            <input type="text" className="glass-input" placeholder="e.g. Classic Margherita Pizza" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
            <textarea className="glass-input" placeholder="Describe the taste, ingredients..." value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} required />
          </div>

          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price ($)</label>
              <input type="number" step="0.01" min="0" className="glass-input" placeholder="e.g. 12.99" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} required />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
              <input type="text" className="glass-input" placeholder="e.g. Mains, Drinks" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image URL</label>
            <input type="text" className="glass-input" placeholder="e.g. https://images.unsplash.com/..." value={itemImage} onChange={(e) => setItemImage(e.target.value)} />
          </div>

          <div className="flex-between" style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="isVegCheckbox" checked={itemVeg} onChange={(e) => setItemVeg(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="isVegCheckbox" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Vegetarian (Veg Tag)</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="isAvailableCheckbox" checked={itemAvailable} onChange={(e) => setItemAvailable(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="isAvailableCheckbox" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Available (In Stock)</label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            {editingItem ? 'Save Changes' : 'Add Item to Menu'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

// Sub-Component: OrderCard
interface OrderCardProps {
  order: Order;
  onAdvance: (id: string, status: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onAdvance }) => {
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <span className="badge badge-status" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.25)' }}>NEW REQUEST</span>;
      case 'preparing': return <span className="badge badge-status" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.25)' }}>IN KITCHEN</span>;
      case 'served': return <span className="badge badge-status" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.25)' }}>SERVED</span>;
      case 'paid': return <span className="badge badge-status" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', borderColor: 'rgba(16,185,129,0.25)' }}>PAID & COMPLETED</span>;
    }
  };

  const getActionButton = (status: Order['status']) => {
    switch (status) {
      case 'pending': 
        return (
          <button className="btn btn-secondary btn-sm" onClick={() => onAdvance(order.id, 'preparing')} style={{ width: '100%' }}>
            <Play size={14} /> Send to Kitchen
          </button>
        );
      case 'preparing':
        return (
          <button className="btn btn-primary btn-sm" onClick={() => onAdvance(order.id, 'served')} style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' }}>
            <CheckSquare size={14} /> Mark as Served
          </button>
        );
      case 'served':
        return (
          <button className="btn btn-secondary btn-sm" onClick={() => onAdvance(order.id, 'paid')} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <DollarSign size={14} /> Complete Payment
          </button>
        );
      case 'paid':
        return (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center', padding: '8px' }}>
            Archived Order
          </span>
        );
    }
  };

  const formattedTime = new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`glass-card order-card status-${order.status}`} style={{ padding: '20px' }}>
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem' }}>Table {order.tableNum}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ordered at {formattedTime}</span>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={12} /> <span>{order.customerName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Phone size={12} /> <span>{order.customerPhone}</span>
        </div>
      </div>

      <div className="order-items-list">
        {order.items.map((item, idx) => (
          <div key={idx} className="order-item-row">
            <span>{item.quantity}x {item.menuItem.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', marginBottom: '16px' }}>
        <span style={{ fontWeight: 600 }}>Total Value:</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--secondary)' }}>${order.totalAmount.toFixed(2)}</span>
      </div>

      {getActionButton(order.status)}
    </div>
  );
};

// Help local clock icon
const ClockIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
