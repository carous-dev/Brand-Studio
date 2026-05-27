export type TermsContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; label: string; text: string }
  | { type: 'contact'; items: Array<{ label: string; value: string; href?: string }> };

export type TermsSection = {
  id: string;
  title: string;
  content: TermsContentBlock[];
};

export const termsHighlights = [
  {
    title: 'Deposits',
    text: 'A deposit secures the vehicle. After you have viewed the vehicle in person, the deposit is non-refundable.',
  },
  {
    title: 'Cancellation',
    text: 'After delivery, you can cancel within 14 days under the Consumer Contracts Regulations 2013, subject to the stated conditions.',
  },
  {
    title: 'Delivery',
    text: 'Only the named customer can receive the vehicle and must provide valid photo ID and recent proof of address.',
  },
] as const;

export const termsCompanyFacts = [
  { label: 'Trading name', value: 'CNH Cars' },
  { label: 'Legal entity', value: 'CNH CARS LTD' },
  { label: 'Company number', value: '16086182' },
  {
    label: 'Registered office',
    value: '113-115 Codicote Road, Welwyn, Hertfordshire, United Kingdom, AL6 9TY',
  },
  { label: 'Payment methods', value: 'UK bank transfer (BACS/Faster Payments) or cash' },
  { label: 'Complaint response target', value: 'Within 48 hours' },
] as const;

export const termsDocumentLinks = [
  { href: '/privacy/', label: 'Privacy Policy' },
  { href: '/terms/', label: 'Terms & Conditions' },
  { href: '/cookies/', label: 'Cookie Policy' },
  { href: '/disclaimer/', label: 'Disclaimer' },
] as const;

