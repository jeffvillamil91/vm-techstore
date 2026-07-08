import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Boxes,
  CheckCircle,
  ChartNoAxesCombined,
  ClipboardList,
  Cpu,
  Download,
  HardDrive,
  Home,
  Laptop,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  PackagePlus,
  Phone,
  ChevronLeft,
  ChevronRight,
  Printer,
  Save,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Users,
  UserPlus,
  Wrench
} from 'lucide-react';
import { api } from './api.js';
import logo from './assets/logo-vm.jpg';
import './styles.css';

const emptyProduct = { sku: '', name: '', category: 'Computadoras', price: '', stock: '', description: '', image_url: '' };
const emptyClient = { full_name: '', email: '', phone: '', city: 'Valencia', address: '' };
const emptyOrder = { cedula: '', full_name: '', phone: '', email: '', address: '', quantity: 1 };
const emptyUser = { username: '', full_name: '', password: '', role: 'seller' };
const categories = ['Computadoras', 'Impresoras', 'Almacenamiento', 'Accesorios', 'Servicios'];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function onlyDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function App() {
  const savedUser = localStorage.getItem('vm_session_user');
  const initialRoute = routeFromPath(window.location.pathname);
  const [view, setViewState] = useState(initialRoute.view);
  const [selectedCategory, setSelectedCategory] = useState(initialRoute.category || 'Computadoras');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [session, setSession] = useState(savedUser ? JSON.parse(savedUser) : null);

  function setView(nextView, category) {
    setViewState(nextView);
    if (category) setSelectedCategory(category);
    window.history.pushState({}, '', pathFromView(nextView, category || selectedCategory));
  }

  useEffect(() => {
    function handlePopState() {
      const nextRoute = routeFromPath(window.location.pathname);
      setViewState(nextRoute.view);
      if (nextRoute.category) setSelectedCategory(nextRoute.category);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      setSession(null);
      setView('login');
    }
    window.addEventListener('vm-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('vm-auth-expired', handleAuthExpired);
  }, []);

  function handleLogin(payload) {
    localStorage.setItem('vm_session_token', payload.token);
    localStorage.setItem('vm_session_user', JSON.stringify(payload.user));
    setSession(payload.user);
    setView('admin');
  }

  function handleLogout() {
    localStorage.removeItem('vm_session_token');
    localStorage.removeItem('vm_session_user');
    setSession(null);
    setView('home');
  }

  function openCategory(category) {
    setSelectedCategory(category);
    setView('category', category);
  }

  function openOrder(product) {
    setSelectedProduct(product);
    setView('order');
  }

  return (
    <>
      <PublicHeader view={view} setView={setView} session={session} onLogout={handleLogout} openCategory={openCategory} />
      {view === 'home' && <HomePage openCategory={openCategory} openOrder={openOrder} />}
      {view === 'category' && <CategoryPage category={selectedCategory} openCategory={openCategory} openOrder={openOrder} />}
      {view === 'order' && <OrderPage product={selectedProduct} setView={setView} />}
      {view === 'login' && <LoginPage onLogin={handleLogin} />}
      {view === 'admin' && session && <AdminPanel session={session} onLogout={handleLogout} />}
      {view === 'admin' && !session && <LoginPage onLogin={handleLogin} />}
      {view === 'not-found' && <NotFoundPage setView={setView} />}
    </>
  );
}

function routeFromPath(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const categories = {
    '/categoria/computadoras': 'Computadoras',
    '/categoria/impresoras': 'Impresoras',
    '/categoria/almacenamiento': 'Almacenamiento',
    '/categoria/accesorios': 'Accesorios',
    '/categoria/servicios': 'Servicios'
  };
  if (cleanPath === '/') return { view: 'home' };
  if (cleanPath === '/login') return { view: 'login' };
  if (cleanPath === '/panel') return { view: 'admin' };
  if (cleanPath === '/pedido') return { view: 'order' };
  if (categories[cleanPath]) return { view: 'category', category: categories[cleanPath] };
  return { view: 'not-found' };
}

function pathFromView(view, category) {
  const categoryPaths = {
    Computadoras: '/categoria/computadoras',
    Impresoras: '/categoria/impresoras',
    Almacenamiento: '/categoria/almacenamiento',
    Accesorios: '/categoria/accesorios',
    Servicios: '/categoria/servicios'
  };
  if (view === 'login') return '/login';
  if (view === 'admin') return '/panel';
  if (view === 'order') return '/pedido';
  if (view === 'category') return categoryPaths[category] || '/categoria/computadoras';
  return '/';
}

function PublicHeader({ view, setView, session, onLogout, openCategory }) {
  return (
    <header className="public-header">
      <button className="brand-button" onClick={() => setView(session ? 'admin' : 'home')} title={session ? 'Panel' : 'Inicio'}>
        <img src={logo} alt="Logo VM" />
        <span>VM TechStore</span>
      </button>
      <nav className="public-nav">
        {!session && (
          <>
            <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>
              <Home size={18} /> Inicio
            </button>
            <div className="products-menu">
              <button className={view === 'category' ? 'active' : ''}>
                <Boxes size={18} /> Productos
              </button>
              <div className="products-menu-list">
                {categories.map((category) => (
                  <button key={category} onClick={() => openCategory(category)}>{category}</button>
                ))}
              </div>
            </div>
          </>
        )}
        {session ? (
          <>
            <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
              <ShieldCheck size={18} /> Panel
            </button>
            <button onClick={onLogout}>
              <LogOut size={18} /> Salir
            </button>
          </>
        ) : (
          <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>
            <LogIn size={18} /> Login
          </button>
        )}
      </nav>
    </header>
  );
}

function HomePage({ openCategory, openOrder }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    api.products()
      .then(setProducts)
      .catch((err) => setError(`No se pudo cargar el catalogo: ${err.message}`));
  }, []);

  const featured = useMemo(() => orderFeaturedProducts(products), [products]);
  const visibleFeatured = useMemo(() => visibleCarouselItems(featured, featuredIndex, 3), [featured, featuredIndex]);

  useEffect(() => {
    if (featured.length <= 3) return undefined;
    const intervalId = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featured.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [featured.length]);

  function moveFeatured(direction) {
    if (featured.length === 0) return;
    setFeaturedIndex((current) => (current + direction + featured.length) % featured.length);
  }

  return (
    <main className="public-main">
      <section className="home-hero">
        <div>
          <p>Centro de Soluciones Tecnologicas e Informaticas VM</p>
          <h1>Productos, soporte y soluciones para hacer tu vida mas sencilla</h1>
          <span>Computadoras, impresoras, almacenamiento, accesorios y servicios tecnicos en Valencia.</span>
        </div>
        <img src={logo} alt="Logo VM TechStore" />
      </section>

      <section className="service-grid">
        <ServiceCard icon={<Laptop />} title="Computadoras" text="Portatiles Dell, HP, Lenovo y equipos para oficina, estudio y negocio." onClick={() => openCategory('Computadoras')} />
        <ServiceCard icon={<Printer />} title="Impresoras" text="Impresoras Canon, HP y Epson para tareas domesticas, educativas y comerciales." onClick={() => openCategory('Impresoras')} />
        <ServiceCard icon={<HardDrive />} title="Almacenamiento" text="SSD, NVMe y discos externos para mejorar rendimiento y respaldos." onClick={() => openCategory('Almacenamiento')} />
        <ServiceCard icon={<Wrench />} title="Servicios tecnicos" text="Mantenimiento preventivo, diagnostico y optimizacion de equipos." onClick={() => openCategory('Servicios')} />
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p>Catalogo</p>
            <h2>Productos destacados</h2>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="featured-carousel">
          <button className="carousel-button" onClick={() => moveFeatured(-1)} disabled={featured.length <= 3} title="Anterior">
            <ChevronLeft size={22} />
          </button>
          <div className="catalog-grid featured-track">
          {visibleFeatured.map((product) => (
            <ProductCard key={product.id} product={product} onOrder={openOrder} />
          ))}
          </div>
          <button className="carousel-button" onClick={() => moveFeatured(1)} disabled={featured.length <= 3} title="Siguiente">
            <ChevronRight size={22} />
          </button>
        </div>
        <div className="carousel-dots" aria-label="Indicador de productos destacados">
          {featured.map((product, index) => (
            <button
              key={product.id}
              className={index === featuredIndex ? 'active' : ''}
              onClick={() => setFeaturedIndex(index)}
              title={`Ver producto destacado ${index + 1}`}
            />
          ))}
        </div>
          {!error && featured.length === 0 && <p className="muted">El catalogo aparecera aqui cuando la API y MySQL esten activos.</p>}
      </section>
      <PublicFooter />
    </main>
  );
}

