import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  cafeId: string;
  tableNum: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'paid';
  customerName: string;
  customerPhone: string;
  timestamp: number;
}

export interface WaiterCall {
  id: string;
  cafeId: string;
  tableNum: number;
  type: 'assistance' | 'water' | 'bill';
  status: 'pending' | 'resolved';
  timestamp: number;
}

export interface Feedback {
  id: string;
  cafeId: string;
  rating: number;
  comment: string;
  customerName: string;
  timestamp: number;
}

export interface CafeColors {
  primary: string;
  primaryRgb: string;
  secondary: string;
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface Cafe {
  id: string;
  name: string;
  email: string;
  logoUrl: string;
  colors: CafeColors;
  menu: MenuItem[];
  tables: number[];
}

interface CafeContextType {
  cafes: Cafe[];
  orders: Order[];
  waiterCalls: WaiterCall[];
  feedbacks: Feedback[];
  currentCafe: Cafe | null;
  isCloudSyncActive: boolean;
  login: (email: string, cafeName: string) => Cafe;
  logout: () => void;
  updateCafeDesign: (colors: Partial<CafeColors>, name: string, logoUrl: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addTable: (num: number) => void;
  deleteTable: (num: number) => void;
  placeOrder: (
    cafeId: string,
    tableNum: number,
    items: OrderItem[],
    customerName: string,
    customerPhone: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  payAllTableOrders: (cafeId: string, tableNum: number) => void;
  callWaiter: (cafeId: string, tableNum: number, type: WaiterCall['type']) => WaiterCall;
  resolveWaiterCall: (callId: string) => void;
  submitFeedback: (cafeId: string, rating: number, comment: string, customerName: string) => Feedback;
  getCustomerOrderCount: (phone: string) => number;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

const hexToRgb = (hex: string): string => {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
};

const DEFAULT_COLORS: CafeColors = {
  primary: '#016dc1',
  primaryRgb: '1, 109, 193',
  secondary: '#b5946a',
  bg: '#fbfaf8',
  card: '#ffffff',
  text: '#08070f',
  textMuted: '#66636a',
  border: '#ebdccb',
};

const MOCK_CAFES: Cafe[] = [
  {
    id: 'unwind-cafe',
    name: 'Unvind Cafe',
    email: 'hello@unvindcafe.com',
    logoUrl: 'https://unvindcafe.com/images/logo.png',
    colors: {
      primary: '#016dc1',
      primaryRgb: '1, 109, 193',
      secondary: '#b5946a',
      bg: '#fbfaf8',
      card: '#ffffff',
      text: '#08070f',
      textMuted: '#66636a',
      border: '#ebdccb',
    },
    menu: [
      {
        id: 'item-1',
        name: 'Chipotle Bowl',
        description: 'Hearty brown rice, black beans, sweet corn, fresh avocado, sour cream, and chipotle dressing.',
        price: 10.50,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        category: 'Best Sellers',
        isVeg: true,
        isAvailable: true,
      },
      {
        id: 'item-2',
        name: 'Farm Fresh Pizza',
        description: 'Topped with cherry tomatoes, green bell peppers, olives, mushrooms, and fresh mozzarella cheese on a crispy sourdough crust.',
        price: 12.95,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
      },
      {
        id: 'item-3',
        name: 'Penne Alfredo Pasta',
        description: 'Penne pasta tossed in a rich, creamy parmesan cheese sauce with garlic and fresh herbs.',
        price: 11.45,
        image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&auto=format&fit=crop&q=80',
        category: 'Pasta',
        isVeg: true,
        isAvailable: true,
      },
      {
        id: 'item-4',
        name: 'Pesto Pizza',
        description: 'Delicious house-made basil pesto sauce, fresh mozzarella, heirloom cherry tomatoes, and wild arugula.',
        price: 13.45,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=80',
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
      },
    ],
    tables: [1, 2, 3, 4, 5],
  },
];

// Helper database row-to-model mapping functions
const mapDbMenuItem = (row: any): MenuItem => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  image: row.image,
  category: row.category,
  isVeg: !!row.is_veg,
  isAvailable: !!row.is_available,
});

const mapDbOrder = (row: any): Order => {
  const mappedItems: OrderItem[] = Array.isArray(row.items)
    ? row.items.map((item: any) => ({
        menuItem: {
          id: item.menuItem?.id || '',
          name: item.menuItem?.name || '',
          description: item.menuItem?.description || '',
          price: Number(item.menuItem?.price || 0),
          image: item.menuItem?.image || '',
          category: item.menuItem?.category || '',
          isVeg: item.menuItem?.isVeg ?? item.menuItem?.is_veg ?? true,
          isAvailable: item.menuItem?.isAvailable ?? item.menuItem?.is_available ?? true,
        },
        quantity: Number(item.quantity || 1)
      }))
    : [];

  return {
    id: row.id,
    cafeId: row.cafe_id,
    tableNum: Number(row.table_num),
    items: mappedItems,
    totalAmount: Number(row.total_amount),
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    timestamp: Number(row.timestamp),
  };
};

const mapDbWaiterCall = (row: any): WaiterCall => ({
  id: row.id,
  cafeId: row.cafe_id,
  tableNum: Number(row.table_num),
  type: row.type,
  status: row.status,
  timestamp: Number(row.timestamp),
});

const mapDbFeedback = (row: any): Feedback => ({
  id: row.id,
  cafeId: row.cafe_id,
  rating: Number(row.rating),
  comment: row.comment,
  customerName: row.customer_name,
  timestamp: Number(row.timestamp),
});

const mapDbCafe = (row: any, dbMenuItems: any[] = []): Cafe => {
  const matchingMenu = dbMenuItems
    .filter((item) => item.cafe_id === row.id)
    .map(mapDbMenuItem);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    logoUrl: row.logo_url || '',
    colors: typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors,
    tables: Array.isArray(row.tables) ? row.tables.map(Number) : [],
    menu: matchingMenu,
  };
};

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentCafe, setCurrentCafe] = useState<Cafe | null>(null);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(isSupabaseConfigured);

  const loadFromStorage = () => {
    const storedCafes = localStorage.getItem('tablebite_cafes');
    const storedOrders = localStorage.getItem('tablebite_orders');
    const storedCalls = localStorage.getItem('tablebite_waitercalls');
    const storedReviews = localStorage.getItem('tablebite_feedbacks');
    const storedLoggedInId = localStorage.getItem('tablebite_logged_in_cafe_id');

    let loadedCafes: Cafe[] = [];
    if (storedCafes) {
      loadedCafes = JSON.parse(storedCafes);
    } else {
      loadedCafes = MOCK_CAFES;
      localStorage.setItem('tablebite_cafes', JSON.stringify(MOCK_CAFES));
    }
    setCafes(loadedCafes);

    setOrders(storedOrders ? JSON.parse(storedOrders) : []);
    setWaiterCalls(storedCalls ? JSON.parse(storedCalls) : []);
    setFeedbacks(storedReviews ? JSON.parse(storedReviews) : []);

    if (storedLoggedInId) {
      const match = loadedCafes.find((c) => c.id === storedLoggedInId);
      if (match) setCurrentCafe(match);
    } else {
      setCurrentCafe(null);
    }
  };

  const loadFromSupabase = async () => {
    if (!supabase) return;
    try {
      // Fetch initial tables from cloud
      const [
        { data: cafesData, error: cafesError },
        { data: menuData, error: menuError },
        { data: ordersData, error: ordersError },
        { data: callsData, error: callsError },
        { data: feedbackData, error: feedbackError }
      ] = await Promise.all([
        supabase.from('cafes').select('*'),
        supabase.from('menu_items').select('*'),
        supabase.from('orders').select('*').order('timestamp', { ascending: false }),
        supabase.from('waiter_calls').select('*').order('timestamp', { ascending: false }),
        supabase.from('feedbacks').select('*').order('timestamp', { ascending: false })
      ]);

      if (cafesError || menuError || ordersError || callsError || feedbackError) {
        console.error('Supabase fetch failed, falling back to local storage:', {
          cafesError, menuError, ordersError, callsError, feedbackError
        });
        loadFromStorage();
        setIsCloudSyncActive(false);
        return;
      }

      const menuItems = menuData || [];
      const loadedCafes = (cafesData || []).map(c => mapDbCafe(c, menuItems));

      setCafes(loadedCafes);
      setOrders((ordersData || []).map(mapDbOrder));
      setWaiterCalls((callsData || []).map(mapDbWaiterCall));
      setFeedbacks((feedbackData || []).map(mapDbFeedback));

      const storedLoggedInId = localStorage.getItem('tablebite_logged_in_cafe_id');
      if (storedLoggedInId) {
        const match = loadedCafes.find((c) => c.id === storedLoggedInId);
        if (match) setCurrentCafe(match);
      }
    } catch (e) {
      console.error('Supabase load error, falling back to local storage:', e);
      loadFromStorage();
      setIsCloudSyncActive(false);
    }
  };

  // Synchronize base configuration based on connection state
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      loadFromStorage();
      setIsCloudSyncActive(false);
      
      // Setup Storage Listener for Offline Sync
      const handleStorageChange = (e: StorageEvent) => {
        if (
          e.key === 'tablebite_cafes' ||
          e.key === 'tablebite_orders' ||
          e.key === 'tablebite_waitercalls' ||
          e.key === 'tablebite_feedbacks' ||
          e.key === 'tablebite_logged_in_cafe_id'
        ) {
          loadFromStorage();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } else {
      loadFromSupabase();
      setIsCloudSyncActive(true);

      // Setup Real-time Subscriptions
      const ordersSubscription = supabase
        .channel('orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newOrder = mapDbOrder(payload.new);
              setOrders((prev) => {
                if (prev.some((o) => o.id === newOrder.id)) return prev;
                return [newOrder, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedOrder = mapDbOrder(payload.new);
              setOrders((prev) =>
                prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setOrders((prev) => prev.filter((o) => o.id !== deletedId));
            }
          }
        )
        .subscribe();

      const callsSubscription = supabase
        .channel('calls-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'waiter_calls' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newCall = mapDbWaiterCall(payload.new);
              setWaiterCalls((prev) => {
                if (prev.some((c) => c.id === newCall.id)) return prev;
                return [newCall, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedCall = mapDbWaiterCall(payload.new);
              setWaiterCalls((prev) =>
                prev.map((c) => (c.id === updatedCall.id ? updatedCall : c))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setWaiterCalls((prev) => prev.filter((c) => c.id !== deletedId));
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(ordersSubscription);
          supabase.removeChannel(callsSubscription);
        }
      };
    }
  }, []);

  const saveCafes = (updatedCafes: Cafe[]) => {
    setCafes(updatedCafes);
    localStorage.setItem('tablebite_cafes', JSON.stringify(updatedCafes));
    if (currentCafe) {
      const freshCurrent = updatedCafes.find((c) => c.id === currentCafe.id);
      if (freshCurrent) setCurrentCafe(freshCurrent);
    }
  };

  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('tablebite_orders', JSON.stringify(updatedOrders));
  };

  const saveWaiterCalls = (updatedCalls: WaiterCall[]) => {
    setWaiterCalls(updatedCalls);
    localStorage.setItem('tablebite_waitercalls', JSON.stringify(updatedCalls));
  };

  const saveFeedbacks = (updatedReviews: Feedback[]) => {
    setFeedbacks(updatedReviews);
    localStorage.setItem('tablebite_feedbacks', JSON.stringify(updatedReviews));
  };

  const login = (email: string, cafeName: string) => {
    const id = cafeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = cafes.find((c) => c.email.toLowerCase() === email.toLowerCase() || c.id === id);

    if (existing) {
      setCurrentCafe(existing);
      localStorage.setItem('tablebite_logged_in_cafe_id', existing.id);
      return existing;
    }

    const newCafe: Cafe = {
      id,
      name: cafeName,
      email,
      logoUrl: '',
      colors: { ...DEFAULT_COLORS },
      menu: [],
      tables: [1, 2, 3],
    };

    const newCafes = [...cafes, newCafe];
    saveCafes(newCafes);
    setCurrentCafe(newCafe);
    localStorage.setItem('tablebite_logged_in_cafe_id', newCafe.id);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('cafes')
        .insert({
          id,
          name: cafeName,
          email,
          logo_url: '',
          colors: DEFAULT_COLORS,
          tables: [1, 2, 3]
        })
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error inserting cafe:', error);
        });
    }

    return newCafe;
  };

  const logout = () => {
    setCurrentCafe(null);
    localStorage.removeItem('tablebite_logged_in_cafe_id');
  };

  const updateCafeDesign = (colors: Partial<CafeColors>, name: string, logoUrl: string) => {
    if (!currentCafe) return;
    const updatedColors = { ...currentCafe.colors, ...colors };
    if (colors.primary) updatedColors.primaryRgb = hexToRgb(colors.primary);

    const updatedCafes = cafes.map((c) => {
      if (c.id === currentCafe.id) {
        return { ...c, name, logoUrl, colors: updatedColors };
      }
      return c;
    });
    saveCafes(updatedCafes);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('cafes')
        .update({
          name,
          logo_url: logoUrl,
          colors: updatedColors
        })
        .eq('id', currentCafe.id)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error updating cafe colors:', error);
        });
    }
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    if (!currentCafe) return;
    const id = `item-${Date.now()}`;
    const newItem: MenuItem = { ...item, id };
    const updatedCafes = cafes.map((c) => {
      if (c.id === currentCafe.id) return { ...c, menu: [...c.menu, newItem] };
      return c;
    });
    saveCafes(updatedCafes);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('menu_items')
        .insert({
          id,
          cafe_id: currentCafe.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category,
          is_veg: item.isVeg,
          is_available: item.isAvailable
        })
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error adding menu item:', error);
        });
    }
  };

  const updateMenuItem = (id: string, updatedFields: Partial<MenuItem>) => {
    if (!currentCafe) return;
    const updatedCafes = cafes.map((c) => {
      if (c.id === currentCafe.id) {
        return {
          ...c,
          menu: c.menu.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)),
        };
      }
      return c;
    });
    saveCafes(updatedCafes);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      const dbFields: any = {};
      if (updatedFields.name !== undefined) dbFields.name = updatedFields.name;
      if (updatedFields.description !== undefined) dbFields.description = updatedFields.description;
      if (updatedFields.price !== undefined) dbFields.price = updatedFields.price;
      if (updatedFields.image !== undefined) dbFields.image = updatedFields.image;
      if (updatedFields.category !== undefined) dbFields.category = updatedFields.category;
      if (updatedFields.isVeg !== undefined) dbFields.is_veg = updatedFields.isVeg;
      if (updatedFields.isAvailable !== undefined) dbFields.is_available = updatedFields.isAvailable;

      supabase
        .from('menu_items')
        .update(dbFields)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error updating menu item:', error);
        });
    }
  };

  const deleteMenuItem = (id: string) => {
    if (!currentCafe) return;
    const updatedCafes = cafes.map((c) => {
      if (c.id === currentCafe.id) return { ...c, menu: c.menu.filter((item) => item.id !== id) };
      return c;
    });
    saveCafes(updatedCafes);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error deleting menu item:', error);
        });
    }
  };

  const addTable = (num: number) => {
    if (!currentCafe) return;
    if (currentCafe.tables.includes(num)) return;
    const newTables = [...currentCafe.tables, num].sort((a, b) => a - b);
    const updatedCafes = cafes.map((c) => {
      if (c.id === currentCafe.id) return { ...c, tables: newTables };
      return c;
    });
    saveCafes(updatedCafes);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('cafes')
        .update({ tables: newTables })
        .eq('id', currentCafe.id)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error adding table:', error);
        });
    }
  };

  const deleteTable = (num: number) => {
    if (!currentCafe) return;
    const newTables = currentCafe.tables.filter((t) => t !== num);
    const updatedCafes = cafes.map((c) => {
      if (c.id === currentCafe.id) return { ...c, tables: newTables };
      return c;
    });
    saveCafes(updatedCafes);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('cafes')
        .update({ tables: newTables })
        .eq('id', currentCafe.id)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error deleting table:', error);
        });
    }
  };

  const placeOrder = (
    cafeId: string,
    tableNum: number,
    items: OrderItem[],
    customerName: string,
    customerPhone: string
  ) => {
    const totalAmount = items.reduce((acc, current) => acc + current.menuItem.price * current.quantity, 0);
    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cafeId,
      tableNum,
      items,
      totalAmount,
      status: 'pending',
      customerName,
      customerPhone,
      timestamp: Date.now(),
    };
    saveOrders([newOrder, ...orders]);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      const dbItems = items.map((item) => ({
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          price: item.menuItem.price,
          image: item.menuItem.image,
          category: item.menuItem.category,
          is_veg: item.menuItem.isVeg,
          is_available: item.menuItem.isAvailable,
        },
        quantity: item.quantity,
      }));

      supabase
        .from('orders')
        .insert({
          id: newOrder.id,
          cafe_id: cafeId,
          table_num: tableNum,
          items: dbItems,
          total_amount: totalAmount,
          status: 'pending',
          customer_name: customerName,
          customer_phone: customerPhone,
          timestamp: newOrder.timestamp,
        })
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error placing order:', error);
        });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    saveOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error updating order status:', error);
        });
    }
  };

  const payAllTableOrders = (cafeId: string, tableNum: number) => {
    const tableOrders = orders.filter(
      (o) => o.cafeId === cafeId && o.tableNum === tableNum && o.status !== 'paid'
    );
    if (tableOrders.length === 0) return;

    const updatedOrders = orders.map((o) =>
      o.cafeId === cafeId && o.tableNum === tableNum && o.status !== 'paid'
        ? { ...o, status: 'paid' as const }
        : o
    );
    saveOrders(updatedOrders);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      const client = supabase;
      Promise.all(
        tableOrders.map((o) =>
          client
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', o.id)
        )
      ).then((results) => {
        results.forEach(({ error }, idx) => {
          if (error) {
            console.error(`Cloud Sync: Error updating order status for ${tableOrders[idx].id}:`, error);
          }
        });
      });
    }
  };


  const callWaiter = (cafeId: string, tableNum: number, type: WaiterCall['type']) => {
    const newCall: WaiterCall = {
      id: `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cafeId,
      tableNum,
      type,
      status: 'pending',
      timestamp: Date.now(),
    };
    saveWaiterCalls([newCall, ...waiterCalls]);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('waiter_calls')
        .insert({
          id: newCall.id,
          cafe_id: cafeId,
          table_num: tableNum,
          type,
          status: 'pending',
          timestamp: newCall.timestamp,
        })
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error calling waiter:', error);
        });
    }

    return newCall;
  };

  const resolveWaiterCall = (callId: string) => {
    saveWaiterCalls(waiterCalls.map((c) => (c.id === callId ? { ...c, status: 'resolved' } : c)));

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('waiter_calls')
        .update({ status: 'resolved' })
        .eq('id', callId)
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error resolving waiter call:', error);
        });
    }
  };

  const submitFeedback = (cafeId: string, rating: number, comment: string, customerName: string) => {
    const newFeedback: Feedback = {
      id: `review-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cafeId,
      rating,
      comment,
      customerName: customerName || 'Anonymous Guest',
      timestamp: Date.now(),
    };
    saveFeedbacks([newFeedback, ...feedbacks]);

    // Sync to Cloud
    if (isCloudSyncActive && supabase) {
      supabase
        .from('feedbacks')
        .insert({
          id: newFeedback.id,
          cafe_id: cafeId,
          rating,
          comment,
          customer_name: newFeedback.customerName,
          timestamp: newFeedback.timestamp,
        })
        .then(({ error }) => {
          if (error) console.error('Cloud Sync: Error submitting feedback:', error);
        });
    }

    return newFeedback;
  };

  const getCustomerOrderCount = (phone: string) => {
    return orders.filter((o) => o.customerPhone === phone && (o.status === 'served' || o.status === 'paid'))
      .length;
  };

  return (
    <CafeContext.Provider
      value={{
        cafes,
        orders,
        waiterCalls,
        feedbacks,
        currentCafe,
        isCloudSyncActive,
        login,
        logout,
        updateCafeDesign,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addTable,
        deleteTable,
        placeOrder,
        updateOrderStatus,
        payAllTableOrders,
        callWaiter,
        resolveWaiterCall,
        submitFeedback,
        getCustomerOrderCount,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (context === undefined) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
