import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const base = 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ headless: true });
const viewports = [[360,800],[390,844],[820,1180],[1280,720],[1440,900]];
let failures = 0;
const check = (condition, label, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!condition) failures += 1;
};

for (const [width,height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  const errors = [];
  const failedRequests = [];
  page.on('console', message => { if (['error','warning'].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`));
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  check(response?.status() === 200, `${width}x${height} route status`, String(response?.status()));
  const geometry = await page.evaluate(() => ({
    docWidth: document.documentElement.scrollWidth,
    innerWidth,
    sections: document.querySelectorAll('main.deck > section').length,
    buttons: document.querySelectorAll('button').length
  }));
  check(geometry.docWidth <= geometry.innerWidth, `${width}x${height} no document horizontal overflow`, `${geometry.docWidth}/${geometry.innerWidth}`);
  check(geometry.sections === 20, `${width}x${height} runtime section count`, String(geometry.sections));
  check(geometry.buttons === 15, `${width}x${height} runtime button count`, String(geometry.buttons));
  check(errors.length === 0, `${width}x${height} no authored console errors/warnings`, errors.join(' | '));
  check(failedRequests.length === 0, `${width}x${height} no failed requests`, failedRequests.join(' | '));

  if (width === 1280) {
    const hero = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const first = heading.querySelector('span');
      const box = heading.getBoundingClientRect();
      const firstBox = first.getBoundingClientRect();
      const style = getComputedStyle(heading);
      return {x:box.x,y:box.y,width:box.width,height:box.height,firstWidth:firstBox.width,firstHeight:firstBox.height,fontSize:style.fontSize,lineHeight:style.lineHeight,whiteSpace:getComputedStyle(first).whiteSpace,text:heading.innerText.split('\n')};
    });
    check(hero.text.length === 2 && hero.text[0] === 'AI Forward Deployed' && hero.text[1] === 'Engineering', '1280x720 hero is exactly two intended lines', JSON.stringify(hero.text));
    check(hero.fontSize === '134.4px' && hero.lineHeight === '131.712px', '1280x720 hero computed type contract', `${hero.fontSize}/${hero.lineHeight}`);
    check(hero.whiteSpace === 'nowrap', '1280x720 first hero line cannot wrap', hero.whiteSpace);
    check(hero.firstWidth <= hero.width + 1, '1280x720 first hero line fits visibly inside H1', `first=${hero.firstWidth} h1=${hero.width}`);
    check(Math.abs(hero.x - 89.6) < .2 && Math.abs(hero.width - 1100.8) < .2, '1280x720 hero horizontal geometry', `x=${hero.x} width=${hero.width}`);
    check(Math.abs(hero.y - 158.8) < 2, '1280x720 hero vertical geometry', `y=${hero.y}`);
    check(hero.height < 264.5 && hero.height > 262, '1280x720 hero has two line boxes', `height=${hero.height}`);
    await page.screenshot({ path: join(root,'artifacts','hero-1280x720.png'), fullPage: false });

    await page.evaluate(() => document.querySelector('[data-index="6"]').scrollIntoView());
    await page.locator('[data-modal="0"]').click();
    check(await page.locator('#modal-close').evaluate(element => element === document.activeElement), 'modal focuses Close on open');
    await page.keyboard.press('Escape');
    check(await page.locator('[data-modal="0"]').evaluate(element => element === document.activeElement), 'modal restores invoking workflow-card focus');
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    await page.locator('#next').click();
    check(await page.locator('#next').isDisabled(), 'final forward action completes month and disables Next');
    await page.locator('#prev').click();
    check(!(await page.locator('#next').isDisabled()), 'first backward action restores fourth-week focus');
  }
  await page.close();
}
await browser.close();
if (failures) process.exit(1);
console.log('PASS all browser/runtime assertions');
