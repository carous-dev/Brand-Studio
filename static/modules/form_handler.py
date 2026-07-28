"""
Python implementation of FormHandler.createBrandConfig method
This replicates the JavaScript FormHandler logic in Python
"""

from datetime import datetime
import os
import sys

try:
    from backend.services.color_derive import resolve_colors
except ImportError:
    # This module is imported with static/modules on sys.path; make the
    # project root importable so backend.services resolves.
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from backend.services.color_derive import resolve_colors


def parse_bool_flag(value):
    """Convert mixed truthy/falsey inputs to a strict boolean."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value == 1
    if isinstance(value, str):
        return value.strip().lower() in ('1', 'true', 'yes', 'on')
    return False


def create_brand_config(data, slug, keywords):
    """
    Create brand configuration from form data
    Replicates the JavaScript FormHandler.createBrandConfig method
    """
    # Use domain from form data, don't override it
    domain = data.get('domain', '')
    if not domain:
        # Only construct domain if not provided
        site_url = os.environ.get('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
        domain = f"{site_url}/{slug}"

    location = data.get('location') if isinstance(data.get('location'), dict) else {}
    address = location.get('address') if isinstance(location.get('address'), dict) else {}

    # Build opening hours object
    if isinstance(data.get('openingHours'), dict):
        opening_hours = data.get('openingHours')
    else:
        opening_hours = {
            'monday': data.get('mondayHours', '09:00 - 18:00'),
            'tuesday': data.get('tuesdayHours', '09:00 - 18:00'),
            'wednesday': data.get('wednesdayHours', '09:00 - 18:00'),
            'thursday': data.get('thursdayHours', '09:00 - 18:00'),
            'friday': data.get('fridayHours', '09:00 - 18:00'),
            'saturday': data.get('saturdayHours', '10:00 - 16:00'),
            'sunday': data.get('sundayHours', 'Closed')
        }

    # Build why choose us features from form data (handle old field names)
    why_choose_us_features = []
    # Check for new array structure first
    features_list = None
    if data.get('whyChooseUsFeatures') and isinstance(data.get('whyChooseUsFeatures'), list):
        features_list = data.get('whyChooseUsFeatures', [])
    elif data.get('features') and isinstance(data.get('features'), list):
        features_list = data.get('features', [])

    if features_list is not None:
        for i, feature in enumerate(features_list):
            if feature.get('title') and feature.get('description'):
                why_choose_us_features.append({
                    'id': f"feature-{i + 1}",
                    'title': feature.get('title'),
                    'description': feature.get('description')
                })
    else:
        # Fallback to old field names (feature0Title, feature0Description, etc.)
        for i in range(10):
            title = data.get(f'feature{i}Title')
            description = data.get(f'feature{i}Description')
            if title and description:
                why_choose_us_features.append({
                    'id': f"feature-{i + 1}",
                    'title': title,
                    'description': description
                })

    # Build services from form data (handle old field names)
    services = {'title': data.get('servicesTitle', 'Our Services'), 'items': []}
    
    # Check for services object structure (from stored config)
    if isinstance(data.get('services'), dict) and isinstance(data.get('services', {}).get('items'), list):
        services['title'] = data.get('services', {}).get('title', services['title'])
        for service in data.get('services', {}).get('items', []):
            if isinstance(service, dict) and service.get('title') and service.get('description'):
                services['items'].append({'title': service.get('title'), 'description': service.get('description')})

    # Check for new array structure (from update.html JSON)
    services_list = data.get('services')
    if services_list and isinstance(services_list, list):
        for service in services_list:
            if service.get('title') and service.get('description'):
                services['items'].append({'title': service.get('title'), 'description': service.get('description')})
    
    # Check for new array structure first (from FormData JSON)
    services_json = data.get('services')
    if services_json and isinstance(services_json, str):
        try:
            import json
            services_list = json.loads(services_json)
            if isinstance(services_list, list):
                for service in services_list:
                    if service.get('title') and service.get('description'):
                        services['items'].append({
                            'title': service.get('title'),
                            'description': service.get('description')
                        })
        except (json.JSONDecodeError, TypeError):
            pass
    
    # Fallback to old field names (service0Title, service0Description, etc.)
    # Only run this when we didn't already receive a services list/object.
    if len(services['items']) == 0:
        for i in range(10):
            title = data.get(f'service{i}Title')
            description = data.get(f'service{i}Description')
            if title and description:
                services['items'].append({
                    'title': title,
                    'description': description
                })

    # Deduplicate and drop empty services
    deduped = []
    seen = set()
    for item in services.get('items', []) or []:
        if not isinstance(item, dict):
            continue
        title = (item.get('title') or '').strip()
        description = (item.get('description') or '').strip()
        if not title and not description:
            continue
        key = (title.lower(), description.lower())
        if key in seen:
            continue
        seen.add(key)
        deduped.append({'title': title, 'description': description})
    services['items'] = deduped

    if len(services['items']) == 0:
        services['items'] = [
            {
                'title': 'Finance Options',
                'description': 'Flexible finance plans to suit your needs.'
            },
            {
                'title': 'Car Sales',
                'description': 'Buy quality used cars from our dealership.'
            },
            {
                'title': 'Part Exchange',
                'description': 'Trade in your old car for a great deal.'
            }
        ]

    today = datetime.utcnow().date().isoformat()

    # Build testimonials from form data (handle old field names)
    testimonials = []
    # Check for new array structure first
    if data.get('testimonials') and isinstance(data.get('testimonials'), list):
        for testimonial in data.get('testimonials', []):
            customer = testimonial.get('customer') or testimonial.get('name')
            text = testimonial.get('text') or testimonial.get('review')
            if customer and text:
                testimonials.append({
                    'name': customer,
                    'date': testimonial.get('date') or today,
                    'rating': int(testimonial.get('rating', 5)),
                    'platform': testimonial.get('platform') or 'Google',
                    'review': text
                })
    else:
        # Fallback to old field names (testimonial0Customer, testimon0Text, etc.)
        for i in range(10):
            customer = data.get(f'testimonial{i}Customer') or data.get(f'testimonial{i}Name')
            text = data.get(f'testimonial{i}Text') or data.get(f'testimonial{i}Review')
            rating = data.get(f'testimonial{i}Rating')
            if customer and text:
                testimonials.append({
                    'name': customer,
                    'date': today,
                    'rating': int(rating) if rating else 5,
                    'platform': 'Google',
                    'review': text
                })

    # Build FAQ from form data (handle old field names)
    faq = []
    # Check for new array structure first
    faq_list = None
    if data.get('faqs') and isinstance(data.get('faqs'), list):
        faq_list = data.get('faqs', [])
    elif data.get('faq') and isinstance(data.get('faq'), list):
        faq_list = data.get('faq', [])

    if faq_list is not None:
        for item in faq_list:
            if item.get('question') and item.get('answer'):
                faq.append({
                    'question': item.get('question'),
                    'answer': item.get('answer')
                })
    else:
        # Fallback to old field names (faq0Question, faq0Answer, etc.)
        for i in range(10):
            question = data.get(f'faq{i}Question')
            answer = data.get(f'faq{i}Answer')
            if question and answer:
                faq.append({
                    'question': question,
                    'answer': answer
                })

    # Helper function to convert hex to RGB
    def hex_to_rgb(hex_color):
        if not hex_color or not hex_color.startswith('#'):
            return '0, 0, 0'
        try:
            hex_color = hex_color.lstrip('#')
            return f"{int(hex_color[0:2], 16)}, {int(hex_color[2:4], 16)}, {int(hex_color[4:6], 16)}"
        except:
            return '0, 0, 0'

    theme = data.get('theme') if isinstance(data.get('theme'), dict) else {}
    theme_colors = theme.get('colors') if isinstance(theme.get('colors'), dict) else {}
    theme_id = (
        data.get('themeId')
        or data.get('theme_id')
        or (theme.get('id') if isinstance(theme, dict) else None)
        or (theme.get('themeId') if isinstance(theme, dict) else None)
        or 'classic-dealer'
    )
    aa_approved_dealer = parse_bool_flag(
        data.get('aaApprovedDealer', data.get('aa_approved_dealer'))
    )

    # Get colors from form data. The dashboard now collects a single primary
    # color and the derivation engine generates the whole palette from it
    # (secondary/accent/background + text/surface/border/muted) — that is the
    # from_primary path, gated on colorsAuto. When colorsAuto is off (legacy
    # records / explicit palettes) the non-destructive path keeps whatever
    # colors were sent or stored and only fills missing ones.
    colors_auto = parse_bool_flag(data.get('colorsAuto', theme.get('colorsAuto')))
    resolved_colors = resolve_colors({
        'primaryColor': data.get('primaryColor') or theme_colors.get('primaryColor') or '#c41e3a',
        'secondaryColor': data.get('secondaryColor') or theme_colors.get('secondaryColor') or '#666666',
        'accentColor': data.get('accentColor') or theme_colors.get('accentColor') or '#c41e3a',
        'backgroundColor': data.get('backgroundColor') or theme_colors.get('backgroundColor') or '#ffffff',
        'textColor': data.get('textColor') or theme_colors.get('textColor'),
        'borderColor': data.get('borderColor') or theme_colors.get('borderColor'),
        'mutedColor': data.get('mutedColor') or theme_colors.get('mutedColor'),
        'surfaceColor': data.get('surfaceColor') or theme_colors.get('surfaceColor'),
    }, auto=colors_auto, from_primary=colors_auto)
    primary_color = resolved_colors['primaryColor']
    secondary_color = resolved_colors['secondaryColor']
    accent_color = resolved_colors['accentColor']
    background_color = resolved_colors['backgroundColor']
    text_color = resolved_colors['textColor']
    border_color = resolved_colors['borderColor']
    muted_color = resolved_colors['mutedColor']
    surface_color = resolved_colors['surfaceColor']

    # Fonts (allow override from form fields or existing theme.fonts)
    theme_fonts = theme.get('fonts') if isinstance(theme.get('fonts'), dict) else {}
    ui_font = data.get('fontUi') or theme_fonts.get('ui') or 'Inter, system-ui, sans-serif'
    brand_font = data.get('fontBrand') or theme_fonts.get('brand') or 'Lora, serif'
    mono_font = data.get('fontMono') or theme_fonts.get('mono') or 'JetBrains Mono, Consolas, monospace'

    address_line1 = data.get('address1') or address.get('line1') or ''
    address_line2 = data.get('address2') or address.get('line2') or ''
    city_value = data.get('city') or address.get('city') or location.get('city') or ''
    county_value = data.get('county') or address.get('county') or ''
    postcode_value = data.get('postcode') or address.get('postcode') or location.get('postcode') or ''
    full_address_value = (
        data.get('fullAddress')
        or data.get('address')
        or location.get('fullAddress')
        or ', '.join(p for p in (address_line1, address_line2, city_value, county_value, postcode_value) if p)
    )

    logo_path = data.get('logo') or data.get('logoPath') or f'/images/{slug}-logo.png'
    favicon_path = data.get('favicon') or data.get('faviconPath') or f'/images/{slug}-favicon.png'
    hero_image_path = data.get('heroImage') or data.get('heroImagePath') or '/images/hero-bg.png'

    return {
        # ====== Identity ======
        'slug': slug,
        'name': data.get('name'),
        'tagline': data.get('tagline'),
        'domain': domain,
        'themeId': theme_id,
        'aaApprovedDealer': aa_approved_dealer,
        'logo': logo_path,
        'favicon': favicon_path,
        'heroImage': hero_image_path,
        
        # ====== Contact & Location ======
        'location': {
            'address': {
                'line1': address_line1,
                'line2': address_line2,
                'city': city_value,
                'county': county_value,
                'postcode': postcode_value
            },
            'phone': data.get('phone'),
            'email': data.get('email'),
            'fullAddress': full_address_value
        },
        
        # ====== Social Links ======
        'socialLinks': {
            'facebook': data.get('facebook', ''),
            'instagram': data.get('instagram', ''),
            'youtube': data.get('youtube', ''),
            'linkedin': data.get('linkedin', '')
        },
        
        # ====== Opening Hours ======
        'openingHours': opening_hours,
        
        # ====== About & Description ======
        'aboutUs': {
            'title': data.get('aboutTitle', f'About {data.get("name", "")}'),
            'headline': data.get('aboutHeadline', f'Your trusted car dealership in {data.get("city", "your area")}'),
            'description': data.get('aboutDescription', '')
        },
        
        # ====== Why Choose Us ======
        'whyChooseUs': {
            'title': data.get('whyChooseUsTitle', f'Why Choose {data.get("name", "")}?'),
            'features': why_choose_us_features
        },
        
        # ====== Services ======
        'services': services,
        
        # ====== Testimonials ======
        'testimonials': testimonials,
        
        # ====== FAQ ======
        'faq': faq,
        
        # ====== SEO & Metadata ======
        'seo': {
            'title': data.get('seoTitle', f'{data.get("name", "")} - Used Cars in {data.get("city", "")}'),
            'description': data.get('seoDescription') or data.get('seoDesc', f'{data.get("name", "")} - {data.get("tagline", "")}'),
            'keywords': keywords if isinstance(keywords, list) else [],
            'twitterHandle': data.get('twitterHandle') or data.get('twitter', f'@{slug}'),
            'country': data.get('country', 'GB')
        },
        
        # ====== Email Configuration ======
        'email': {
            'smtpHost': 'smtp.gmail.com',
            'smtpPort': 587,
            'smtpSecure': False,
            'smtpUser': data.get('email'),
            'smtpPass': '',
            'smtpFrom': data.get('email'),
            'smtpFromName': data.get('name')
        },
        
        # ====== API Configuration ======
        'api': {
            'inventorySyncApiKey': 'api-key-123',
            'ollamaApi': 'http://localhost:11434',
            'ollamaChatEndpoint': 'http://localhost:11434/api/chat',
            'ollamaModel': 'qwen3:1.7b'
        },
        
        # ====== Theme Colors (5-Color System + Legacy Compatibility) ======
        'theme': {
            'id': theme_id,
            'themeId': theme_id,
            'colorsAuto': colors_auto,
            'colors': {
                # Core 8 Colors (from Dashboard) - NEW SYSTEM
                'primaryColor': primary_color,
                'secondaryColor': secondary_color,
                'accentColor': accent_color,
                'backgroundColor': background_color,
                'textColor': text_color,
                'borderColor': border_color,
                'mutedColor': muted_color,
                'surfaceColor': surface_color,

                # Background System - LEGACY (derived from 5-color system)
                'bgPrimary': '#ffffff',
                'bgSecondary': '#faf9f7',
                'bgTertiary': '#f3f2ee',
                'bgElevated': '#ffffff',
                'bgGlass': 'rgba(255, 255, 255, 0.8)',

                # Typography - LEGACY (derived from 5-color system)
                'textPrimary': '#1f2933',
                'textSecondary': '#374151',
                'textMuted': '#6b7280',
                'textInverse': '#ffffff',

                # Brand Accents - LEGACY (derived from 5-color system)
                'accentPrimary': primary_color,
                'accentPrimaryRgb': hex_to_rgb(primary_color),
                'accentHover': secondary_color,
                'accentActive': accent_color,
                'accentSoft': primary_color,
                'accentChrome': f'rgba({hex_to_rgb(primary_color)}, 0.15)',
                'accentIvory': f'rgba({hex_to_rgb(primary_color)}, 0.08)',
                'accentLine': primary_color,

                # Status - LEGACY
                'success': '#28a745',
                'warning': '#ffc107',
                'danger': '#dc3545',
                'info': '#17a2b8',

                # Borders - LEGACY (derived from 5-color system)
                'borderSubtle': '#e9ecef',
                'borderDefault': '#dee2e6',
                'borderStrong': '#ced4da',
                'borderAccent': primary_color,

                # Forms - LEGACY (derived from 5-color system)
                'fieldBg': '#ffffff',
                'fieldBorder': '#ced4da',
                'fieldText': '#1f2933'
            },
            'fonts': {
                'ui': ui_font,
                'brand': brand_font,
                'mono': mono_font
            }
        },
        
        # ====== Pages Configuration ======
        'pages': {
            'home': {
                'hero': {
                    'title': data.get('homeHeroTitle') or f'Welcome to {data.get("name", "")}',
                    'description': data.get('homeHeroDescription') or data.get('tagline', 'Quality used cars in your area'),
                    'cta': 'View Our Cars'
                },
                'ctaBanner': {
                    'title': 'Find Your Perfect Car',
                    'description': 'Browse our selection of quality used cars'
                },
                'testimonials': {
                    'eyebrow': 'Customer Reviews',
                    'heading': 'What Our Customers Say',
                    'description': 'Real reviews from satisfied customers'
                },
                'featured': {
                    'title': 'Featured Vehicles',
                    'description': 'Check out our latest arrivals'
                }
            },
            'about': {
                'hero': {
                    'title': f'About {data.get("name", "")}',
                    'description': f'Your trusted car dealership in {data.get("city", "your area")}'
                },
                'story': {
                    'title': 'Our Story',
                    'paragraphs': [
                        f'{data.get("name", "")} has been serving the {data.get("city", "local")} community since 2015.',
                        'We pride ourselves on offering quality vehicles and exceptional customer service.'
                    ]
                },
                'values': {
                    'title': 'Our Values',
                    'items': [
                        {'label': 'Quality', 'description': 'Only the best vehicles make it to our showroom'},
                        {'label': 'Integrity', 'description': 'Honest pricing and transparent service'},
                        {'label': 'Customer Service', 'description': 'Your satisfaction is our priority'}
                    ]
                },
                'cta': {
                    'title': 'Visit Our Showroom',
                    'description': 'Come see our selection of quality used cars',
                    'buttonText': 'Get Directions'
                }
            },
            'services': {
                'hero': {
                    'title': services.get('title', 'Our Services'),
                    'description': 'Comprehensive car dealership services'
                },
                'services': services.get('items', []),
                'faqs': faq
            },
            'contact': {
                'hero': {
                    'title': 'Contact Us',
                    'subtitle': 'Get in touch with our team'
                },
                'info': {
                    'phone': data.get('phone', ''),
                    'email': data.get('email', ''),
                    'address': f"{data.get('address1')}, {data.get('city')}, {data.get('postcode')}",
                    'hours': 'Mon-Fri: 9am-6pm, Sat: 10am-4pm, Sun: Closed'
                }
            }
        },
        
        # ====== Assets ======
        'favicon': f'/images/{slug}-favicon.png',
        'logo': f'/images/{slug}-logo.png'
    }

# Export the function
FormHandler = type('FormHandler', (), {
    'createBrandConfig': staticmethod(create_brand_config)
})
