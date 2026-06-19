const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "ref",
  "mc_cid",
  "mc_eid",
  "igshid",
  "msclkid",
  "_ga",
];

function cleanUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);

    // Strip only tracking params
    TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param));

    // Remove trailing slash for consistency

    url.pathname = url.pathname.replace(/\/+$/, "") || "/";

    const cleaned = url.toString();

    return cleaned;
  } catch {
    return rawUrl;
  }
}

console.log(
  cleanUrl(
    "https://example.com/page////?utm_source=google&utm_medium=cpc&ref=twitter&id=12345&v=123",
  ),
);
