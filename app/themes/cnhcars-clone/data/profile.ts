type OpeningHoursItem = {
  day: string;
  hours: string;
  schema: string;
};

export const companyProfile = {
  name: "CNH Cars Ltd",
  legalName: "CNH Cars Ltd",
  domain: "https://cnhcars.co.uk",
  logo: "/images/CNH CARS white logo.png",
  twitter: "",
  seo: {
    defaultKeywords: [
      "used cars welwyn",
      "used cars hertfordshire",
      "welwyn car dealership",
      "quality used cars",
      "cnh cars ltd",
    ],
  },
  location: {
    address: {
      line1: "113-115 Codicote Road",
      line2: "",
      city: "Welwyn",
      county: "Hertfordshire",
      postcode: "AL6 9TY",
      country: "United Kingdom",
    },
    phone: "+44 7537 164889",
    email: "chcars24@yahoo.com",
    fullAddress: "113-115 Codicote Road, Welwyn, Hertfordshire, AL6 9TY",
  },
  openingHours: [
    { day: "Monday", hours: "09:00 - 18:00", schema: "Mo 09:00-18:00" },
    { day: "Tuesday", hours: "09:00 - 18:00", schema: "Tu 09:00-18:00" },
    { day: "Wednesday", hours: "09:00 - 18:00", schema: "We 09:00-18:00" },
    { day: "Thursday", hours: "09:00 - 18:00", schema: "Th 09:00-18:00" },
    { day: "Friday", hours: "09:00 - 18:00", schema: "Fr 09:00-18:00" },
    { day: "Saturday", hours: "10:00 - 16:00", schema: "Sa 10:00-16:00" },
    { day: "Sunday", hours: "Closed", schema: "Su" },
  ] as OpeningHoursItem[],
};
