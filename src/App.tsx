import { useState } from 'react';
import { DataProvider } from './context/DataContext';
import AdminApp from './admin/AdminApp';
import AdminLogin from './admin/AdminLogin';
import Loader from './components/Loader';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import CardGrid from './components/CardGrid';
import Stats from './components/Stats';
import Process from './components/Process';
import CTA from './components/CTA';
import Footer from './components/Footer';

const isAdminRoute = new URLSearchParams(window.location.search).has('admin');

function PublicSite() {
  return (
    <>
      <Loader />
      <Header />
      <HeroSlider />
      <div className="page">
        <CardGrid />
        <Stats />
        <Process />
        <CTA />
        <Footer />
      </div>
    </>
  );
}

function AdminGate() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('noor_admin_auth') === '1'
  );

  const handleLogout = () => {
    sessionStorage.removeItem('noor_admin_auth');
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminApp onLogout={handleLogout} />;
}

export default function App() {
  return (
    <DataProvider>
      {isAdminRoute ? <AdminGate /> : <PublicSite />}
    </DataProvider>
  );
}
