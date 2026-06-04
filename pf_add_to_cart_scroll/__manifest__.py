{
    'name': 'Add to Cart Popup on Scroll',
    'version': '14.0.1.0.0',
    'category': 'Website/eCommerce',
    'sequence': -900,
    'summary': 'Show sticky Add to Cart popup when user scrolls past the product button',
    'license': 'OPL-1',
    'description': """
        Displays a sticky bottom popup with Add to Cart button when user scrolls
        past the original Add to Cart button on product pages.
        Supports 3 popup styles selectable from Website Settings.
    """,

    'author': 'Prefortune Technologies LLP',
    'website': 'https://www.prefortune.com/',
    'maintainer': 'Prefortune Technologies LLP',
    'support': 'odoo@prefortune.com',
    'currency': 'EUR',
    'price': '0.00',
    'depends': ['website_sale' , 'website'],

    'data': [

        'views/assets.xml', # JS Load and CSS
        'views/res_config_settings_views.xml',
        'views/product_templates.xml',
    ],
    

    'images': ['static/description/banner.png'],
    'installable': True,
    'application': True,
    'auto_install': False,

}
