/* =========================================
   GEEKWAVE PRODUCT DETAIL
   VERSION DINÁMICA
   ========================================= */

let productoActual = null;
let varianteActual = null;
let selectedPlan = "standard";
let quantity = 1;

/* =========================================
   HELPERS
   ========================================= */

function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
}

function getCurrentPrice() {
    if (varianteActual?.precio_usd) {
        return Number(varianteActual.precio_usd);
    }

    return Number(productoActual?.precio_usd || 0);
}

/* =========================================
   GALLERY
   ========================================= */

function renderGallery(images = []) {

    const galleryThumbs =
        document.getElementById("galleryThumbs");

    const mainImage =
        document.getElementById("mainProductImage");

    if (!galleryThumbs || !mainImage)
        return;

    galleryThumbs.innerHTML = "";

    if (!images.length)
        return;

    mainImage.src = images[0];

    images.forEach((imgUrl, index) => {

        const thumb =
            document.createElement("div");

        thumb.className =
            `thumb ${index === 0 ? "active" : ""}`;

        thumb.innerHTML =
            `<img src="${imgUrl}" alt="">`;

        thumb.addEventListener("click", () => {

            mainImage.src = imgUrl;

            document
                .querySelectorAll(".thumb")
                .forEach(t =>
                    t.classList.remove("active")
                );

            thumb.classList.add("active");

        });

        galleryThumbs.appendChild(thumb);

    });

}

/* =========================================
   VARIANTES
   ========================================= */

function renderVariants() {

    const container =
        document.getElementById("flavorContainer");

    const section =
        document.getElementById("variantSection");

    if (!container)
        return;

    const variantes =
        productoActual?.variantes || [];

    if (!variantes.length) {

        container.innerHTML = "";

        if (section) {
            section.style.display = "none";
        }

        return;
    }

    if (section) {
        section.style.display = "";
    }

    container.innerHTML = "";

    variantes.forEach(variant => {

        const button =
            document.createElement("button");

        // marcar activo comparando por nombre (o ajusta a id si existiera)
        button.className =
            `flavor-btn ${varianteActual && varianteActual.nombre === variant.nombre ? "active" : ""}`;

        button.innerHTML =
            `<span>${variant.nombre}</span>`;

        button.addEventListener("click", () => {

            varianteActual = variant;

            updateVariantUI();

            renderVariants();

        });

        container.appendChild(button);

    });

}

/* =========================================
   VARIANT UI
   ========================================= */

function updateVariantUI() {

    const description =
        document.getElementById(
            "productDescription"
        );

    const longDescription =
        document.getElementById(
            "productLongDescription"
        );

    const basePrice =
        document.getElementById(
            "basePrice"
        );

    const bundlePrice =
        document.getElementById(
            "bundlePrice"
        );

    const data =
        varianteActual || productoActual;

    if (!data)
        return;

    const images =
        data.imagenes?.length
            ? data.imagenes
            : data.imagen_principal
                ? [data.imagen_principal]
                : [];

    renderGallery(images);

    if (description) {

        description.textContent =
            data.descripcion ||
            productoActual?.descripcion_tecnica ||
            "";

    }

    if (longDescription) {

        longDescription.textContent =
            data.especificaciones ||
            data.descripcion_tecnica ||
            "";

    }

    const currentPrice =
        getCurrentPrice();

    if (basePrice) {

        basePrice.textContent =
            formatPrice(currentPrice);

    }

    if (bundlePrice) {

        bundlePrice.textContent =
            formatPrice(currentPrice + 50);

    }

}

/* =========================================
   BENEFITS
   ========================================= */

function renderPlanDetails() {

    const benefitsList =
        document.getElementById(
            "benefitsList"
        );

    const cartButton =
        document.getElementById(
            "cartButton"
        );

    const plans = {

        standard: {
            buttonText:
                "AÑADIR AL CARRITO",
            benefits: [
                "Producto principal",
                "Verificado antes del envío",
                "Empaque seguro"
            ]
        },

        bundle: {
            buttonText:
                "AÑADIR AL CARRITO",
            benefits: [
                "Producto principal",
                "Accesorios adicionales (si aplica)",
                "Empaque seguro"
            ]
        }

    };

    const plan =
        plans[selectedPlan] || plans.standard;

    if (benefitsList) {

        benefitsList.innerHTML =
            plan.benefits
                .map(item => `
                    <li>
                        ${item}
                    </li>
                `)
                .join("");

    }

    if (cartButton) {

        cartButton.innerHTML = `
            <span>${plan.buttonText}</span>
        `;

    }

}

/* =========================================
   PRODUCT LOAD
   ========================================= */

async function loadProduct() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        // asumimos que el parámetro se llama "id"
        const productId = params.get("id");

        if (!productId)
            return;

        const response =
            await fetch(
                "json/inventario.json"
            );

        const inventario =
            await response.json();

        const producto =
            inventario.find(
                p => String(p.id) === String(productId)
            );

        if (!producto) {

            console.error(
                "Producto no encontrado"
            );

            return;
        }

        productoActual = producto;

        if (
            producto.variantes &&
            producto.variantes.length
        ) {

            varianteActual =
                producto.variantes[0];

        }

        const title =
            document.getElementById(
                "productTitle"
            );

        if (title) {

            title.textContent =
                producto.nombre;

        }

        updateVariantUI();

        renderVariants();

        renderPlanDetails();

    } catch (error) {

        console.error(
            "Error cargando producto:",
            error
        );

    }

}

/* =========================================
   QUANTITY
   ========================================= */

function setupQuantityControls() {

    const increaseBtn =
        document.getElementById(
            "increaseQty"
        );

    const decreaseBtn =
        document.getElementById(
            "decreaseQty"
        );

    const quantityValue =
        document.getElementById(
            "quantityValue"
        );

    if (
        !increaseBtn ||
        !decreaseBtn ||
        !quantityValue
    )
        return;

    increaseBtn.addEventListener(
        "click",
        () => {

            quantity++;

            quantityValue.textContent =
                String(quantity);

        }
    );

    decreaseBtn.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                quantity--;

                quantityValue.textContent =
                    String(quantity);

            }

        }
    );

}

/* =========================================
   CONFIG SELECTOR
   ========================================= */

function setupPlanSelectors() {

    document
        .querySelectorAll(
            ".config-option"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".config-option"
                        )
                        .forEach(b =>
                            b.classList.remove(
                                "active"
                            )
                        );

                    btn.classList.add(
                        "active"
                    );

                    selectedPlan =
                        btn.dataset.plan || "standard";

                    renderPlanDetails();

                }
            );

        });

}

/* =========================================
   CART
   ========================================= */

function setupCartButton() {

    const cartButton =
        document.getElementById(
            "cartButton"
        );

    if (!cartButton)
        return;

    cartButton.addEventListener(
        "click",
        () => {

            if (!productoActual)
                return;

            const itemName =
                varianteActual
                    ? `${productoActual.nombre} - ${varianteActual.nombre}`
                    : productoActual.nombre;

            if (
                typeof window.addToCart ===
                "function"
            ) {

                window.addToCart(
                    itemName,
                    quantity
                );

            }

        }
    );

}

/* =========================================
   INIT
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupQuantityControls();

        setupPlanSelectors();

        setupCartButton();

        await loadProduct();

    }
);