function ServiceCard({ icon, title, text, onClick }) {
  return (
    <button className="service-card" onClick={onClick}>
      {icon}
      <span>{title}</span>
      <small>{text}</small>
    </button>
  );
}

function CategoryPage({ category, openCategory, openOrder }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.products()
      .then((items) => setProducts(items.filter((product) => product.category === category)))
      .catch((err) => setError(`No se pudo cargar el catalogo: ${err.message}`));
  }, [category]);

  const categoryCopy = {
    Computadoras: 'Portatiles y equipos listos para estudio, oficina y trabajo diario.',
    Impresoras: 'Impresoras multifuncion, tanque de tinta y equipos para alto volumen.',
    Almacenamiento: 'Discos SSD, NVMe y externos para velocidad, respaldo y ampliacion.',
    Accesorios: 'Complementos tecnologicos para trabajo, estudio y servicio tecnico.',
    Servicios: 'Servicios tecnicos para mantenimiento, diagnostico y optimizacion.'
  };

  return (
    <main className="public-main">
      <section className="category-hero">
        <div>
          <p>Catalogo VM TechStore</p>
          <h1>{category}</h1>
          <span>{categoryCopy[category]}</span>
        </div>
      </section>
      <section className="category-tabs">
        {categories.map((item) => (
          <button key={item} className={category === item ? 'active' : ''} onClick={() => openCategory(item)}>
            {item}
          </button>
        ))}
      </section>
      {error && <div className="error">{error}</div>}
      <section className="catalog-grid catalog-page-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} onOrder={openOrder} />)}
        {!error && products.length === 0 && <p className="muted">No hay productos registrados en esta categoria.</p>}
      </section>
      <PublicFooter />
    </main>
  );
}

