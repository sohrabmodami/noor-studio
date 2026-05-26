import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';
import AdminLogin from './admin/AdminLogin';
import AdminPanel from './admin/AdminPanel';
import Header from './components/Header';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Process from './components/Process';
import CTA from './components/CTA';
import Footer from './components/Footer';
import './App.css';

const isAdmin = new URLSearchParams(window.location.search).has('admin');

function AdminRoute() {
  const { token } = useAuth();
  return token ? <AdminPanel /> : <AdminLogin />;
}

function PublicSite() {
  return (
    <>
      <Header />
      <Hero />
      <Gallery />
      <Process />
      <CTA />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <SiteContentProvider>
      <AuthProvider>
        <DataProvider>
          {isAdmin ? <AdminRoute /> : <PublicSite />}
        </DataProvider>
      </AuthProvider>
    </SiteContentProvider>
  );
}
