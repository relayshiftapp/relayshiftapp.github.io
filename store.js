// Store links for this phone, read from the database (app_version_check → store_url) so a new listing needs no
// republish. Returns { ios, android } (null until a listing exists).
window.relayStores = async function () {
  const ask = (platform) =>
    fetch(`${RELAY.url}/rest/v1/rpc/app_version_check`, {
      method: 'POST',
      headers: { apikey: RELAY.key, Authorization: `Bearer ${RELAY.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_platform: platform, p_version: '0' }),
    }).then((r) => (r.ok ? r.json() : {})).then((j) => j.store_url || null).catch(() => null);
  const [ios, android] = await Promise.all([ask('ios'), ask('android')]);
  // Until the listings exist: Google Play's address is fixed by the package name, so that one is already right.
  // The App Store id is a placeholder. Setting app_versions.store_url in the database replaces either one.
  return {
    ios: ios || 'https://apps.apple.com/app/relay/id0000000000',
    android: android || 'https://play.google.com/store/apps/details?id=com.amandaclouser.relay',
  };
};

window.relayPlatform = function () {
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
};
