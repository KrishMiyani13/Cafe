import React, { useState, useEffect } from 'react';
import { useCafe } from '../context/CafeContext';
import type { Cafe, MenuItem } from '../context/CafeContext';
import { Modal } from '../components/Modal';
import { 
  Search, ShoppingBag, X, Plus, Minus, Check, CreditCard, 
  ChevronRight, Smartphone, AlertCircle, Utensils, CheckCircle2, 
  Bell, Globe, Star, Mail, MapPin, Phone 
} from 'lucide-react';

interface CustomerMenuProps {
  cafeId: string;
  tableNum: number;
}

type Lang = 'en' | 'hi' | 'gu';

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to',
    subtitle: "Choose your favorites from our kitchen, complete checkout, and we'll deliver it straight to Table",
    search: 'Search our delicious items...',
    vegOnly: 'Veg Only',
    add: 'Add +',
    cartFloating: 'Added',
    viewCart: 'View Order Drawer',
    subtotal: 'Subtotal',
    summary: 'Your Order Summary',
    checkoutBtn: 'Place Order & Send to Kitchen',
    checkoutTitle: 'Confirm Table Order',
    contact: 'Contact Information',
    name: 'Your Name',
    phone: 'Mobile Number',
    paymentMethod: 'Select Payment Method',
    card: 'Credit/Debit Card',
    upi: 'Instant UPI',
    payBtn: 'Confirm & Place Order',
    statusTitle: 'Your Order Status',
    stepperOrdered: 'Ordered',
    stepperPreparing: 'Preparing',
    stepperServed: 'Served',
    stepperPaid: 'Paid',
    orderAgain: 'Order Completed! Order Again',
    callWaiter: 'Call Waiter',
    waiterSuccess: 'Waiter notified! Someone will assist you shortly.',
    requestWater: 'Ask for Water',
    requestBill: 'Request Bill',
    needAssistance: 'Call Waiter',
    upsellTitle: 'Complete Your Meal',
    recommendText: 'Often bought together:',
    loyaltyTitle: 'TableBite Loyalty Program',
    loyaltyDiscount: '15% Loyalty Discount Applied!',
    loyaltyProgress: 'You have ordered {count} times! Order 5 times to get a 15% discount on your next visit.',
    feedbackTitle: 'Rate Your Dining Experience',
    feedbackPlaceholder: 'Tell us how was the food and service...',
    submitFeedbackBtn: 'Submit Review',
    feedbackSuccess: 'Thank you for your feedback!'
  },
  hi: {
    welcome: 'स्वागत है',
    subtitle: 'रसोई से अपने पसंदीदा व्यंजन चुनें, चेकआउट करें, और हम इसे सीधे आपके टेबल पर पहुंचाएंगे',
    search: 'स्वादिष्ट व्यंजन खोजें...',
    vegOnly: 'केवल शाकाहारी',
    add: 'जोड़ें +',
    cartFloating: 'जुड़े हुए',
    viewCart: 'ऑर्डर ड्रावर देखें',
    subtotal: 'कुल योग',
    summary: 'आपके ऑर्डर का सारांश',
    checkoutBtn: 'ऑर्डर दें और रसोई में भेजें',
    checkoutTitle: 'टेबल ऑर्डर की पुष्टि करें',
    contact: 'संपर्क जानकारी',
    name: 'आपका नाम',
    phone: 'मोबाइल नंबर',
    paymentMethod: 'भुगतान का तरीका चुनें',
    card: 'क्रेडिट/डेबिट कार्ड',
    upi: 'त्वरित UPI',
    payBtn: 'ऑर्डर की पुष्टि करें और भेजें',
    statusTitle: 'आपके ऑर्डर की स्थिति',
    stepperOrdered: 'ऑर्डर दिया',
    stepperPreparing: 'तैयार हो रहा है',
    stepperServed: 'परोसा गया',
    stepperPaid: 'भुगतान हुआ',
    orderAgain: 'ऑर्डर पूरा हुआ! फिर से ऑर्डर करें',
    callWaiter: 'वेटर बुलाएं',
    waiterSuccess: 'वेटर को सूचित कर दिया गया है! जल्द ही आपकी सहायता की जाएगी।',
    requestWater: 'पानी मांगें',
    requestBill: 'बिल मांगें',
    needAssistance: 'वेटर बुलाएं',
    upsellTitle: 'भोजन पूरा करें',
    recommendText: 'अक्सर साथ में खरीदा जाता है:',
    loyaltyTitle: 'लॉयल्टी प्रोग्राम',
    loyaltyDiscount: '15% लॉयल्टी छूट लागू की गई!',
    loyaltyProgress: 'आपने {count} बार ऑर्डर किया है! अगली यात्रा पर 15% छूट पाने के लिए 5 बार ऑर्डर करें।',
    feedbackTitle: 'अपने भोजन अनुभव को रेट करें',
    feedbackPlaceholder: 'हमें बताएं कि भोजन और सेवा कैसी थी...',
    submitFeedbackBtn: 'समीक्षा जमा करें',
    feedbackSuccess: 'आपकी प्रतिक्रिया के लिए धन्यवाद!'
  },
  gu: {
    welcome: 'સ્વાગત છે',
    subtitle: 'રસોડામાંથી તમારી મનપસંદ વાનગીઓ પસંદ કરો, ચેકઆઉટ કરો અને અમે તેને સીધા તમારા ટેબલ પર પહોંચાડીશું',
    search: 'સ્વાદિષ્ટ વાનગીઓ શોધો...',
    vegOnly: 'માત્ર શાકાહારી',
    add: 'ઉમેરો +',
    cartFloating: 'ઉમેરાયેલ',
    viewCart: 'ઓર્ડર ડ્રોઅર જુઓ',
    subtotal: 'પેટા સરવાળો',
    summary: 'તમારા ઓર્ડરનો સારાંશ',
    checkoutBtn: 'ઓર્ડર આપો અને રસોડામાં મોકલો',
    checkoutTitle: 'ટેબલ ઓર્ડરની પુષ્ટિ કરો',
    contact: 'સંપર્ક માહિતી',
    name: 'તમારું નામ',
    phone: 'મોબાઇલ નંબર',
    paymentMethod: 'ચુકવણી પદ્ધતિ પસંદ કરો',
    card: 'ક્રેડિટ/ડેબિટ - કાર્ડ',
    upi: 'ત્વરિત UPI',
    payBtn: 'ઓર્ડરની પુષ્ટિ કરો અને મોકલો',
    statusTitle: 'તમારા ઓર્ડરની સ્થિતિ',
    stepperOrdered: 'ઓર્ડર આપ્યો',
    stepperPreparing: 'ત્યાર થાય છે',
    stepperServed: 'પીરસવામાં આવ્યું',
    stepperPaid: 'ચુકવણી થઈ',
    orderAgain: 'ઓર્ડર પૂર્ણ થયો! ફરીથી ઓર્ડર કરો',
    callWaiter: 'વેઇટરને બોલાવો',
    waiterSuccess: 'વેઇટરને જાણ કરવામાં આવી છે! ટૂંક સમયમાં તમારી સહાય કરવામાં આવશે.',
    requestWater: 'પાણી મંગાવો',
    requestBill: 'બિલ મંગાવો',
    needAssistance: 'વેઇટરને બોલાવો',
    upsellTitle: 'ભોજન પૂર્ણ કરો',
    recommendText: 'સામાન્ય રીતે સાથે ખરીદવામાં આવે છે:',
    loyaltyTitle: 'લોયલ્ટી પ્રોગ્રામ',
    loyaltyDiscount: '15% લોયલ્ટી ડિસ્કાઉન્ટ લાગુ કરવામાં આવ્યું!',
    loyaltyProgress: 'તમે {count} વાર ઓર્ડર આપ્યો છે! આગલી વખતે 15% ડિસ્કાઉન્ટ મેળવવા માટે 5 વાર ઓર્ડર આપો.',
    feedbackTitle: 'તમારા ભોજનના અનુભવને રેટ કરો',
    feedbackPlaceholder: 'અમને જણાવો કે ખોરાક અને સેવા કેવી હતી...',
    submitFeedbackBtn: 'સમીક્ષા સબમિટ કરો',
    feedbackSuccess: 'પ્રતિસાદ આપવા બદલ આભાર!'
  }
};

