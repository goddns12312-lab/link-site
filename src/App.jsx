import { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryNav from './components/CategoryNav';
import InfoBoxes from './components/InfoBoxes';
import SocialRow from './components/SocialRow';
import BannerSection from './components/BannerSection';
import DirectoryGrid from './components/DirectoryGrid';
import Interstitial from './components/Interstitial';
import IframeViewer from './components/IframeViewer';
import UpdatePopup from './components/UpdatePopup';
import Footer from './components/Footer';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [error, setError] = useState(null);
  const [bridgeLink, setBridgeLink] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/catalog.json').then((r) => r.json()),
      fetch('/home-data.json').then((r) => r.json()),
    ])
      .then(([catalog, home]) => {
        setCategories(catalog);
        setHomeData(home);
        if (new URLSearchParams(window.location.search).get('bridgetest') === '1') {
          setBridgeLink({ label: '예제 사이트(테스트)', url: 'https://example.com/' });
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        데이터 로딩 실패: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar
        telegram={homeData?.telegram}
        permanent={homeData?.permanent}
        topLinks={homeData?.topLinks}
      />
      <Header siteName={homeData?.siteName} siteNameEn={homeData?.siteNameEn} />
      <Hero
        siteName={homeData?.siteName}
        siteNameEn={homeData?.siteNameEn}
        totalLinks={categories.reduce((n, c) => n + c.links.length, 0)}
        totalCats={categories.length}
      />
      <CategoryNav categories={categories} />
      <main>
        <InfoBoxes telegram={homeData?.telegram} permanent={homeData?.permanent} />
        <SocialRow socials={homeData?.socials} />
        <BannerSection banners={homeData?.banners || []} />
        <DirectoryGrid
          categories={categories}
          onBridge={setBridgeLink}
          bridgeAll={homeData?.bridge?.all}
        />
      </main>
      <Footer />
      {(homeData?.bridge?.mode || 'iframe') === 'iframe' ? (
        <IframeViewer
          link={bridgeLink}
          siteName={homeData?.siteName}
          config={homeData?.bridge}
          onClose={() => setBridgeLink(null)}
        />
      ) : (
        <Interstitial
          link={bridgeLink}
          config={homeData?.bridge}
          siteName={homeData?.siteName}
          onClose={() => setBridgeLink(null)}
        />
      )}
      <UpdatePopup notice={homeData?.notice} />
    </div>
  );
}