function ProductCard({ product, onOrder }) {
  return (
    <article className="product-card">
      <img src={productImage(product)} alt={product.name} />
      <div>
        <span>{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description || 'Producto disponible en VM TechStore.'}</p>
        <strong>{money(product.price)}</strong>
        <small>Stock disponible: {product.stock}</small>
        <button onClick={() => onOrder(product)} disabled={Number(product.stock) <= 0}>
          <ShoppingCart size={18} /> Anadir al carrito
        </button>
      </div>
    </article>
  );
}

function OrderPage({ product, setView }) {
  const [form, setForm] = useState(emptyOrder);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const total = product ? Number(product.price) * Number(form.quantity || 1) : 0;

  async function submit(event) {
    event.preventDefault();
    if (!product) return;
    setError('');
    setNotice('');
    try {
      await api.createOrder({ ...form, product_id: product.id, quantity: Number(form.quantity || 1) });
      setForm(emptyOrder);
      setNotice('Pedido enviado correctamente. VM TechStore revisara la solicitud para despacharla.');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!product) {
    return (
      <main className="public-main">
        <section className="order-empty">
          <h1>Selecciona un producto</h1>
          <p>Para crear un pedido primero agrega un producto desde el catalogo.</p>
          <button onClick={() => setView('home')}><Home size={18} /> Ir al catalogo</button>
        </section>
      </main>
    );
  }

  return (
    <main className="public-main">
      <section className="order-layout">
        <article className="order-summary">
          <img src={productImage(product)} alt={product.name} />
          <div>
            <span>{product.category}</span>
            <h1>{product.name}</h1>
            <p>{product.description || 'Producto disponible en VM TechStore.'}</p>
            <strong>{money(product.price)}</strong>
            <small>Stock disponible: {product.stock}</small>
          </div>
        </article>
        <section className="order-form-panel">
          <h2>Datos del pedido</h2>
          {notice && <div className="notice">{notice}</div>}
          {error && <div className="error">{error}</div>}
          <form className="order-form" onSubmit={submit}>
            <input required inputMode="numeric" pattern="[0-9]{10}" maxLength="10" placeholder="Cedula" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: onlyDigits(e.target.value, 10) })} />
            <input required minLength="3" placeholder="Nombres" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input required inputMode="numeric" pattern="09[0-9]{8}" maxLength="10" placeholder="Celular 09XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value, 10) })} />
            <input required type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Direccion" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input required min="1" max={product.stock} type="number" placeholder="Cantidad" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <div className="order-total">Total: {money(total)}</div>
            <button><ShoppingCart size={18} /> Enviar pedido</button>
          </form>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}