export const termsSections: TermsSection[] = [
  {
    id: 'parties',
    title: '1. Parties',
    content: [
      {
        type: 'paragraph',
        text: 'CNH Cars is a trading name of CNH CARS LTD. We are registered in England and Wales. Registered office address: 113-115 Codicote Road, Welwyn, Hertfordshire, United Kingdom, AL6 9TY. Company Registration No: 16086182.',
      },
      {
        type: 'paragraph',
        text: 'You are the customer who places an order with us for the purchase of a vehicle.',
      },
    ],
  },
  {
    id: 'vehicle-order',
    title: '2. Vehicle Order',
    content: [
      {
        type: 'paragraph',
        text: 'Your purchase details are specified in your order, confirmed on site, and will include: the make, model, price, delivery time, and delivery location for the vehicle you are purchasing.',
      },
      {
        type: 'paragraph',
        text: 'Your order will specify your personal details as the recipient of the vehicle. A contract is formed between you and CNH CARS LTD, consisting of your order and these terms and conditions, when you complete an order and we accept it.',
      },
      {
        type: 'paragraph',
        text: 'If we accept your order, we will provide a receipt confirming your order.',
      },
      {
        type: 'note',
        label: 'Order priority',
        text: 'In the event of any conflict, inconsistency, or ambiguity between your order and these terms, your order will take precedence.',
      },
    ],
  },
  {
    id: 'your-vehicle',
    title: '3. Your Vehicle',
    content: [
      {
        type: 'paragraph',
        text: 'CNH CARS LTD will deliver the vehicle as specified in your order to the address and at the time given in your order.',
      },
      {
        type: 'paragraph',
        text: 'Prior to delivery, the vehicle will have undergone a multi-point mechanical inspection as part of our preparation of the vehicle for sale. The vehicle will also have a valid MOT if required.',
      },
      {
        type: 'paragraph',
        text: "CNH CARS LTD does not provide any manufacturer's guarantee for the vehicle. If and to the extent that a manufacturer's guarantee and/or roadside assistance programme endures from a previous period of ownership of the vehicle and you are entitled to receive the benefit of this, CNH CARS LTD reserves the right to provide only the difference between any warranty or roadside assistance coverage and that amount of coverage from which the vehicle will continue to benefit from the point of delivery.",
      },
      {
        type: 'paragraph',
        text: 'The vehicle may previously have been used as a lease or rental vehicle or have had multiple users. It may also have been imported from another country. We will use reasonable endeavours to provide you with any additional information in our possession about the vehicle at your request.',
      },
      {
        type: 'paragraph',
        text: 'However, if you have any questions about the previous use of the vehicle, or have specific requirements, you are advised to discuss these with us before placing your order.',
      },
      {
        type: 'paragraph',
        text: 'The mileage on the vehicle may vary by a minor amount to that stated on the listing as a result of, for example, transport and delivery to you.',
      },
      {
        type: 'paragraph',
        text: 'References to "Leather" in any listing may not be genuine or 100% leather but rather partial leather or an artificial substitute.',
      },
      {
        type: 'paragraph',
        text: 'The images of the vehicle on our listings are for illustrative purposes only. Although we make every effort to display the vehicle accurately, we do not guarantee that the images will exactly reflect the actual appearance of the vehicle. We do not guarantee that the colour of the vehicle exactly reflects the description. If you believe that the vehicle you purchased differs materially from the way it was depicted, you have the right to refuse to accept delivery or return the vehicle and seek a refund in accordance with these terms.',
      },
      {
        type: 'paragraph',
        text: 'Vehicle descriptions, specifications, and included optional extras may be supplied by third-party data providers. If you find the data is inaccurate, you have the right to refuse to accept delivery of the vehicle or return the vehicle and seek a refund in accordance with these terms.',
      },
    ],
  },
  {
    id: 'payment-and-charges',
    title: '4. Payment and Charges',
    content: [
      {
        type: 'paragraph',
        text: 'Payment may be made by UK bank transfer (BACS/Faster Payments) or cash.',
      },
      {
        type: 'paragraph',
        text: 'You will receive an email confirmation and receipt of your payment for the vehicle.',
      },
      {
        type: 'paragraph',
        text: "Where applicable and noted on your order, the purchase price includes all delivery fees. The vehicle's first registration fees (if applicable) will be charged in addition to the purchase price at the applicable rates.",
      },
      {
        type: 'paragraph',
        text: 'You will be required to register and pay for vehicle tax at the point that you accept delivery of the vehicle.',
      },
      {
        type: 'paragraph',
        text: 'The purchase price includes VAT (where applicable) at the current rate chargeable in the United Kingdom on the date of purchase.',
      },
    ],
  },
  {
    id: 'deposit',
    title: '5. Deposit',
    content: [
      {
        type: 'paragraph',
        text: 'A deposit is required to secure the vehicle and take it off sale. Payment of a deposit confirms your commitment to purchase the vehicle.',
      },
      {
        type: 'note',
        label: 'Viewed in person',
        text: 'Once you have viewed the vehicle in person, your deposit is non-refundable. By viewing the vehicle, you have had the opportunity to inspect it and satisfy yourself as to its condition. The deposit is non-refundable because the vehicle is held exclusively for you from the point of deposit and is removed from sale, resulting in a loss of potential buyers during this period.',
      },
      {
        type: 'paragraph',
        text: 'If you have paid a deposit but have not viewed the vehicle in person, the deposit is refundable subject to a reasonable administration fee to cover costs incurred in holding the vehicle off sale.',
      },
    ],
  },
  {
    id: 'finance-agreement',
    title: '6. Finance Agreement',
    content: [
      {
        type: 'paragraph',
        text: 'You may be eligible to pay for your vehicle on finance through our third-party finance providers.',
      },
      {
        type: 'paragraph',
        text: 'If you choose to apply for finance, approval normally takes a few minutes but may take longer. Please note that APRs provided are representative only.',
      },
      {
        type: 'paragraph',
        text: 'If you enter into a third-party finance agreement, you undertake to register as the owner of the vehicle as soon as possible following delivery.',
      },
      {
        type: 'paragraph',
        text: 'If you cancel your credit agreement but have already received your vehicle and your cancellation rights no longer apply, you will be liable to pay your finance provider in full for the vehicle and any additional products, plus potential additional charges.',
      },
    ],
  },
  {
    id: 'delivery',
    title: '7. Delivery',
    content: [
      {
        type: 'paragraph',
        text: 'Physical delivery of your vehicle will take place on the date set out in your order.',
      },
      {
        type: 'paragraph',
        text: 'Only you, as the person specified in your order, are eligible to take receipt of your vehicle on delivery.',
      },
      {
        type: 'paragraph',
        text: 'Your vehicle will only be delivered to the address specified in your order. Our delivery team will require sufficient access to make delivery.',
      },
      {
        type: 'paragraph',
        text: 'Upon delivery, you must provide valid photographic identification and proof of address dated within the last 3 months.',
      },
      {
        type: 'paragraph',
        text: 'If you need to rearrange a delivery, please contact CNH Cars customer services at least 24 hours prior to the scheduled delivery time to rearrange at no additional cost.',
      },
      {
        type: 'paragraph',
        text: 'If you need to rearrange delivery less than 24 hours prior to the scheduled delivery time, you may incur an additional charge.',
      },
      {
        type: 'paragraph',
        text: 'Upon delivery, you will be asked to confirm receipt of your vehicle and that it conforms to your order. You will be asked to sign our delivery receipt and this will be confirmation that you have received and accepted the vehicle. The vehicle will be your responsibility from the time that you sign the delivery receipt.',
      },
      {
        type: 'paragraph',
        text: 'Subject to any finance agreement you may have in place, ownership of the vehicle will pass to you once: (i) we have received full payment of the purchase price (and any other amounts due) in cleared funds; (ii) we have accepted your part-exchange vehicle as partial payment (if applicable); and (iii) you have accepted delivery by signing our delivery receipt.',
      },
      {
        type: 'paragraph',
        text: 'We will own the vehicle until each of the above conditions have been satisfied, at which point we will notify the DVLA of the change in ownership. You should contact the DVLA if you do not receive your V5 logbook within 14 days.',
      },
    ],
  },
  {
    id: 'cancellation-rights',
    title: '8. Your Cancellation Rights',
    content: [
      {
        type: 'paragraph',
        text: 'You can cancel your contract with us at any point before the vehicle is delivered by contacting CNH Cars. After delivery of the vehicle, under the Consumer Contracts Regulations 2013, you have the right to cancel your contract within 14 days of delivery without giving any reason.',
      },
      {
        type: 'note',
        label: 'Deposit interaction',
        text: 'This cancellation right is subject to the deposit terms in Section 5. Where a deposit has been paid and the vehicle has been viewed in person, the deposit remains non-refundable regardless of cancellation.',
      },
      {
        type: 'paragraph',
        text: 'If you cancel your contract within the 14-day cancellation period, we will refund all payments received for the vehicle (excluding the non-refundable deposit where applicable, and including any amount you paid for delivery). However, we are permitted by law to reduce your refund to reflect any reduction in the value of the vehicle, for example costs associated with mileage incurred during the period in which you were responsible for the vehicle.',
      },
      {
        type: 'paragraph',
        text: 'You have a legal obligation to handle and take reasonable care of the vehicle while it is in your possession. If you fail to comply with this obligation, we may have a right of action against you for compensation. If the value of the vehicle is diminished as a result of your use, we may recover such diminished value from you either directly or by reducing the value of any refund due.',
      },
      {
        type: 'paragraph',
        text: 'To cancel your contract under this section, you must inform us of your decision to cancel by 5pm on the 14th day after delivery was accepted by you. This must be done by contacting our customer services team.',
      },
      {
        type: 'paragraph',
        text: 'Your cancellation will be effective from the point at which we collect the vehicle.',
      },
      {
        type: 'paragraph',
        text: 'We will aim to contact you within two days of receiving your cancellation request, including to arrange collection of your vehicle. If you have not heard from us within this time, please contact customer services.',
      },
      {
        type: 'paragraph',
        text: 'Upon cancellation, the vehicle must:',
      },
      {
        type: 'list',
        items: [
          'Be free of all financial charges other than the one created by this contract.',
          'Be in the same condition you received it, not taking into consideration reasonable wear and tear or any mechanical problem that becomes evident after delivery that was not caused by you.',
          'Be without damage or having been in an accident (otherwise we will be entitled to recover from you any loss in value).',
          'Not have incurred excessive mileage from the date of delivery.',
        ],
      },
      {
        type: 'paragraph',
        text: "If you exercise your legal right to cancel, you must promptly return the vehicle's V5 logbook to us and we will issue the refund as soon as possible once we receive the V5 logbook, but in any event within 14 days of us receiving the V5 logbook.",
      },
      {
        type: 'paragraph',
        text: 'We will issue your refund using the payment method which you used to pay for the vehicle.',
      },
      {
        type: 'paragraph',
        text: 'In the event that your payment is refunded but we subsequently discover a defect sustained during your period of ownership, we reserve the right to debit a compensatory amount from your account.',
      },
      {
        type: 'paragraph',
        text: "Please note that this section is not intended to be a full description of all your legal rights. Full details of your rights can be obtained from your local citizens' advice bureau or your local authority's trading standards office.",
      },
    ],
  },
  {
    id: 'vehicle-returns',
    title: '9. Vehicle Returns',
    content: [
      {
        type: 'paragraph',
        text: 'If you exercise your right of refund under these terms, you may purchase a different vehicle from us.',
      },
      {
        type: 'paragraph',
        text: 'In the unlikely event of CNH Cars accepting the return of your vehicle, we will require it to be returned in the same condition as when it was collected or delivered.',
      },
    ],
  },
  {
    id: 'our-liability',
    title: '10. Our Liability',
    content: [
      {
        type: 'paragraph',
        text: 'Nothing in these terms will restrict our liability for death or personal injury resulting from our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be restricted by law, nor will anything in these terms restrict your statutory rights. For further information about your statutory rights, contact your local authority trading standards department or citizens\' advice bureau.',
      },
      {
        type: 'paragraph',
        text: 'We exclude all implied representations, warranties, conditions, and terms (whether implied by statute, common law, or otherwise) to the fullest extent permitted by law.',
      },
      {
        type: 'paragraph',
        text: 'We will not have any liability to you however arising (whether in contract, tort (including but not limited to negligence), for misrepresentation or for breach of any duty (including strict liability or otherwise)) for: (a) any loss of profits or revenue; (b) loss of business; (c) loss of goodwill; (d) loss of or damage to data; or (e) any special, indirect, or consequential loss.',
      },
      {
        type: 'paragraph',
        text: 'Other than as set out above, our maximum aggregate liability to you under or in connection with your order, these terms, and this contract however arising will be limited to an amount equal to the purchase price of the vehicle.',
      },
    ],
  },
  {
    id: 'events-outside-our-control',
    title: '11. Events Outside Our Control',
    content: [
      {
        type: 'paragraph',
        text: 'We will not be liable or responsible for any failure to perform, or delay in performance of, any of our obligations under this contract that is caused by any event or circumstance beyond our reasonable control, including but not limited to fire, flood and other acts of God, strikes, riot, accident, disruption to energy supplies, civil commotion, acts of terrorism or war, breakdown of equipment, inclement weather, availability of the internet or software, acts and omissions of third parties, and road traffic problems (an "Event Outside Our Control").',
      },
      {
        type: 'paragraph',
        text: 'If an Event Outside Our Control takes place that affects the performance of our obligations under this contract: (a) we will contact you as soon as reasonably possible to notify you; (b) our obligations under this contract will be suspended and the time for performance will be extended for the duration of the Event Outside Our Control. Where the event affects delivery of the vehicle, we will arrange a new delivery date with you after the event is over.',
      },
    ],
  },
  {
    id: 'personal-data',
    title: '12. Personal Data',
    content: [
      {
        type: 'paragraph',
        text: 'For details regarding how we collect, use, share, and otherwise process personal information, see our Privacy Policy.',
      },
    ],
  },
  {
    id: 'complaints',
    title: '13. Complaints',
    content: [
      {
        type: 'paragraph',
        text: 'If you have a complaint about CNH Cars, you can contact us as follows:',
      },
      {
        type: 'contact',
        items: [
          { label: 'Email', value: 'chcars24@yahoo.com', href: 'mailto:chcars24@yahoo.com' },
          { label: 'Address', value: '113-115 Codicote Road, Welwyn, Hertfordshire, AL6 9TY' },
        ],
      },
      {
        type: 'paragraph',
        text: 'We will aim to respond within 48 hours.',
      },
    ],
  },
  {
    id: 'general-terms',
    title: '14. General Terms',
    content: [
      {
        type: 'paragraph',
        text: 'If any of these terms are held by any court of competent authority to be unlawful, invalid, or unenforceable, in whole or in part, this will not affect the validity of the remaining terms which will continue to be valid and enforceable to the fullest extent permitted by law.',
      },
      {
        type: 'paragraph',
        text: 'We may transfer our rights and obligations under these terms to another organisation, but this will not affect your rights or our obligations under these terms.',
      },
      {
        type: 'paragraph',
        text: 'Your order, these terms, and the contract constitute the entire agreement and understanding between you and us relating to the subject matter of the same and supersede any prior agreement or understanding. You acknowledge that you have not entered into these terms in reliance on, and shall have no remedies in respect of, any representation or warranty that is not expressly set out in these terms (other than in respect of any fraudulent misrepresentation).',
      },
      {
        type: 'paragraph',
        text: 'These terms and the contract will be governed by English law. Any matter or dispute arising out of or in connection with these terms and the contract (including non-contractual disputes or claims) will be governed by English law. You may bring legal proceedings in the English courts. If you live in Scotland, you may bring legal proceedings in either the Scottish or the English courts. If you live in Northern Ireland, you may bring legal proceedings in either the Northern Irish or the English courts.',
      },
      {
        type: 'paragraph',
        text: 'All information, products, or services displayed is provided without any guarantees, conditions, or warranties as to accuracy. Whilst every effort is made to ensure accuracy, some errors may occur. It is important that you do not rely solely on this information but confirm directly with CNH Cars. No liability lies with CNH Cars for any damage or losses from any errors, mis-selling, or misrepresentation. Any interpretation you place on such information is at your own risk.',
      },
      {
        type: 'note',
        label: 'Business identity',
        text: 'CNH CARS LTD, trading as CNH Cars. Website: cnhcars.co.uk.',
      },
    ],
  },
];
