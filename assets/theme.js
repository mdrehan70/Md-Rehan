// JS

document.addEventListener('DOMContentLoaded', function () {
    const $ = (sel, ctx=document) => ctx.querySelector(sel);
    const $$ = (sel, ctx=document) => Array.from(ctx.querySelector(sel));

    const popup = $('#popupContainer');

    const fallbackImage = "https://cdn.shopify.com/s/files/1/0588/2773/5173/files/product-1.png?v=1755600780";
    const fallbackTitle = 'Product';
    const fallbackPrice = 0;

    const money = (cents) => {
        const n = (cents || 0)/100;
        return new Intl.NumberFormat(undefined, {
            style:'currency',
            currency: Shopify?.currency?.active || 'USD'
        }).format(n);
    };

    const safeParse = (json) => {
        try { return JSON.parse(json);} catch(e){ return null; }
    };

    function openProductPopup(product, productId) {
        console.clear();
        console.log(' Attempting to load product ID:', productId);
        console.log('Product raw data:', product);

        if(!product) {
            console.warn(' Product data missing, showing fallback ');
            product = {
                featured_image: fallbackImage,
                title: fallbackTitle,
                description: '',
                price: fallbackPrice,
                options: [],
                variants: [{ id: null }]
            };
        }

        if(!product.featured_image) {
            console.warn('Missing featured_image for product ID:', productId);
        }
        if(!product.title) {
            console.warn('Missing title for product ID:', productId);
        }
        if(!product.variants || product.variants.length === 0) {
            console.warn('No variants for product ID:', productId);
        }

        
    }
})