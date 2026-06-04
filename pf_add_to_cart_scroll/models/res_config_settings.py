from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    show_bottom_add_to_cart_popup = fields.Boolean(
        related="website_id.show_bottom_add_to_cart_popup",
        readonly=False,
        string="show bottom add to cart popup ",
    )

    popup_style = fields.Selection(
        [
            ("style1", "Style 1 ( Bottom left side )"),
            ("style2", "Style 2 ( bottom full ) "),
            ("style3", "Style 3 ( bottom right side ) "),
        ],
        related="website_id.popup_style",
        readonly=False,
        string="Popup Style",

        required=True,

    )
