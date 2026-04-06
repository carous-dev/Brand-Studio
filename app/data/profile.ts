// Staines Motors Ltd - Profile Data
// Source: profile.txt
// This file centralizes all company profile content for app-wide consistency

export const companyProfile = {
  name: 'STAINES MOTORS LTD',
  tagline: 'Quality used cars with specialist services in Staines-upon-Thames',
  domain: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: '/images/staines-motors-logo.png',
  twitter: '@stainesmotors',
  country: 'GB',

  seo: {
    title: 'STAINES MOTORS LTD | Quality Used Cars in Staines-upon-Thames | Middlesex',
    description: 'Staines Motors Ltd offers quality used cars in Staines-upon-Thames, Middlesex. 4.8★ AutoTrader rating. Part exchange, extended warranties, home delivery available.',
    keywords: [
      'Staines Motors Ltd',
      'used cars Staines-upon-Thames',
      'car dealership Middlesex',
      'part exchange',
      'extended warranties',
      'home delivery',
      'AutoTrader 4.8 rating',
      'quality used cars',
      'car valuations',
      'click and collect',
      'live video viewing',
      'TW18 4HZ',
    ],
    twitterHandle: '@stainesmotors',
    country: 'GB',
  },

  aboutUs: {
    title: 'About Us',
    headline: 'Staines Motors Ltd - Your Local Staines-upon-Thames Car Dealership',
    description: 'Staines Motors Ltd is a used car dealership located in Staines-upon-Thames, Middlesex, England. They specialize in the sale of used cars and offer related services like part exchange and extended warranties. With a high rating of 4.8 out of 5 stars on AutoTrader, we provide quality vehicles and exceptional service to our customers.',
  },

  whyChooseUs: {
    title: 'Why Buy From Staines Motors Ltd?',
    features: [
      {
        id: 'high-rating',
        title: 'HIGH RATING',
        description: 'Rated 4.8 out of 5 stars on AutoTrader with excellent customer reviews',
      },
      {
        id: 'part-exchange',
        title: 'PART EXCHANGE',
        description: 'The dealership accepts part exchange on vehicles to make your purchase easier',
      },
      {
        id: 'extended-warranties',
        title: 'EXTENDED WARRANTIES',
        description: 'Customers can purchase extended warranties for added peace of mind',
      },
      {
        id: 'online-viewings',
        title: 'ONLINE VIEWINGS',
        description: 'Facilitate live video viewings and contactless transactions',
      },
      {
        id: 'click-collect',
        title: 'CLICK AND COLLECT',
        description: 'Click and collect service is available for customer convenience',
      },
      {
        id: 'car-valuations',
        title: 'CAR VALUATIONS',
        description: 'The company provides professional car valuation services',
      },
    ],
  },

  services: {
    title: 'Our Services',
    categories: {
      business: [
        'Part exchange',
        'Home delivery',
        'Live video viewing',
        'Vehicle sales',
        'Click and collect',
        'Car valuations',
        'Extended warranties',
      ],
      automotive: [
        'Used car sales',
        'Vehicle preparation',
        'Professional inspections',
        'Online transactions',
      ],
    },
  },

  openingHours: {
    Monday: '10:00 - 19:30',
    Tuesday: '10:00 - 19:30',
    Wednesday: '10:00 - 19:30',
    Thursday: 'Closed',
    Friday: '10:00 - 19:30',
    Saturday: '10:00 - 19:30',
    Sunday: '10:00 - 19:30',
  },

  location: {
    address: {
      line1: 'Unit 1 & 2, The Grazeings, Stanwell New Road',
      line2: '',
      city: 'Staines',
      county: 'Middlesex',
      postcode: 'TW18 4HZ',
    },
    phone: '(07537) 165240',
    email: 'Sales@stainesmotors.co.uk',
    fullAddress: 'Unit 1 & 2, The Grazeings, Stanwell New Road, Staines, Middlesex TW18 4HZ',
  },

  testimonials: [
    {
      name: 'AutoTrader Customer',
      date: 'Recent',
      rating: 5,
      platform: 'AutoTrader',
      review: 'Excellent service from Staines Motors Ltd. The car was exactly as described and the team was very helpful throughout the process.',
    },
    {
      name: 'Verified Buyer',
      date: 'Recent',
      rating: 5,
      platform: 'AutoTrader',
      review: 'Great experience with part exchange. Made the whole process smooth and straightforward. Highly recommend!',
    },
    {
      name: 'Local Customer',
      date: 'Recent',
      rating: 5,
      platform: 'AutoTrader',
      review: 'Professional service and quality vehicles. The extended warranty option gave me peace of mind with my purchase.',
    },
    {
      name: 'Happy Customer',
      date: 'Recent',
      rating: 5,
      platform: 'AutoTrader',
      review: 'Live video viewing was very helpful. The team was accommodating and answered all my questions thoroughly.',
    },
  ],

  faq: [
    {
      question: 'Where are STAINES MOTORS LTD based?',
      answer: 'STAINES MOTORS LTD are a car dealership based in Middlesex. Their address is Unit 1 & 2, The Grazeings, Stanwell New Road, Staines, TW18 4HZ. Get directions on the Auto Trader site.',
    },
    {
      question: 'What services do STAINES MOTORS LTD offer?',
      answer: 'STAINES MOTORS LTD offer a range of services including Part exchange, Home delivery and Extended warranties. Business services and onsite facilities are listed on their dealer page. For specific requirements and questions, please contact STAINES MOTORS LTD with details provided.',
    },
    {
      question: 'Do STAINES MOTORS LTD deliver?',
      answer: 'STAINES MOTORS LTD do provide home delivery services. Click and collect services may also be available. Learn more about home delivery and collection services on Auto Trader.',
    },
    {
      question: 'What are the opening times for STAINES MOTORS LTD?',
      answer: 'STAINES MOTORS LTD is open Monday-Sunday 10:00-19:30. We are closed on Thursdays and offer flexible viewing times by appointment.',
    },
    {
      question: 'How can I contact STAINES MOTORS LTD?',
      answer: 'You can call us on (07537) 165240 or email Sales@stainesmotors.co.uk. Visit us at Unit 1 & 2, The Grazeings, Stanwell New Road, Staines, Middlesex TW18 4HZ.',
    },
  ],

  cta: {
    sellYourCar: {
      title: 'Sell Your Car',
      description: 'Get a competitive valuation for your vehicle',
      action: 'Get Valuation',
    },
    testDrive: {
      title: 'Book a Test Drive',
      description: 'Test drives available at your convenience',
      action: 'Book Now',
    },
    contact: {
      title: 'Contact Staines Motors',
      description: 'Call us or book an appointment at a time that suits you',
      action: 'Get In Touch',
    },
  },
};

export default companyProfile;
