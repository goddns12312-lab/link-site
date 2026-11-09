const puppeteer = require('puppeteer-core');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:5180';
const SHOT = 'C:/Users/B/AppData/Local/Temp/claude/C--Users-B/101a0a62-950c-46c2-a5c7-a3d40b99395c/scratchpad';

const LINKS = [
  { cat: "성인", label: "야동코리아", url: "https://yadongkorea13.com/", frameable: true },
  { cat: "성인", label: "자딸파티", url: "https://ddalpt6974.cc", frameable: false },
  { cat: "웹툰사이트", label: "마루마루", url: "https://marumaru108.com/", frameable: false },
  { cat: "토토/카지노", label: "Bet38", url: "https://www.6p312.com/?a=66429", frameable: false },
  { cat: "TV다시보기", label: "미미티비(MIMITV)", url: "https://mimitv12.com/", frameable: false },
  { cat: "오피/유흥", label: "외로운밤", url: "https://lybam9.com/", frameable: false },
  { cat: "먹튀검증", label: "토토와우", url: "https://totowow1.com/", frameable: false },
  { cat: "스포츠중계", label: "벳모아티비", url: "https://betmoa.tv/", frameable: false },
  { cat: "토렌트", label: "토렌트다이소", url: "https://torrentdaiso2.com", frameable: false },
  { cat: "커뮤니티", label: "인벤", url: "https://www.inven.co.kr/", frameable: false },
  { cat: "성인용품", label: "만냥몰", url: "https://www.10000w.co.kr/", frameable: false },
  { cat: "한인교민", label: "[미국]뉴욕코리아", url: "https://www.newyorkkorea.net/", frameable: false },
  { cat: "성인방송", label: "팬더티비", url: "https://www.pandalive.co.kr", frameable: false },
  { cat: "해외성인", label: "Pornhub", url: "https://www.pornhub.com/", frameable: false },
  { cat: "성인화보", label: "MAXIM", url: "https://www.maximkorea.net/", frameable: false },
  { cat: "AI성인", label: "Golove", url: "https://goloveai.com", frameable: false },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,900']
  });

  const results = [];

  for (let i = 0; i < LINKS.length; i++) {
    const link = LINKS[i];
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message.substring(0, 100)));

    console.log(`\n[${i+1}/${LINKS.length}] ${link.cat} > ${link.label} (${link.frameable ? 'frameable' : 'proxy'})`);

    try {
      // 1. 메인페이지 열기
      await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 });

      // UpdatePopup 닫기
      await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('확인했어요'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 300));

      // 2. 링크 찾아서 클릭
      const clicked = await page.evaluate((label) => {
        const allA = Array.from(document.querySelectorAll('a, li, span, button'));
        const el = allA.find(e => e.textContent.trim().includes(label) && e.closest('.cat-card'));
        if (el) { el.click(); return true; }
        // 직접 카드 내 a 태그 검색
        const a = Array.from(document.querySelectorAll('.cat-card a')).find(a => a.textContent.includes(label));
        if (a) { a.click(); return true; }
        return false;
      }, link.label);

      if (!clicked) {
        console.log('  ⚠️ 링크 못찾음 (UI에서 검색 실패)');
        results.push({ ...link, status: 'NOT_FOUND', popup: false, iframeSrc: '' });
        await page.close();
        continue;
      }

      await new Promise(r => setTimeout(r, 2000));

      // 3. IframeViewer + BrandPopup 확인
      const check = await page.evaluate(() => {
        // fixed z-100 div with iframe = IframeViewer
        const viewer = Array.from(document.querySelectorAll('div')).find(d => {
          const cs = getComputedStyle(d);
          return cs.position === 'fixed' && parseInt(cs.zIndex) >= 100 && d.querySelector('iframe');
        });
        if (!viewer) return { viewer: false };

        const html = viewer.innerHTML;
        const iframe = viewer.querySelector('iframe');
        const iframeSrc = iframe?.src || '';

        // BrandPopup 확인: 현재주소 + 다음주소 + 평생주소 텍스트
        const hasPopup = html.includes('현재주소') && html.includes('다음주소') && html.includes('평생주소');
        const hasBrand = html.includes('링크잇');
        const hasCountdown = /\d초 후 확인 가능/.test(html);

        return {
          viewer: true,
          popup: hasPopup,
          brand: hasBrand,
          countdown: hasCountdown,
          iframeSrc: iframeSrc.substring(0, 150),
          isProxy: iframeSrc.includes('/proxy?url='),
          isDirect: !iframeSrc.includes('/proxy'),
        };
      });

      if (!check.viewer) {
        console.log('  ❌ IframeViewer 안열림');
        results.push({ ...link, status: 'NO_VIEWER', popup: false, iframeSrc: '' });
        await page.close();
        continue;
      }

      const popupOk = check.popup && check.brand;
      const routeOk = link.frameable ? check.isDirect : check.isProxy;

      console.log(`  BrandPopup: ${popupOk ? '✅' : '❌'} (현재/다음/평생: ${check.popup}, 링크잇: ${check.brand}, 카운트다운: ${check.countdown})`);
      console.log(`  iframe: ${routeOk ? '✅' : '⚠️'} ${link.frameable ? 'direct' : 'proxy'} | src: ${check.iframeSrc.substring(0, 80)}`);

      // 4. iframe 로드 확인 (proxy인 경우 HTTP 응답 체크)
      if (check.isProxy) {
        const proxyUrl = check.iframeSrc;
        try {
          const resp = await page.evaluate(async (url) => {
            const r = await fetch(url, { method: 'GET' });
            const text = await r.text();
            return { status: r.status, len: text.length, hasHtml: text.includes('<html') || text.includes('<HTML') || text.includes('<!DOCTYPE') || text.includes('<!doctype') };
          }, proxyUrl);
          console.log(`  프록시응답: ${resp.status} | 길이: ${resp.len} | HTML: ${resp.hasHtml}`);
          results.push({ ...link, status: resp.status === 200 ? 'OK' : `HTTP_${resp.status}`, popup: popupOk, iframeSrc: check.iframeSrc, contentLen: resp.len, hasHtml: resp.hasHtml });
        } catch (e) {
          console.log(`  프록시fetch 실패: ${e.message.substring(0, 60)}`);
          results.push({ ...link, status: 'FETCH_ERR', popup: popupOk, iframeSrc: check.iframeSrc });
        }
      } else {
        // frameable - iframe onload 이벤트로 확인
        results.push({ ...link, status: 'OK_DIRECT', popup: popupOk, iframeSrc: check.iframeSrc });
      }

      // 스크린샷 (첫 4개만)
      if (i < 4) {
        const shotName = `verify_all_${i+1}_${link.label.replace(/[^a-zA-Z가-힣]/g, '')}.png`;
        await page.screenshot({ path: SHOT + '/' + shotName });
        console.log(`  📸 ${shotName}`);
      }

    } catch (e) {
      console.log(`  ❌ 에러: ${e.message.substring(0, 80)}`);
      results.push({ ...link, status: 'ERROR', popup: false, error: e.message.substring(0, 80) });
    }

    await page.close();
  }

  // 요약
  console.log('\n\n========== 결과 요약 ==========');
  console.log(`총 ${LINKS.length}개 링크 테스트\n`);

  const popupOk = results.filter(r => r.popup);
  const popupFail = results.filter(r => !r.popup);
  const loadOk = results.filter(r => r.status === 'OK' || r.status === 'OK_DIRECT');
  const loadFail = results.filter(r => r.status !== 'OK' && r.status !== 'OK_DIRECT');

  console.log(`BrandPopup 표시: ${popupOk.length}/${results.length} ✅`);
  if (popupFail.length) {
    console.log('  팝업 실패:');
    popupFail.forEach(r => console.log(`    - ${r.cat} > ${r.label}: ${r.status}`));
  }

  console.log(`\n사이트 로드: ${loadOk.length}/${results.length} ✅`);
  if (loadFail.length) {
    console.log('  로드 문제:');
    loadFail.forEach(r => console.log(`    - ${r.cat} > ${r.label}: ${r.status} ${r.error || ''}`));
  }

  console.log('\n상세:');
  results.forEach(r => {
    const icon = (r.status === 'OK' || r.status === 'OK_DIRECT') && r.popup ? '✅' : '⚠️';
    console.log(`  ${icon} [${r.cat}] ${r.label} — popup:${r.popup} status:${r.status} ${r.contentLen ? 'len:'+r.contentLen : ''}`);
  });

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
