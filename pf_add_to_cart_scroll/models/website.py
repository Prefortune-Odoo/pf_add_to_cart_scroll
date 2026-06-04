from odoo import fields, models

class Website(models.Model):
    _inherit = "website"

    show_bottom_add_to_cart_popup = fields.Boolean(
        string="Show Bottom Add To Cart Popup",
        default=False,
    )
    popup_style = fields.Selection(
        [
            ("style1", "Style 1 ( Bottom left side )"),
            ("style2", "Style 2 ( bottom full ) "),
            ("style3", "Style 3 ( bottom right side ) "),
        ],
        string="Popup Style",
        default="style1",
    )