export const CustomerMenu: React.FC<CustomerMenuProps> = ({ cafeId, tableNum }) => {
  const { cafes, orders, placeOrder, callWaiter, submitFeedback, getCustomerOrderCount, payAllTableOrders } = useCafe();
  const [cafe, setCafe] = useState<Cafe | null>(null);

  // Cart state
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPayBillOpen, setIsPayBillOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'upi' | 'cash'>('upi');
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Active Order tracking states
  const [prevActiveOrdersCount, setPrevActiveOrdersCount] = useState(0);

  // Calculate active table orders
  const activeTableOrders = orders.filter(
    o => o.cafeId === cafeId && o.tableNum === tableNum && o.status !== 'paid'
  );

  // SaaS Features states
  const [selectedLang, setSelectedLang] = useState<Lang>('en');
  const [isWaiterMenuOpen, setIsWaiterMenuOpen] = useState(false);
  const [waiterStatusText, setWaiterStatusText] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  // Aesthetic Visual States
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [itemId: string]: boolean }>({});
  const [scrollPercent, setScrollPercent] = useState(0);

  // Track page scroll percentage for top indicator bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const percent = (window.scrollY / totalScroll) * 100;
        setScrollPercent(percent);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Load cafe and active orders
  useEffect(() => {
    const match = cafes.find(c => c.id === cafeId);
    if (match) {
      setCafe(match);
    }
  }, [cafes, cafeId]);

  // Check if all active orders have been paid to trigger reviews
  useEffect(() => {
    if (activeTableOrders.length === 0 && prevActiveOrdersCount > 0) {
      setIsFeedbackOpen(true);
    }
    setPrevActiveOrdersCount(activeTableOrders.length);
  }, [orders, cafeId, tableNum]);

  // Intersection Observer for scroll-linked card stagger slide-up
  useEffect(() => {
    if (!cafe) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-fade-in');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [cafe, searchQuery, selectedCategory, isVegOnly]);

  if (!cafe) {
    return (
      <div style={{ backgroundColor: 'var(--bg-platform)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '400px' }}>
          <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h3>Cafe Not Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
            We could not locate this cafe. Please scan the QR code at your table again.
          </p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: '20px' }} onClick={() => window.location.hash = '#/'}>
            Go to Platform Home
          </button>
        </div>
      </div>
    );
  }

  // Multi-Language localization hook helper
  const t = TRANSLATIONS[selectedLang];

  // Dynamic Theme Ingestion
  const cafeStyles = {
    '--cafe-primary': cafe.colors.primary,
    '--cafe-primary-rgb': cafe.colors.primaryRgb,
    '--cafe-secondary': cafe.colors.secondary,
    '--cafe-bg': cafe.colors.bg,
    '--cafe-card': cafe.colors.card,
    '--cafe-text': cafe.colors.text,
    '--cafe-text-muted': cafe.colors.textMuted,
    '--cafe-border': cafe.colors.border,
  } as React.CSSProperties;

  // Extract categories
  const categories = ['All', ...Array.from(new Set(cafe.menu.map(item => item.category)))];

  // Filters menu items
  const filteredMenu = cafe.menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = !isVegOnly || item.isVeg;
    return matchesSearch && matchesCategory && matchesVeg && item.isAvailable;
  });



  // Cart operations
  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId] -= 1;
      }
      return updated;
    });
  };
  const isLoyaltyMember = customerPhone.length > 5;
  const pastOrdersCount = isLoyaltyMember ? getCustomerOrderCount(customerPhone) : 0;
  const isDiscountEligible = isLoyaltyMember && (pastOrdersCount + 1) >= 5;

  const getCartTotalItems = () => {
    return Object.values(cart).reduce((acc, curr) => acc + curr, 0);
  };

  const getCartSubtotal = () => {
    return Object.entries(cart).reduce((acc, [itemId, qty]) => {
      const item = cafe.menu.find(m => m.id === itemId);
      return acc + (item ? item.price * qty : 0);
    }, 0);
  };

  const rawSubtotal = getCartSubtotal();
  const loyaltyDiscount = isDiscountEligible ? rawSubtotal * 0.15 : 0;
  const cartFinalTotal = rawSubtotal - loyaltyDiscount;

  // AI Recommendation Engine
  const getAIRecommendation = (): MenuItem | null => {
    const cartItemIds = Object.keys(cart);
    if (cartItemIds.length === 0) return null;

    const hasPizza = cartItemIds.some(id => {
      const itm = cafe.menu.find(m => m.id === id);
      return itm?.category.toLowerCase() === 'pizza';
    });

    const hasPasta = cartItemIds.some(id => {
      const itm = cafe.menu.find(m => m.id === id);
      return itm?.category.toLowerCase() === 'pasta';
    });

    if (hasPizza) {
      const match = cafe.menu.find(itm => itm.category.toLowerCase() === 'pasta' && !cart[itm.id]);
      if (match) return match;
    }
    if (hasPasta) {
      const match = cafe.menu.find(itm => itm.category.toLowerCase() === 'pizza' && !cart[itm.id]);
      if (match) return match;
    }

    const fallback = cafe.menu.find(itm => !cart[itm.id]);
    return fallback || null;
  };

  const recommendedItem = getAIRecommendation();

  // Submit checkout
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Please fill out your name and phone number.');
      return;
    }

    const orderItems = Object.entries(cart).map(([itemId, qty]) => {
      const menuItem = cafe.menu.find(m => m.id === itemId)!;
      return { menuItem, quantity: qty };
    });

    // place order (stores finalized amount with loyalty applied)
    const placedOrder = placeOrder(
      cafe.id,
      tableNum,
      orderItems,
      customerName,
      customerPhone
    );

    // Override total amount if loyalty discount applied
    if (isDiscountEligible) {
      placedOrder.totalAmount = cartFinalTotal;
      // update order database
      const storedOrders = localStorage.getItem('tablebite_orders');
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        const updated = parsed.map((o: any) => o.id === placedOrder.id ? { ...o, totalAmount: cartFinalTotal } : o);
        localStorage.setItem('tablebite_orders', JSON.stringify(updated));
      }
    }

    // Reset checkout & cart
    setCart({});
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  // Submit payment & complete bill checkout
  const handlePayBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTableOrders.length === 0) return;

    if (selectedPayment === 'cash' || selectedPayment === 'card') {
      // Trigger waiter bill call to notify counter
      callWaiter(cafe.id, tableNum, 'bill');
    }

    payAllTableOrders(cafe.id, tableNum);

    setIsPayBillOpen(false);
  };

  // Waiter Call Trigger
  const handleCallWaiter = (type: 'assistance' | 'water' | 'bill') => {
    callWaiter(cafe.id, tableNum, type);
    setIsWaiterMenuOpen(false);
    setWaiterStatusText(t.waiterSuccess);
    setTimeout(() => setWaiterStatusText(''), 5000);
  };

  // Submit reviews
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(cafe.id, feedbackRating, feedbackComment, customerName);
    setFeedbackComment('');
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
      setIsFeedbackOpen(false);
    }, 2000);
  };

  return (
    <div className="customer-portal" style={cafeStyles}>
      {/* Scroll progress indicator */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollPercent}%` }} />
      </div>

      {/* Floating background animated blur blobs */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />

      {/* Customer Page Header */}
      <header className="customer-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          
          <div className="customer-logo-area">
            {cafe.logoUrl ? (
              <img src={cafe.logoUrl} alt={cafe.name} className="customer-logo" />
            ) : (
              <div className="customer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {cafe.name[0]}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--cafe-text)', fontWeight: 800 }}>{cafe.name}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', fontWeight: 600 }}>Table {tableNum}</span>
            </div>
          </div>

          <div className="flex-row" style={{ gap: '8px' }}>
            {/* Instagram Link */}
            <a 
              href={`https://instagram.com/${cafe.id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-icon-link instagram"
              title="Instagram"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Contact Info Dropdown Toggler */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsContactOpen(!isContactOpen)}
                className="nav-icon-link"
                title="Contacts"
                style={{ cursor: 'pointer' }}
              >
                <Phone size={18} />
              </button>

              {isContactOpen && (
                <div className="contact-popover">
                  <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--cafe-border)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--cafe-text)' }}>
                    Contact Details
                  </h4>
                  <div className="contact-popover-item">
                    <Mail size={16} />
                    <span style={{ color: 'var(--cafe-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cafe.email}
                    </span>
                  </div>
                  <div className="contact-popover-item">
                    <Phone size={16} />
                    <span style={{ color: 'var(--cafe-text-muted)' }}>+1 (555) 019-2834</span>
                  </div>
                  <div className="contact-popover-item">
                    <MapPin size={16} />
                    <span style={{ color: 'var(--cafe-text-muted)', fontSize: '0.8rem' }}>120 Coffee Blvd, Food District</span>
                  </div>
                </div>
              )}
            </div>

            {/* SaaS Multi-Language Toggle Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--cafe-border)' }}>
              <Globe size={14} style={{ color: 'var(--cafe-text-muted)' }} />
              <select 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as Lang)}
                style={{ 
                  background: 'none', border: 'none', color: 'var(--cafe-text)',
                  fontSize: '0.75rem', fontWeight: 700, outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* waiter alert success toast banner */}
      {waiterStatusText && (
        <div style={{ margin: '20px', padding: '14px 20px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }} className="animate-fade-in">
          {waiterStatusText}
        </div>
      )}

      {/* Active Orders Tracker List */}
      {activeTableOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px' }}>
          
          {/* Consolidated Table Bill Card */}
          <div 
            style={{ 
              padding: '24px', 
              background: 'linear-gradient(135deg, var(--cafe-card) 0%, rgba(var(--cafe-primary-rgb), 0.05) 100%)', 
              borderRadius: 'var(--radius-md)', 
              border: '2px solid var(--cafe-primary)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              boxShadow: '0 8px 32px rgba(var(--cafe-primary-rgb), 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="glass-card animate-fade-in"
          >
            {/* Corner Decorative Accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(var(--cafe-primary-rgb), 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div className="flex-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cafe-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Table Checkout</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--cafe-text)', margin: '4px 0 0 0' }}>🧾 Consolidated Bill</h3>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                Unpaid
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--cafe-text-muted)', lineHeight: 1.4 }}>
              Combined summary of your first order and any repeat orders. You only need to pay once.
            </div>

            {/* Consolidated Invoice List */}
            <div style={{ background: 'rgba(0, 0, 0, 0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px dashed var(--cafe-border)' }}>
              {Object.values(
                activeTableOrders.reduce((acc, order) => {
                  order.items.forEach(itm => {
                    const id = itm.menuItem.id;
                    if (!acc[id]) {
                      acc[id] = { name: itm.menuItem.name, quantity: 0, price: itm.menuItem.price };
                    }
                    acc[id].quantity += itm.quantity;
                  });
                  return acc;
                }, {} as { [id: string]: { name: string; quantity: number; price: number } })
              ).map((item, idx) => (
                <div key={idx} className="flex-between" style={{ fontSize: '0.85rem', padding: '4px 0' }}>
                  <span style={{ color: 'var(--cafe-text-muted)', fontWeight: 500 }}>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--cafe-text)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex-between" style={{ marginTop: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--cafe-text)', fontSize: '0.95rem' }}>Total Unpaid Amount:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--cafe-primary)' }}>
                ${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
              </span>
            </div>

            <button 
              className="btn-cafe-action pulse-glow" 
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '30px', boxShadow: '0 4px 15px rgba(var(--cafe-primary-rgb), 0.2)' }}
              onClick={() => {
                setIsPayBillOpen(true);
              }}
            >
              💳 Pay Unified Bill & Check Out (${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)})
            </button>
          </div>

          {/* Individual Active Orders Status Steppers */}
          {activeTableOrders.map((order, idx) => (
            <div 
              key={order.id} 
              style={{ 
                padding: '20px', 
                background: 'var(--cafe-card)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--cafe-border)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }} 
              className="animate-fade-in"
            >
              <div className="flex-between">
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cafe-text)', margin: 0 }}>
                    {idx === 0 ? 'First Order' : `Repeat Order #${idx + 1}`}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', display: 'block', marginTop: '4px' }}>
                    Items: {order.items.map(itm => `${itm.quantity}x ${itm.menuItem.name}`).join(', ')}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--cafe-text-muted)', background: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--cafe-border)' }}>
                  ID: #{order.id.split('-')[1] || order.id.slice(-5)}
                </span>
              </div>

              <StatusStepper status={order.status} t={t} />
            </div>
          ))}
        </div>
      )}

      {/* Hero Banner */}
      <section className="customer-hero">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--cafe-text)', marginBottom: '8px' }}>
          {t.welcome} {cafe.name}
        </h1>
        <p style={{ color: 'var(--cafe-text-muted)', fontSize: '0.9rem' }}>
          {t.subtitle} {tableNum}.
        </p>
      </section>

      {/* Search Input */}
      <div className="customer-search-bar">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cafe-text-muted)' }} />
          <input 
            type="text" 
            placeholder={t.search} 
            className="customer-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Selection Chips */}
      <div className="customer-categories">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Veg only Toggle switch */}
      <div className="container" style={{ padding: '0 20px', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button 
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', outline: 'none' }}
          onClick={() => setIsVegOnly(!isVegOnly)}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cafe-text-muted)' }}>{t.vegOnly}</span>
          <span 
            style={{ 
              width: '40px', 
              height: '22px', 
              borderRadius: '20px', 
              background: isVegOnly ? '#10b981' : 'var(--cafe-border)', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '2px',
              transition: 'var(--transition)'
            }}
          >
            <span 
              style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                background: '#ffffff', 
                transform: isVegOnly ? 'translateX(18px)' : 'translateX(0)',
                transition: 'var(--transition)'
              }} 
            />
          </span>
        </button>
      </div>

      {/* Menu Item Grid */}
      <div className="customer-items-container">
        {filteredMenu.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cafe-text-muted)' }}>
            <p>No dishes found matching your selection.</p>
          </div>
        ) : (
          <div className="customer-items-grid">
            {filteredMenu.map(item => {
              const qty = cart[item.id] || 0;
              const isExpanded = !!expandedItems[item.id];
              return (
                <div key={item.id} className="customer-menu-card scroll-fade-in animate-fade-in">
                  <div className="menu-card-image-wrapper">
                    {/* Overlaid Diet Badge */}
                    <div className="card-diet-badge">
                      {item.isVeg ? (
                        <span className="diet-indicator veg" title="Vegetarian" />
                      ) : (
                        <span className="diet-indicator nonveg" title="Non-Vegetarian" />
                      )}
                    </div>
                    <img src={item.image} alt={item.name} className="menu-card-image" />
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-title">
                      <span>{item.name}</span>
                    </div>
                    
                    <div>
                      <p className={`menu-card-desc ${isExpanded ? '' : 'collapsed'}`}>
                        {item.description}
                      </p>
                      {item.description.length > 60 && (
                        <button 
                          type="button" 
                          className="read-more-btn" 
                          onClick={() => setExpandedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                    
                    <div className="menu-card-footer">
                      <span className="menu-card-price">${item.price.toFixed(2)}</span>
                      
                      {qty > 0 ? (
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => removeFromCart(item.id)}>
                            <Minus size={14} />
                          </button>
                          <span className="qty-value" style={{ color: 'var(--cafe-text)' }}>{qty}</span>
                          <button className="qty-btn" onClick={() => addToCart(item.id)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn-cafe-action" onClick={() => addToCart(item.id)}>
                          {t.add}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING ACTION: CALL WAITER BUTTON */}
      <div style={{ position: 'fixed', bottom: getCartTotalItems() > 0 ? '100px' : '32px', right: '16px', zIndex: 90, transition: 'bottom 0.3s ease' }}>
        <button 
          onClick={() => setIsWaiterMenuOpen(!isWaiterMenuOpen)}
          style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            background: 'var(--cafe-secondary)', color: '#000',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)', transition: 'var(--transition)'
          }}
          title={t.callWaiter}
          className="pulse-glow"
        >
          <Bell size={24} />
        </button>

        {isWaiterMenuOpen && (
          <div 
            style={{ 
              position: 'absolute', bottom: '70px', right: '0', 
              background: 'var(--cafe-card)', border: '1px solid var(--cafe-border)',
              borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '180px',
              animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <button 
              onClick={() => handleCallWaiter('assistance')}
              style={{ background: 'none', border: 'none', color: 'var(--cafe-text)', padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}
            >
              🙋‍♂️ {t.needAssistance}
            </button>
            <button 
              onClick={() => handleCallWaiter('water')}
              style={{ background: 'none', border: 'none', color: 'var(--cafe-text)', padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', borderTop: '1px solid var(--cafe-border)' }}
            >
              🥛 {t.requestWater}
            </button>
            <button 
              onClick={() => handleCallWaiter('bill')}
              style={{ background: 'none', border: 'none', color: 'var(--cafe-text)', padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', borderTop: '1px solid var(--cafe-border)' }}
            >
              💵 {t.requestBill}
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {getCartTotalItems() > 0 && (
        <div className="cart-floating-bar" onClick={() => setIsCartOpen(true)} style={{ zIndex: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>
                {getCartTotalItems()} {t.cartFloating}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t.viewCart}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <span>{t.subtotal}: ${getCartSubtotal().toFixed(2)}</span>
            <ChevronRight size={18} />
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      <div className={`cart-slide-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--cafe-text)', fontWeight: 800 }}>{t.summary}</h3>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cafe-text)' }}
            onClick={() => setIsCartOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="drawer-body">
          {Object.entries(cart).map(([itemId, qty]) => {
            const item = cafe.menu.find(m => m.id === itemId)!;
            if (!item) return null;
            return (
              <div key={item.id} className="cart-item">
                <div style={{ maxWidth: '60%' }}>
                  <div style={{ fontWeight: 700, color: 'var(--cafe-text)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cafe-text-muted)' }}>${item.price.toFixed(2)} each</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="qty-control" style={{ scale: '0.9' }}>
                    <button className="qty-btn" onClick={() => removeFromCart(item.id)}>
                      <Minus size={12} />
                    </button>
                    <span className="qty-value" style={{ color: 'var(--cafe-text)' }}>{qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(item.id)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--cafe-text)' }}>${(item.price * qty).toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          {/* AI UPSELL RECOMMENDATION */}
          {recommendedItem && (
            <div 
              className="glass-card animate-fade-in" 
              style={{ 
                padding: '16px', background: 'rgba(var(--cafe-primary-rgb), 0.02)', 
                border: '1.5px dashed var(--cafe-primary)', borderRadius: '12px', marginTop: '10px' 
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--cafe-primary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                💡 {t.upsellTitle}
              </span>
              <div className="flex-between">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '70%' }}>
                  <img src={recommendedItem.image} alt={recommendedItem.name} style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--cafe-text)', fontSize: '0.85rem', display: 'block' }}>{recommendedItem.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)' }}>Add for only ${recommendedItem.price.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  className="btn-cafe-action" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={() => addToCart(recommendedItem.id)}
                >
                  Add +
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          {isDiscountEligible && (
            <div className="flex-between" style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
              <span>{t.loyaltyDiscount}</span>
              <span>-${loyaltyDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span style={{ color: 'var(--cafe-text-muted)', fontWeight: 500 }}>{t.subtotal}:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cafe-primary)' }}>
              ${cartFinalTotal.toFixed(2)}
            </span>
          </div>

          <button 
            className="btn-cafe-action" 
            style={{ width: '100%', padding: '16px', borderRadius: '30px', fontSize: '1.05rem', fontWeight: 700 }}
            onClick={() => setIsCheckoutOpen(true)}
          >
            {t.checkoutBtn}
          </button>
        </div>
      </div>

      {/* Checkout/Mock Payment Modal */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title={t.checkoutTitle}>
        <form onSubmit={handleCheckoutSubmit} className="payment-form">
          
          {/* Loyalty Banner inside Checkout */}
          <div 
            style={{ 
              padding: '8px 12px', background: 'rgba(181, 148, 106, 0.08)', 
              border: '1px solid var(--cafe-secondary)', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' 
            }}
          >
            <Star size={16} style={{ color: 'var(--cafe-secondary)', flexShrink: 0 }} fill="currentColor" className="desktop-only" />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cafe-text)', display: 'block' }}>{t.loyaltyTitle}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--cafe-text-muted)', display: 'block', lineHeight: 1.2 }}>
                {isDiscountEligible 
                  ? t.loyaltyDiscount 
                  : t.loyaltyProgress.replace('{count}', pastOrdersCount.toString())}
              </span>
            </div>
          </div>

          <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--cafe-border)', paddingBottom: '6px', color: 'var(--cafe-text)', margin: 0 }}>{t.contact}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)' }}>{t.name}</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="e.g. Jane Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ borderColor: 'var(--cafe-border)', color: 'var(--cafe-text)', padding: '8px 12px', fontSize: '0.85rem' }}
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)' }}>{t.phone}</label>
              <input 
                type="tel" 
                className="glass-input" 
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ borderColor: 'var(--cafe-border)', color: 'var(--cafe-text)', padding: '8px 12px', fontSize: '0.85rem' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-cafe-action" 
            style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 700, marginTop: '12px' }}
          >
            {t.payBtn}
          </button>
        </form>
      </Modal>

      {/* Pay Bill & Checkout Modal (Eaten first, pay last) */}
      <Modal isOpen={isPayBillOpen} onClose={() => setIsPayBillOpen(false)} title="Pay Bill & Checkout">
        <form onSubmit={handlePayBillSubmit} className="payment-form">
          {/* Order Summary / Invoice */}
          {activeTableOrders.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px 12px', border: '1px solid var(--cafe-border)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--cafe-text)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Consolidated Invoice</span>
                <span style={{ color: 'var(--cafe-text-muted)', fontWeight: 500 }}>Table {tableNum}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                {Object.values(
                  activeTableOrders.reduce((acc, order) => {
                    order.items.forEach(itm => {
                      const id = itm.menuItem.id;
                      if (!acc[id]) {
                        acc[id] = { name: itm.menuItem.name, quantity: 0, price: itm.menuItem.price };
                      }
                      acc[id].quantity += itm.quantity;
                    });
                    return acc;
                  }, {} as { [id: string]: { name: string; quantity: number; price: number } })
                ).map((item, idx) => (
                  <div key={idx} className="flex-between">
                    <span style={{ color: 'var(--cafe-text-muted)' }}>{item.quantity}x {item.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--cafe-text)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex-between" style={{ borderTop: '1px dashed var(--cafe-border)', paddingTop: '6px', marginTop: '6px', fontWeight: 700 }}>
                <span>Amount to Pay:</span>
                <span style={{ color: 'var(--cafe-primary)', fontSize: '0.95rem' }}>
                  ${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cafe-text)', margin: '0 0 10px 0' }}>{t.paymentMethod}</h4>
          
          {/* Three-Way Payment Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {/* UPI Option */}
            <div 
              onClick={() => setSelectedPayment('upi')}
              style={{
                border: selectedPayment === 'upi' ? '2px solid var(--cafe-primary)' : '1px solid var(--cafe-border)',
                borderRadius: '10px',
                padding: '12px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedPayment === 'upi' ? 'rgba(var(--cafe-primary-rgb), 0.04)' : 'var(--cafe-card)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <Smartphone size={20} style={{ color: selectedPayment === 'upi' ? 'var(--cafe-primary)' : 'var(--cafe-text-muted)', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cafe-text)' }}>{t.upi}</div>
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '14px', height: '14px', borderRadius: '50%',
                border: selectedPayment === 'upi' ? '4px solid var(--cafe-primary)' : '1.5px solid var(--cafe-border)',
                background: selectedPayment === 'upi' ? '#fff' : 'transparent'
              }} />
            </div>

            {/* Card Option */}
            <div 
              onClick={() => setSelectedPayment('card')}
              style={{
                border: selectedPayment === 'card' ? '2px solid var(--cafe-primary)' : '1px solid var(--cafe-border)',
                borderRadius: '10px',
                padding: '12px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedPayment === 'card' ? 'rgba(var(--cafe-primary-rgb), 0.04)' : 'var(--cafe-card)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <CreditCard size={20} style={{ color: selectedPayment === 'card' ? 'var(--cafe-primary)' : 'var(--cafe-text-muted)', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cafe-text)' }}>{t.card}</div>
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '14px', height: '14px', borderRadius: '50%',
                border: selectedPayment === 'card' ? '4px solid var(--cafe-primary)' : '1.5px solid var(--cafe-border)',
                background: selectedPayment === 'card' ? '#fff' : 'transparent'
              }} />
            </div>

            {/* Cash Option */}
            <div 
              onClick={() => setSelectedPayment('cash')}
              style={{
                border: selectedPayment === 'cash' ? '2px solid var(--cafe-primary)' : '1px solid var(--cafe-border)',
                borderRadius: '10px',
                padding: '12px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedPayment === 'cash' ? 'rgba(var(--cafe-primary-rgb), 0.04)' : 'var(--cafe-card)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedPayment === 'cash' ? 'var(--cafe-primary)' : 'var(--cafe-text-muted)', lineHeight: 1 }}>💵</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cafe-text)' }}>Cash</div>
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '14px', height: '14px', borderRadius: '50%',
                border: selectedPayment === 'cash' ? '4px solid var(--cafe-primary)' : '1.5px solid var(--cafe-border)',
                background: selectedPayment === 'cash' ? '#fff' : 'transparent'
              }} />
            </div>
          </div>

          {/* Payment Method Screens */}
          {selectedPayment === 'upi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '8px 0', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=tablebite@mockupi&pn=${encodeURIComponent(cafe.name)}&am=${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0)}`}
                  alt="UPI Pay QR" 
                  style={{ width: '110px', height: '110px', display: 'block' }}
                />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--cafe-text)', fontSize: '0.8rem', margin: 0 }}>Scan using GPay, PhonePe, or Paytm</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', marginTop: '2px', marginBottom: 0 }}>
                  Amount to Pay: ${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {selectedPayment === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '12px 16px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--cafe-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>💳</div>
              <p style={{ fontWeight: 700, color: 'var(--cafe-text)', fontSize: '0.85rem', margin: 0 }}>Pay with Credit/Debit Card</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                Our waiter will bring the card machine (POS terminal) directly to your table, or you can pay with card at the main cash counter.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', margin: '2px 0 0 0' }}>
                Amount to Pay: <strong>${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}</strong>
              </p>
            </div>
          )}

          {selectedPayment === 'cash' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '12px 16px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--cafe-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>💵</div>
              <p style={{ fontWeight: 700, color: 'var(--cafe-text)', fontSize: '0.85rem', margin: 0 }}>Pay with Cash</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                Please pay cash directly to our service waiter or visit the reception/cash counter to settle your bill.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--cafe-text-muted)', margin: '2px 0 0 0' }}>
                Amount to Pay: <strong>${activeTableOrders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}</strong>
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-cafe-action" 
            style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 700, marginTop: '12px' }}
          >
            {selectedPayment === 'upi' ? 'Complete Checkout' : 'Complete & Notify Staff'}
          </button>
        </form>
      </Modal>

      {/* FEEDBACK LOOP MODAL (Triggers after checkout payment completes) */}
      <Modal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} title={t.feedbackTitle}>
        <form onSubmit={handleFeedbackSubmit} className="payment-form">
          {showFeedbackSuccess ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--secondary)' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 16px' }} />
              <h3>{t.feedbackSuccess}</h3>
            </div>
          ) : (
            <>
              {/* Star Rating selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--cafe-text-muted)', fontWeight: 600 }}>Rate your meal:</span>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--cafe-secondary)' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', color: 'var(--cafe-secondary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star size={32} fill={star <= feedbackRating ? 'currentColor' : 'none'} stroke="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text comment review */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea
                  className="glass-input"
                  placeholder={t.feedbackPlaceholder}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{ minHeight: '100px', borderColor: 'var(--cafe-border)', color: 'var(--cafe-text)', resize: 'vertical' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-cafe-action" 
                style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 700 }}
              >
                {t.submitFeedbackBtn}
              </button>
            </>
          )}
        </form>
      </Modal>

    </div>
  );
};

// Sub-Component: StatusStepper (Real-time sync display)
interface StatusStepperProps {
  status: 'pending' | 'preparing' | 'served' | 'paid';
  t: any;
}

const StatusStepper: React.FC<StatusStepperProps> = ({ status, t }) => {
  const getProgressWidth = () => {
    switch (status) {
      case 'pending': return '0%';
      case 'preparing': return '33.3%';
      case 'served': return '66.6%';
      case 'paid': return '100%';
    }
  };

  const isCompleted = (step: typeof status) => {
    const weights = { pending: 1, preparing: 2, served: 3, paid: 4 };
    return weights[status] > weights[step];
  };

  const isActive = (step: typeof status) => {
    return status === step;
  };

  return (
    <div className="status-tracker-container">
      <div className="status-steps">
        <div className="status-step-line" style={{ width: getProgressWidth() }} />
        
        {/* Step 1: Ordered */}
        <div className={`status-step ${isCompleted('pending') ? 'completed' : ''} ${isActive('pending') ? 'active' : ''}`}>
          <div className="status-step-circle">
            {isCompleted('pending') ? <Check size={18} /> : <ShoppingBag size={18} />}
          </div>
          <span>{t.stepperOrdered}</span>
        </div>

        {/* Step 2: Preparing */}
        <div className={`status-step ${isCompleted('preparing') ? 'completed' : ''} ${isActive('preparing') ? 'active' : ''}`}>
          <div className="status-step-circle">
            {isCompleted('preparing') ? <Check size={18} /> : <Utensils size={18} />}
          </div>
          <span>{t.stepperPreparing}</span>
        </div>

        {/* Step 3: Served */}
        <div className={`status-step ${isCompleted('served') ? 'completed' : ''} ${isActive('served') ? 'active' : ''}`}>
          <div className="status-step-circle">
            {isCompleted('served') ? <Check size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <span>{t.stepperServed}</span>
        </div>

        {/* Step 4: Paid */}
        <div className={`status-step ${isCompleted('paid') ? 'completed' : ''} ${isActive('paid') ? 'active' : ''}`}>
          <div className="status-step-circle">
            {isCompleted('paid') ? <Check size={18} /> : <CreditCard size={18} />}
          </div>
          <span>{t.stepperPaid}</span>
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--cafe-text)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          {status === 'pending' && 'Order sent to the counter. Awaiting confirmation...'}
          {status === 'preparing' && 'Chef is preparing your food in the kitchen!'}
          {status === 'served' && 'Delicious food served! Bon Appétit!'}
          {status === 'paid' && 'Bill Paid! Thank you for dining with us.'}
        </p>
        <span style={{ fontSize: '0.8rem', color: 'var(--cafe-text-muted)' }}>
          This page updates automatically in real-time as the manager processes your order.
        </span>
      </div>
    </div>
  );
};
