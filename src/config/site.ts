export const siteConfig = {
  name: "Wadi Al Safar",
  nameAr: "وادي السفر",
  legalNameAr: "شركة وادي السفر للسفر والسياحة",
  legalNameEn: "Wadi Al Safar Travel & Tourism Company",
  description:
    "Wadi Al Safar is a Saudi travel & tourism company offering flights, hotels, visas, packages, and cruises across more than 70 destinations.",
  descriptionAr:
    "وادي السفر شركة سعودية متخصصة في السياحة والسفر، تقدم خدمات الطيران والفنادق والتأشيرات والباقات السياحية والرحلات البحرية لأكثر من ٧٠ وجهة.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /*
   * The loyalty programme is a separate product (Orbit), not a page on this
   * site — signing in, joining, and adding the card to Apple/Google Wallet
   * all already work there today. Points are awarded from Orbit's own panel
   * when a service is delivered, so this site only needs to send customers
   * there, not reimplement any of it.
   */
  orbitLoyaltyUrl: "https://orbit.daysam.co/stores/wadi-al-safar-travel",
  contactPhone: "+966115602558",
  contactPhoneDisplay: "+966 11 560 2558",
  contactEmail: "info@wadialsafar.com",
  /*
   * Branch lines carried over from the existing company listings. Each keeps a
   * display form alongside the dialable one: a tel: href has to be unspaced,
   * and a printed number has to be readable, and they are not the same string.
   */
  branches: [
    { key: "main", phone: "+966115602558", display: "+966 11 560 2558" },
    { key: "one", phone: "+966112266745", display: "+966 11 226 6745" },
    { key: "two", phone: "+966112311372", display: "+966 11 231 1372" },
    { key: "three", phone: "+966112022107", display: "+966 11 202 2107" },
  ],
  /*
   * Official trust marks — Ministry of Commerce, VAT, Saudi Business Center.
   * Empty until the client supplies the artwork: these are government marks,
   * and an approximation of one is worse than its absence. Drop the files in
   * public/certificates/ and list them here to light the row up.
   */
  certificates: [] as { src: string; labelAr: string; labelEn: string; href?: string }[],
  registration: {
    taxNumber: "311275985300003",
    commercialRegistry: "1010927769",
  },
  socialLinks: [
    "https://facebook.com/wadialsafartravel",
    "https://x.com/wadialsafar",
    "https://instagram.com/wadialsafar_sa",
    "https://tiktok.com/@wadialsafar_sa",
    "https://snapchat.com/add/wadialsafar1",
  ],
} as const;