function productImage(product) {
  if (product.image_url) return product.image_url;
  const imageBySku = {
    'VM-COM-001': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    'VM-COM-002': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    'VM-COM-003': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80',
    'VM-IMP-001': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80',
    'VM-IMP-002': 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=900&q=80',
    'VM-IMP-003': 'https://images.unsplash.com/photo-1612815154147-ae3b49d3dfe7?auto=format&fit=crop&w=900&q=80',
    'VM-SRV-001': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80'
  };
  const imageByCategory = {
    Computadoras: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    Impresoras: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80',
    Almacenamiento: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
    Servicios: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80'
  };
  return imageBySku[product.sku] || imageByCategory[product.category] || logo;
}

function orderFeaturedProducts(products) {
  const preferredCategories = ['Impresoras', 'Computadoras', 'Almacenamiento', 'Servicios'];
  const selected = preferredCategories
    .map((category) => products.find((product) => product.category === category))
    .filter(Boolean);
  const remaining = products.filter((product) => !selected.some((item) => item.id === product.id));
  return [...selected, ...remaining];
}

function visibleCarouselItems(items, startIndex, count) {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_item, offset) => items[(startIndex + offset) % items.length]);
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div>
        <img src={logo} alt="Logo VM" />
        <strong>VM TechStore</strong>
        <span>Centro de Soluciones Tecnologicas e Informaticas VM</span>
      </div>
      <section>
        <article><MapPin size={18} /><span>Simon Bolivar 10 y Jorge Herrera, Valencia</span></article>
        <article><Phone size={18} /><span>0978813240</span></article>
        <article><Mail size={18} /><span>cyber.vm.19@gmail.com</span></article>
      </section>
      <p>Lun-Vie 7:00am-6:00pm - Sab 8am-1:00pm - Dom 8am-12:30pm</p>
    </footer>
  );
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = await api.login(form);
      onLogin(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <img src={logo} alt="Logo VM" />
        <h1>Ingreso administrativo</h1>
        <p>Acceso para gestionar productos, clientes, inventario y ventas.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          <label>
            Usuario
            <input required minLength="3" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label>
            Clave
            <input required minLength="6" type="password" placeholder="Ingrese su clave" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button disabled={loading}><LogIn size={18} /> {loading ? 'Validando...' : 'Iniciar sesion'}</button>
        </form>
      </section>
    </main>
  );
}

function NotFoundPage({ setView }) {
  return (
    <main className="not-found-page">
      <section>
        <h1>Pagina no encontrada</h1>
        <p>La direccion escrita no existe dentro de VM TechStore.</p>
        <button onClick={() => setView('home')}><Home size={18} /> Volver al inicio</button>
      </section>
    </main>
  );
}

