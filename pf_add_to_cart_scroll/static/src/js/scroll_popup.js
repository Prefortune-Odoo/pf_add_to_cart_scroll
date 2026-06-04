odoo.define('pf_add_to_cart_scroll.scroll_popup', function (require) {
    "use strict";

    var publicWidget = require('web.public.widget');
    publicWidget.registry.PfScrollPopup = publicWidget.Widget.extend({
        selector: "#pf_scroll_popup_wrapper",
        events: {
            "click .pf-add-to-cart-btn": "_onAddToCartClick",
        },

        start: function () {
            var self = this;
            this._super.apply(this, arguments);
            this.popup = this.el.querySelector("#pf_scroll_popup");

            if (!this.popup) return;

            this.originalBtn =
                document.querySelector("#add_to_cart") ||
                document.querySelector("#add_to_cart_wrap .btn") ||
                document.querySelector(".o_wsale_product_btn .btn") ||
                document.querySelector("a[id='add_to_cart']") ||
                document.querySelector("button[id='add_to_cart']") ||
                document.querySelector("form.js_add_cart_json .btn.js_add_cart") ||
                document.querySelector(".js_add_cart");

            if (!this.originalBtn) {
                return;
            }

            this._syncPopupImage();
            this._checkScroll = this._checkScroll.bind(this);
            this._checkScroll();

            window.addEventListener("scroll", this._checkScroll);

            var wrapwrapContainer = document.querySelector("#wrapwrap");
            if (wrapwrapContainer) {
                wrapwrapContainer.addEventListener("scroll", this._checkScroll);
            }

            this._syncPopupData();

            this.popupInterval = setInterval(function () {
                self._syncPopupData();
            }, 450);


            var productForm =
                document.querySelector('form.js_add_cart_json') ||
                document.querySelector('.js_add_to_cart_form') ||
                document.querySelector('#product_details');

            if (productForm) {
                productForm.addEventListener('change', function () {
                    setTimeout(function () {
                        self._syncPopupData();
                    }, 80);
                });
            }

            var priceContainer = document.querySelector('.product_price') || document.querySelector('#product_details');
            if (priceContainer) {
                this.priceObserver = new MutationObserver(function () {
                    self._syncPopupData();
                });
                this.priceObserver.observe(priceContainer, { attributes: true, childList: true, subtree: true });
            }
        },

        destroy: function () {
            window.removeEventListener("scroll", this._checkScroll);
            var wrapwrapContainer = document.querySelector("#wrapwrap");
            if (wrapwrapContainer) {
                wrapwrapContainer.removeEventListener("scroll", this._checkScroll);
            }
            if (this.popupInterval) clearInterval(this.popupInterval);
            if (this.priceObserver) this.priceObserver.disconnect();
            return this._super.apply(this, arguments);
        },

        _syncPopupImage: function () {
            var mainImg =
                document.querySelector(".product_detail_img") ||
                document.querySelector("#o-carousel-product .carousel-item.active img") ||
                document.querySelector(".o_wsale_product_images img");

            var popupImg = this.popup.querySelector(".pf-dynamic-image") || this.popup.querySelector(".pf-popup-img");

            if (mainImg && popupImg && popupImg.src !== mainImg.src) {
                popupImg.src = mainImg.src;
            }
        },

        _syncPopupData: function () {
            var self = this;
            this._syncPopupImage();

            // -------------------------------------------------------------
            // Step 1: Extract Variant Attribute Selections
            // -------------------------------------------------------------
            var selectedValues = [];

            document.querySelectorAll(".js_variant_change:checked, .js_variant_change.active").forEach(function (el) {
                var value = "";
                if (el.getAttribute('title')) {
                    value = el.getAttribute('title').trim();
                } else if (el.dataset.value_name) {
                    value = el.dataset.value_name.trim();
                } else {
                    var label = el.closest("label");
                    if (label) {
                        var badge = label.querySelector('.badge');
                        value = badge ? label.innerText.replace(badge.innerText, '').trim() : label.innerText.trim();
                    }
                }
                if (value && !selectedValues.includes(value)) {
                    value = value.split('+')[0].trim();
                    selectedValues.push(value);
                }
            });

            document.querySelectorAll(".css_attribute_select").forEach(function (select) {
                var option = select.options[select.selectedIndex];
                if (option && option.textContent.trim()) {
                    var value = option.textContent.trim().split('+')[0].trim();
                    if (value && !selectedValues.includes(value)) {
                        selectedValues.push(value);
                    }
                }
            });

            // -------------------------------------------------------------
            // Step 2: Sync Product Clean Title
            // -------------------------------------------------------------
            var pageName = document.querySelector('h1[itemprop="name"]');
            var popupName = this.popup.querySelector(".pf-dynamic-name");
            if (pageName && popupName) {
                popupName.textContent = pageName.textContent.trim();
            }

            // -------------------------------------------------------------
            // Step 3: Inject Variant Text Block Context
            // -------------------------------------------------------------
            var popupVariant = this.popup.querySelector(".pf-dynamic-variant");
            if (popupVariant) {
                if (selectedValues.length > 0) {
                    popupVariant.textContent = "(" + selectedValues.join(", ") + ")";
                    popupVariant.style.display = "block";
                } else {
                    popupVariant.style.display = "none";
                    popupVariant.textContent = "";
                }
            }

            // -------------------------------------------------------------
            // Step 4: Multi-Price Parsing
            // -------------------------------------------------------------
            var popupPriceEl = this.popup.querySelector(".pf-dynamic-price");
            var popupComparePriceEl = this.popup.querySelector(".pf-dynamic-compare-price");
            var popupPriceContainer = this.popup.querySelector(".pf-popup-price-container");

            var salePriceNode =
                document.querySelector(".product_price .oe_price .oe_currency_value") ||
                document.querySelector(".product_price .oe_currency_value:not(.text-decoration-line-through)");

            var baseCompareNode =
                document.querySelector(".product_price .text-decoration-line-through") ||
                document.querySelector(".product_price del") ||
                document.querySelector(".o_wsale_product_price_dec");

            if (salePriceNode && popupPriceEl) {
                var symbolEl = "$";
                var parentOePrice = salePriceNode.closest('.oe_price');
                if (parentOePrice) {
                    symbolEl = parentOePrice.innerText.replace(salePriceNode.innerText, '').replace(/[\d.,\s]+/g, '').trim() || '$';
                }
                popupPriceEl.textContent = symbolEl + " " + salePriceNode.innerText.trim();
            }

            if (baseCompareNode && popupComparePriceEl && baseCompareNode.offsetWidth > 0 && baseCompareNode.offsetHeight > 0) {
                var compareText = baseCompareNode.innerText.trim();
                popupComparePriceEl.textContent = compareText;
                popupComparePriceEl.style.display = "inline-block";
            } else if (popupComparePriceEl) {
                popupComparePriceEl.style.display = "none";
                popupComparePriceEl.textContent = "";
            }

            // -------------------------------------------------------------
            // Step 5: Combination Error Exception Handling Blocks
            // -------------------------------------------------------------
            var popupError = this.popup.querySelector(".pf-popup-error");
            var popupBtn = this.popup.querySelector(".pf-add-to-cart-btn");

            var odooWarningEl = document.querySelector(".css_not_available_msg") || document.querySelector(".o_wsale_no_variant_message");

            var isCombinationInvalid =
                !this.originalBtn ||
                this.originalBtn.disabled ||
                this.originalBtn.classList.contains("disabled") ||
                this.originalBtn.classList.contains("out_of_stock") ||
                (odooWarningEl && odooWarningEl.offsetWidth > 0 && odooWarningEl.offsetHeight > 0);

            if (popupError && popupBtn && isCombinationInvalid) {
                popupError.style.display = "block";
                popupError.innerText = (odooWarningEl && odooWarningEl.innerText.trim()) ? odooWarningEl.innerText.trim() : "This combination does not exist.";
                popupBtn.disabled = true;
                if (popupVariant) popupVariant.style.display = "none";


                if (popupPriceContainer) {
                    popupPriceContainer.style.setProperty("display", "none", "important");
                }
            } else if (popupError && popupBtn) {
                popupError.style.display = "none";
                popupBtn.disabled = false;


                if (popupPriceContainer) {
                    popupPriceContainer.style.removeProperty("display");
                }
            }
        },

        _checkScroll: function () {

            if (!this.originalBtn || !this.popup) return;
            var scrollTop = window.scrollY || document.documentElement.scrollTop;
            var btnOffsetTop = this.originalBtn.getBoundingClientRect().top + scrollTop;
            var btnHeight = this.originalBtn.offsetHeight;
            var rect = this.originalBtn.getBoundingClientRect();
            var isPastButton = rect.bottom < 0;

            if (isPastButton) {

                this._syncPopupData();
                this.popup.classList.add("pf-popup-visible");
            } else {

                this.popup.classList.remove("pf-popup-visible");
            }
        },

        _onAddToCartClick: function (ev) {
            var btn = ev.target.closest(".pf-add-to-cart-btn");
            if (!btn || !this.originalBtn) return;

            this.originalBtn.click();
            var originalText = btn.innerText;

            btn.disabled = true;
            btn.innerText = "Added";

            setTimeout(function () {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 1500);
        },

    });

});