function AdminPanel({ session, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todas');
  const [clientForm, setClientForm] = useState(emptyClient);
  const [saleForm, setSaleForm] = useState({ client_id: '', product_id: '', quantity: 1 });
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function loadAll() {
    const [dashboardData, productData, clientData, saleData, orderData, userData] = await Promise.all([
      api.dashboard(),
      api.products(),
      api.clients(),
      api.sales(),
      api.orders(),
      session.role === 'admin' ? api.users() : Promise.resolve([])
    ]);
    setDashboard(dashboardData);
    setProducts(productData);
    setClients(clientData);
    setSales(saleData);
    setOrders(orderData);
    setUsers(userData);
  }

  useEffect(() => {
    loadAll().catch((err) => setError(`Conecta MySQL y la API: ${err.message}`));
    api.suggestions()
      .then(setSuggestions)
      .catch((err) => {
        setSuggestions([]);
        setError(`No se pudo consumir la API REST externa: ${err.message}`);
      });
  }, []);

  function showSuccess(message) {
    setNotice(message);
    setError('');
    setTimeout(() => setNotice(''), 3500);
  }

  async function saveProduct(event) {
    event.preventDefault();
    try {
      if (editingProduct) await api.updateProduct(editingProduct.id, productForm);
      else await api.createProduct(productForm);
      setProductForm(emptyProduct);
      setEditingProduct(null);
      await loadAll();
      showSuccess('Producto guardado correctamente');
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveClient(event) {
    event.preventDefault();
    try {
      if (editingClient) await api.updateClient(editingClient.id, clientForm);
      else await api.createClient(clientForm);
      setClientForm(emptyClient);
      setEditingClient(null);
      await loadAll();
      showSuccess('Cliente guardado correctamente');
    } catch (err) {
      setError(err.message);
    }
  }

  async function createSale(event) {
    event.preventDefault();
    try {
      await api.createSale({ ...saleForm, quantity: Number(saleForm.quantity) });
      setSaleForm({ client_id: '', product_id: '', quantity: 1 });
      await loadAll();
      showSuccess('Venta registrada e inventario actualizado');
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveUser(event) {
    event.preventDefault();
    try {
      await api.createUser(userForm);
      setUserForm(emptyUser);
      await loadAll();
      showSuccess('Usuario creado correctamente');
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await api.updateOrderStatus(id, status);
      await loadAll();
      showSuccess(status === 'despachado' ? 'Pedido despachado e inventario actualizado' : 'Pedido actualizado correctamente');
    } catch (err) {
      setError(err.message);
    }
  }

  async function importSuggestion(item) {
    try {
      const payload = {
        sku: item.sku,
        name: item.name,
        category: item.category,
        price: Number(item.price),
        stock: Number(item.stock || 0),
        description: item.description || '',
        image_url: item.image_url || ''
      };
      const result = await api.createProduct(payload);
      await loadAll();
      showSuccess(result.updated ? 'Producto externo actualizado correctamente' : 'Producto importado desde API externa');
    } catch (err) {
      setError(`No se pudo importar desde API REST: ${err.message}`);
    }
  }

  const lowStock = useMemo(() => products
    .filter((item) => Number(item.stock) <= 10)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 10), [products]);
  const filteredProducts = useMemo(() => {
    if (productCategoryFilter === 'Todas') return products;
    return products.filter((product) => product.category === productCategoryFilter);
  }, [products, productCategoryFilter]);

  const tabs = [
    ['dashboard', ChartNoAxesCombined, 'Panel'],
    ['products', Boxes, 'Productos'],
    ...(session.role === 'admin' ? [['clients', UserPlus, 'Clientes']] : []),
    ['sales', ShoppingCart, 'Ventas'],
    ['orders', ClipboardList, 'Pedidos'],
    ['api', Download, 'API externa'],
    ...(session.role === 'admin' ? [['users', Users, 'Usuarios']] : [])
  ];

  return (
    <main className="admin-layout">
      <aside className="sidebar">
        <img src={logo} alt="Logo VM" className="logo" />
        <h1>VM TechStore</h1>
        <p>Sesion: {session.full_name}</p>
        <nav>
          {tabs.map(([id, Icon, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} title={label}>
              <Icon size={18} /> {label}
            </button>
          ))}
          <button onClick={onLogout}><LogOut size={18} /> Cerrar sesion</button>
        </nav>
        <section className="contact">
          <span><MapPin size={15} /> Simon Bolivar 10 y Jorge Herrera, Valencia</span>
          <span><Phone size={15} /> 0978813240</span>
          <span><Mail size={15} /> cyber.vm.19@gmail.com</span>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <strong>Atencion diaria</strong>
            <span>Lun-Vie 7:00am-6:00pm - Sab 8am-1:00pm - Dom 8am-12:30pm</span>
          </div>
          <span className="badge">Inventario y ventas</span>
        </header>
        {notice && <div className="notice">{notice}</div>}
        {error && <div className="error">{error}</div>}

        {tab === 'dashboard' && (
          <section>
            <div className="hero">
              <div>
                <p>Haciendo tu vida mas sencilla</p>
                <h2>Gestion comercial para productos y servicios tecnologicos</h2>
              </div>
              <Cpu size={72} />
            </div>
            <div className="metrics">
              <Metric label="Productos" value={dashboard?.summary?.products || 0} />
              <Metric label="Clientes" value={dashboard?.summary?.clients || 0} />
              <Metric label="Ventas" value={money(dashboard?.summary?.revenue)} />
              <Metric label="Stock bajo" value={dashboard?.summary?.low_stock || 0} />
            </div>
            <h3>Inventario por categoria</h3>
            <div className="category-grid">
              {(dashboard?.categories || []).map((category) => (
                <article key={category.category}>
                  <strong>{category.category}</strong>
                  <span>{category.total} productos - {category.units} unidades</span>
                </article>
              ))}
            </div>
            <h3>Alertas de inventario</h3>
            <DataTable rows={lowStock} columns={['sku', 'name', 'category', 'stock']} />
          </section>
        )}

        {tab === 'products' && (
          <CrudSection title="Productos" icon={<PackagePlus />} form={
            <ProductForm form={productForm} setForm={setProductForm} onSubmit={saveProduct} editing={editingProduct} />
          }>
            <ProductFilters
              value={productCategoryFilter}
              onChange={setProductCategoryFilter}
              total={products.length}
              visible={filteredProducts.length}
            />
            <DataTable rows={filteredProducts} columns={['sku', 'name', 'category', 'price', 'stock']} moneyColumn="price" actions={(row) => (
              <Actions onEdit={() => { setEditingProduct(row); setProductForm(row); }} onDelete={async () => { await api.deleteProduct(row.id); await loadAll(); }} />
            )} />
          </CrudSection>
        )}

        {tab === 'clients' && (
          <CrudSection title="Clientes" icon={<UserPlus />} form={
            <ClientForm form={clientForm} setForm={setClientForm} onSubmit={saveClient} editing={editingClient} />
          }>
            <DataTable rows={clients} columns={['full_name', 'email', 'phone', 'city']} actions={(row) => (
              <Actions onEdit={() => { setEditingClient(row); setClientForm(row); }} onDelete={async () => { await api.deleteClient(row.id); await loadAll(); }} />
            )} />
          </CrudSection>
        )}

        {tab === 'sales' && (
          <CrudSection title="Ventas" icon={<ShoppingCart />} form={
            <form className="form" onSubmit={createSale}>
              <select required value={saleForm.client_id} onChange={(e) => setSaleForm({ ...saleForm, client_id: e.target.value })}>
                <option value="">Seleccione cliente</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
              </select>
              <select required value={saleForm.product_id} onChange={(e) => setSaleForm({ ...saleForm, product_id: e.target.value })}>
                <option value="">Seleccione producto</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name} - stock {product.stock}</option>)}
              </select>
              <input required min="1" type="number" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} />
              <button><Save size={18} /> Registrar venta</button>
            </form>
          }>
            <DataTable rows={sales} columns={['client_name', 'product_name', 'quantity', 'unit_price', 'total']} moneyColumn="total" actions={(row) => (
              <span className="status-pill done"><CheckCircle size={15} /> Realizada</span>
            )} />
          </CrudSection>
        )}

        {tab === 'orders' && (
          <section>
            <h2 className="section-title"><ClipboardList /> Pedidos</h2>
            <p className="muted">Confirma, despacha o cancela pedidos creados desde el catalogo publico. Al despachar se descuenta el inventario.</p>
            <DataTable rows={orders} columns={['full_name', 'cedula', 'phone', 'product_name', 'quantity', 'total', 'status']} moneyColumn="total" actions={(row) => (
              <div className="order-actions">
                <button className="icon" disabled={['despachado', 'cancelado'].includes(row.status)} onClick={() => updateOrderStatus(row.id, 'confirmado')}>Confirmar</button>
                <button className="icon success" disabled={['despachado', 'cancelado'].includes(row.status)} onClick={() => updateOrderStatus(row.id, 'despachado')}>Despachar</button>
                <button className="icon danger" disabled={['despachado', 'cancelado'].includes(row.status)} onClick={() => updateOrderStatus(row.id, 'cancelado')}>Cancelar</button>
              </div>
            )} />
          </section>
        )}

        {tab === 'api' && (
          <section>
            <h2>Consumo de API REST externa</h2>
            <p className="muted">Productos sugeridos desde DummyJSON para demostrar integracion con servicios REST.</p>
            <div className="product-grid">
              {suggestions.map((item) => (
                <article key={item.external_id}>
                  <strong>{item.name}</strong>
                  <span>{money(item.price)} - {item.category}</span>
                  <p>{item.description}</p>
                  <button onClick={() => importSuggestion(item)}>
                    <Download size={18} /> Importar
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'users' && session.role === 'admin' && (
          <CrudSection title="Usuarios" icon={<Users />} form={
            <form className="form user-form" onSubmit={saveUser}>
              <input required minLength="3" placeholder="Usuario" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
              <input required minLength="3" placeholder="Nombre completo" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} />
              <input required minLength="6" type="password" placeholder="Ingrese su clave" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="seller">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
              <button><Save size={18} /> Crear usuario</button>
            </form>
          }>
            <DataTable rows={users} columns={['username', 'full_name', 'role']} actions={(row) => (
              <button className="icon danger" disabled={row.id === session.id} onClick={async () => { await api.deleteUser(row.id); await loadAll(); }}><Trash2 size={16} /></button>
            )} />
          </CrudSection>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}

function CrudSection({ title, icon, form, children }) {
  return <section><h2 className="section-title">{icon}{title}</h2>{form}{children}</section>;
}

function ProductForm({ form, setForm, onSubmit, editing }) {
  return (
    <form className="form product-form" onSubmit={onSubmit}>
      <input required minLength="3" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      <input required minLength="3" placeholder="Nombre del producto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {categories.map((item) => <option key={item}>{item}</option>)}
      </select>
      <input required min="0.01" step="0.01" type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      <input required min="0" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
      <input placeholder="Descripcion" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input type="url" placeholder="URL de imagen" value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
      <button><Save size={18} /> {editing ? 'Actualizar' : 'Guardar'}</button>
    </form>
  );
}

function ProductFilters({ value, onChange, total, visible }) {
  const filterCategories = ['Todas', ...categories];
  return (
    <section className="filter-bar">
      <label>
        Tipo de producto
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {filterCategories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <span>{visible} de {total} productos</span>
    </section>
  );
}

function ClientForm({ form, setForm, onSubmit, editing }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <input required minLength="3" placeholder="Nombre completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      <input required type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input required inputMode="numeric" pattern="09[0-9]{8}" maxLength="10" placeholder="Celular 09XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value, 10) })} />
      <input required placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      <input placeholder="Direccion" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <button><Save size={18} /> {editing ? 'Actualizar' : 'Guardar'}</button>
    </form>
  );
}

function DataTable({ rows = [], columns, moneyColumn, actions }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}{actions && <th>Acciones</th>}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length + 1}>Sin registros</td></tr>}
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column}>{column === moneyColumn || column === 'unit_price' || column === 'total' ? money(row[column]) : row[column]}</td>)}
              {actions && <td className="actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Actions({ onEdit, onDelete }) {
  return (
    <>
      <button className="icon" title="Editar" onClick={onEdit}>Editar</button>
      <button className="icon danger" title="Eliminar" onClick={onDelete}><Trash2 size={16} /></button>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
